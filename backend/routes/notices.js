const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const Notice = require('../models/Notice');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Function to send notice emails to students
const sendNoticeEmails = async (notice, req) => {
  try {
    // Determine which students should receive the email based on targetAudience
    let studentQuery = { role: 'student', isActive: true };
    
    // If targetAudience is 'student' or 'all', send to all students
    // If targetAudience is 'faculty', don't send to students
    const targetAudience = notice.targetAudience || [];
    if (Array.isArray(targetAudience) && !targetAudience.includes('all') && !targetAudience.includes('student')) {
      // Only send if targetAudience includes 'student' or 'all'
      return;
    }

    // Filter students by department if notice has a department
    // Only send emails to students in the same department
    if (notice.department) {
      studentQuery.department = notice.department;
    }

    // Get all active students (filtered by department if notice has one)
    const students = await User.find(studentQuery).select('email name');

    if (!students || students.length === 0) {
      console.log('No students found to send notice emails');
      return;
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Prepare email content
    const postedBy = notice.postedBy?.name || 'Administration';
    const category = notice.category || 'General';
    const expiryInfo = notice.expiryDate 
      ? `\n\nExpiry Date: ${new Date(notice.expiryDate).toLocaleDateString()}`
      : '';

    const emailSubject = `New Notice: ${notice.title}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .notice-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 New Notice from ${postedBy}</h1>
          </div>
          <div class="content">
            <div class="notice-box">
              <h2 style="color: #667eea; margin-top: 0;">${notice.title}</h2>
              <p><strong>Category:</strong> ${category}</p>
              <div style="margin: 15px 0; padding: 15px; background: #f0f0f0; border-radius: 5px; white-space: pre-wrap;">${notice.content}</div>
              ${expiryInfo}
              ${notice.attachments && notice.attachments.length > 0 ? `<p><strong>Attachments:</strong> ${notice.attachments.length} file(s) attached</p>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated email from Document Management System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Notice: ${notice.title}

Posted by: ${postedBy}
Category: ${category}

${notice.content}${expiryInfo}

${notice.attachments && notice.attachments.length > 0 ? `Attachments: ${notice.attachments.length} file(s) attached\n` : ''}

---
This is an automated email from Document Management System.
Please do not reply to this email.
    `;

    // Send emails to all students
    const emailPromises = students.map(student => {
      return transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Document Management System" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      }).catch(err => {
        console.error(`Failed to send email to ${student.email}:`, err);
        // Continue with other emails even if one fails
        return null;
      });
    });

    await Promise.all(emailPromises);
    console.log(`Notice emails sent to ${students.length} student(s)`);
  } catch (error) {
    console.error('Error in sendNoticeEmails:', error);
    throw error;
  }
};

// Get all notices
router.get('/', protect, async (req, res) => {
  try {
    const { category, targetAudience, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Check expiry date
    const expiryCondition = {
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ]
    };

    // Filter by target audience and department based on user role
    if (req.user.role === 'admin') {
      // Admin can see all notices from all departments and all target audiences
      // Only filter by expiry date (don't show expired notices)
      query.$or = expiryCondition.$or;
    } else if (req.user.role === 'student') {
      // Students see notices targeted to students or 'all'
      // Admin-created notices with target audience "all" are visible to all departments
      // Faculty-created notices are only visible to same department
      
      const audienceConditions = [];
      
      // Show notices targeted to students or 'all'
      // We need to fetch notices with target audience "all" or "student"
      // Department filtering will be done after populate based on creator role
      audienceConditions.push({ targetAudience: { $in: [req.user.role, 'all'] } });
      
      // Combine audience conditions with expiry condition
      query.$and = [
        { $or: audienceConditions },
        expiryCondition
      ];
    } else if (req.user.role === 'faculty') {
      // Faculty see notices that match:
      // 1. They created the notice (postedBy = their ID), OR
      // 2. Admin-created notices with target audience "all" (visible to all), OR
      // 3. Faculty-created notices from same department
      
      const accessConditions = [];
      
      // Faculty can always see notices they created
      accessConditions.push({ postedBy: req.user._id });
      
      // Show notices targeted to faculty or 'all'
      // Department filtering will be done after populate based on creator role
      accessConditions.push({ targetAudience: { $in: [req.user.role, 'all'] } });
      
      // Combine access conditions with expiry condition
      query.$and = [
        { $or: accessConditions },
        expiryCondition
      ];
    }

    // Fetch notices with populated creator
    let notices = await Notice.find(query)
      .populate('postedBy', 'name email role')
      .sort({ createdAt: -1 });

    // Filter based on creator role (admin notices visible to all, faculty notices only to same department)
    if (req.user.role === 'student' || req.user.role === 'faculty') {
      notices = notices.filter(notice => {
        const creator = notice.postedBy;
        if (!creator) return false;
        
        // Admin-created notices with target audience "all" are visible to all departments and all roles
        if (creator.role === 'admin') {
          // If target audience is "all", show to everyone
          if (notice.targetAudience && notice.targetAudience.includes('all')) {
            return true;
          }
          // Other admin-created notices are also visible to all (for backward compatibility)
          return true;
        }
        
        // Faculty-created notices: check department match
        if (creator.role === 'faculty') {
          // If notice has no department or user has no department, show it
          if (!notice.department || !req.user.department) {
            return true;
          }
          // Otherwise, check if departments match
          return notice.department === req.user.department;
        }
        
        return true;
      });
    }

    // Apply pagination after filtering
    const total = notices.length;
    const paginatedNotices = notices.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      count: paginatedNotices.length,
      total,
      notices: paginatedNotices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Download notice attachment (must be before /:id route)
router.get('/:noticeId/attachments/:attachmentIndex', protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.noticeId)
      .populate('postedBy', 'name email role');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    const attachmentIndex = parseInt(req.params.attachmentIndex);
    if (!notice.attachments || !notice.attachments[attachmentIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const attachment = notice.attachments[attachmentIndex];

    // Check if user has access to this notice
    // Faculty can always download attachments from their own created notices
    const isCreator = notice.postedBy._id.toString() === req.user._id.toString();
    
    if (req.user.role === 'student' || req.user.role === 'faculty') {
      if (!isCreator) {
        if (req.user.role === 'student' && !notice.targetAudience.includes('all') && 
            !notice.targetAudience.includes('student')) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to download this attachment'
          });
        }
        if (req.user.role === 'faculty' && !notice.targetAudience.includes('all') && 
            !notice.targetAudience.includes('faculty')) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to download this attachment'
          });
        }
        
        // Check department access based on creator role
        const creator = notice.postedBy;
        if (creator && creator.role === 'faculty') {
          // Faculty-created notices: check department match
          if (notice.department && req.user.department && 
              notice.department !== req.user.department) {
            return res.status(403).json({
              success: false,
              message: 'Not authorized to download this attachment'
            });
          }
        }
        // Admin-created notices are visible to all departments (no department check needed)
      }
    }

    // Check if file exists
    if (!fs.existsSync(attachment.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(attachment.path, attachment.filename, (err) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single notice
router.get('/:id', protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('postedBy', 'name email role');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user has access
    // Faculty can always see their own created notices
    const isCreator = notice.postedBy._id.toString() === req.user._id.toString();
    
    if (!isCreator && (!notice.targetAudience.includes('all') && 
        !notice.targetAudience.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this notice'
      });
    }

    // Check department access for students and faculty
    // Admin-created notices with target audience "all" are visible to all departments
    // Faculty-created notices are only visible to same department
    if (!isCreator && (req.user.role === 'student' || req.user.role === 'faculty')) {
      const creator = notice.postedBy;
      
      // Admin-created notices are visible to all, especially if target audience is "all"
      if (creator.role === 'admin') {
        // If target audience is "all", definitely allow access to all
        if (notice.targetAudience && notice.targetAudience.includes('all')) {
          // Allow access - admin notices with target "all" are visible to everyone
        } else {
          // Other admin-created notices are also visible to all
        }
      } else if (creator.role === 'faculty') {
        // Faculty-created notices: check department match
        if (notice.department && req.user.department && 
            notice.department !== req.user.department) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to view this notice'
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create notice (Faculty and Admin)
router.post('/', protect, authorize('admin', 'faculty'), upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, content, category, targetAudience, expiryDate, department } = req.body;

    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.originalname, // Store original filename
          storedFilename: file.filename, // Store multer-generated filename for retrieval
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    // Set department: use from request body if admin, otherwise use faculty's department
    const noticeDepartment = req.user.role === 'admin' && department 
      ? department 
      : req.user.department || null;

    const notice = await Notice.create({
      title,
      content,
      category: category || 'general',
      targetAudience: targetAudience ? targetAudience.split(',') : ['all'],
      postedBy: req.user._id,
      attachments,
      expiryDate: expiryDate || null,
      department: noticeDepartment
    });

    const populatedNotice = await Notice.findById(notice._id)
      .populate('postedBy', 'name email role');

    // Send email notifications to students
    try {
      await sendNoticeEmails(populatedNotice, req);
    } catch (emailError) {
      console.error('Error sending notice emails:', emailError);
      // Don't fail notice creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      notice: populatedNotice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update notice (Faculty and Admin - only own notices or admin)
router.put('/:id', protect, authorize('admin', 'faculty'), upload.array('attachments', 5), async (req, res) => {
  try {
    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check authorization (faculty can only update their own notices)
    if (req.user.role === 'faculty' && notice.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notice'
      });
    }

    const { title, content, category, targetAudience, expiryDate, removeAttachments } = req.body;

    // Handle removal of existing attachments
    if (removeAttachments && removeAttachments.trim() !== '') {
      try {
        const indicesToRemove = JSON.parse(removeAttachments);
        if (Array.isArray(indicesToRemove) && indicesToRemove.length > 0) {
          // Sort in descending order to remove from end first (to maintain correct indices)
          indicesToRemove.sort((a, b) => b - a);
          indicesToRemove.forEach(index => {
            if (index >= 0 && index < notice.attachments.length) {
              // Delete the file from filesystem
              const attachment = notice.attachments[index];
              if (attachment.path && fs.existsSync(attachment.path)) {
                try {
                  fs.unlinkSync(attachment.path);
                } catch (err) {
                  console.error('Error deleting attachment file:', err);
                }
              }
              notice.attachments.splice(index, 1);
            }
          });
        }
      } catch (parseError) {
        console.error('Error parsing removeAttachments:', parseError);
      }
    }

    // Handle new attachments
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        notice.attachments.push({
          filename: file.originalname, // Store original filename
          storedFilename: file.filename, // Store multer-generated filename for retrieval
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.category = category || notice.category;
    notice.targetAudience = targetAudience ? targetAudience.split(',') : notice.targetAudience;
    notice.expiryDate = expiryDate || notice.expiryDate;
    
    // Update department: admin can change it, faculty uses their department
    if (req.user.role === 'admin' && req.body.department !== undefined) {
      notice.department = req.body.department || null;
    } else if (req.user.role === 'faculty' && !notice.department) {
      // If faculty updating their notice and it doesn't have department, set it
      notice.department = req.user.department || null;
    }

    await notice.save();

    const populatedNotice = await Notice.findById(notice._id)
      .populate('postedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      notice: populatedNotice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete notice (Faculty and Admin - only own notices or admin)
router.delete('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('postedBy', 'role _id');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check authorization
    // Faculty can only delete their own notices (not admin-created notices)
    // Admin can delete any notice
    if (req.user.role === 'faculty') {
      const isOwnNotice = notice.postedBy._id.toString() === req.user._id.toString();
      const isAdminCreated = notice.postedBy.role === 'admin';
      
      // Prevent faculty from deleting admin-created notices or notices created by others
      if (isAdminCreated || !isOwnNotice) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this notice'
        });
      }
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

