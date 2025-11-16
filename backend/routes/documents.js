const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all documents
router.get('/', protect, async (req, res) => {
  try {
    const { category, department, search, page = 1, limit = 10 } = req.query;
    
    const query = { 
      isActive: true,
      $or: [
        { accessLevel: req.user.role },
        { accessLevel: 'all' }
      ]
    };
    
    if (category) query.category = category;
    
    // Filter by department
    // Admin can filter by department if provided
    // Students and faculty: admin documents visible to all, faculty documents only to same department
    if (req.user.role === 'admin' && department) {
      query.department = department;
    }
    // For students and faculty, we'll filter after populate based on creator role
    
    if (search) {
      // Combine accessLevel check with search using $and
      query.$and = [
        {
          $or: [
            { accessLevel: req.user.role },
            { accessLevel: 'all' }
          ]
        },
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }
      ];
      // Remove the original $or since we're using $and now
      delete query.$or;
    }

    // Fetch documents with populated creator
    let documents = await Document.find(query)
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    // Filter based on creator role (admin documents visible to all, faculty documents only to same department)
    if (req.user.role === 'student' || req.user.role === 'faculty') {
      documents = documents.filter(doc => {
        const creator = doc.uploadedBy;
        if (!creator) return false;
        
        // Admin-created documents are visible to all departments
        if (creator.role === 'admin') {
          return true;
        }
        
        // Faculty-created documents: check department match
        if (creator.role === 'faculty') {
          // If document has no department or user has no department, show it
          if (!doc.department || !req.user.department) {
            return true;
          }
          // Otherwise, check if departments match
          return doc.department === req.user.department;
        }
        
        return true;
      });
    }

    const total = documents.length;
    // Apply pagination after filtering
    const paginatedDocuments = documents.slice((page - 1) * limit, page * limit);

    // For students, faculty and admin, also fetch documents attached to notices
    let noticeAttachments = [];
    if (req.user.role === 'student' || req.user.role === 'faculty' || req.user.role === 'admin') {
      // Map notice categories to document categories
      const categoryMap = {
        'academic': 'academic',
        'general': 'other',
        'event': 'other',
        'important': 'administrative'
      };

      const noticeQuery = {
        isActive: true,
        $and: [
          {
            // Filter by target audience - users only see notices targeted to their role or 'all'
            // Admin can see all notices
            targetAudience: req.user.role === 'admin' 
              ? { $exists: true } 
              : { $in: [req.user.role, 'all'] }
          },
          {
            attachments: { $exists: true, $ne: [] }
          },
          {
            $or: [
              { expiryDate: { $exists: false } },
              { expiryDate: null },
              { expiryDate: { $gte: new Date() } }
            ]
          }
        ]
      };

      // For students and faculty, we'll filter notices after populate based on creator role
      // Admin notices are visible to all, faculty notices only to same department

      let notices = await Notice.find(noticeQuery)
        .populate('postedBy', 'name email role')
        .sort({ createdAt: -1 });

      // Filter notices based on creator role (admin notices visible to all, faculty notices only to same department)
      if (req.user.role === 'student' || req.user.role === 'faculty') {
        notices = notices.filter(notice => {
          const creator = notice.postedBy;
          if (!creator) return false;
          
          // Admin-created notices are visible to all departments
          if (creator.role === 'admin') {
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

      // Transform notice attachments into document-like objects
      notices.forEach(notice => {
        if (notice.attachments && notice.attachments.length > 0) {
          notice.attachments.forEach((attachment, index) => {
            // Apply search filter if provided
            if (search) {
              const searchLower = search.toLowerCase();
              const matchesTitle = notice.title.toLowerCase().includes(searchLower);
              const matchesFilename = attachment.filename.toLowerCase().includes(searchLower);
              if (!matchesTitle && !matchesFilename) {
                return; // Skip this attachment if it doesn't match search
              }
            }

            // Apply category filter if provided (map notice category to document category)
            if (category) {
              const mappedCategory = categoryMap[notice.category] || 'other';
              if (mappedCategory !== category) {
                return; // Skip if category doesn't match
              }
            }

            noticeAttachments.push({
              _id: `notice_${notice._id}_${index}`, // Unique ID for notice attachment
              title: attachment.filename,
              description: `Attached to notice: ${notice.title}`,
              filename: attachment.storedFilename || attachment.filename,
              originalName: attachment.filename,
              path: attachment.path,
              mimetype: attachment.mimetype,
              size: attachment.size,
              uploadedBy: notice.postedBy,
              category: categoryMap[notice.category] || 'other',
              accessLevel: ['student'],
              department: notice.department || null, // Include notice department
              tags: [notice.category],
              downloadCount: attachment.downloadCount || 0,
              isActive: true,
              isNoticeAttachment: true, // Flag to identify notice attachments
              noticeId: notice._id.toString(),
              attachmentIndex: index,
              createdAt: notice.createdAt,
              updatedAt: notice.updatedAt
            });
          });
        }
      });
    }

    // Combine regular documents with notice attachments
    const allDocuments = [...paginatedDocuments, ...noticeAttachments];
    
    // Sort combined list by creation date (newest first)
    allDocuments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination to combined results (if notice attachments were added)
    const finalDocuments = noticeAttachments.length > 0 
      ? allDocuments.slice(0, limit)
      : paginatedDocuments;

    res.status(200).json({
      success: true,
      count: finalDocuments.length,
      total: total + noticeAttachments.length,
      documents: finalDocuments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single document
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email role');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access level
    if (!document.accessLevel.includes(req.user.role) && 
        !document.accessLevel.includes('all')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this document'
      });
    }

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Download document
router.get('/:id/download', protect, async (req, res) => {
  try {
    // Check if this is a notice attachment (ID format: notice_<noticeId>_<index>)
    if (req.params.id.startsWith('notice_')) {
      const parts = req.params.id.split('_');
      if (parts.length === 3) {
        const noticeId = parts[1];
        const attachmentIndex = parseInt(parts[2]);

        const notice = await Notice.findById(noticeId)
          .populate('postedBy', 'name email role');

        if (!notice) {
          return res.status(404).json({
            success: false,
            message: 'Notice not found'
          });
        }

        if (!notice.attachments || !notice.attachments[attachmentIndex]) {
          return res.status(404).json({
            success: false,
            message: 'Attachment not found'
          });
        }

        const attachment = notice.attachments[attachmentIndex];

        // Check if user has access to this notice (admin can access all)
        if (req.user.role !== 'admin' && (req.user.role === 'student' || req.user.role === 'faculty')) {
          if (req.user.role === 'student' && !notice.targetAudience.includes('all') && 
              !notice.targetAudience.includes('student')) {
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

        // Check if file exists
        if (!fs.existsSync(attachment.path)) {
          return res.status(404).json({
            success: false,
            message: 'File not found on server'
          });
        }

        // Update download count for this attachment
        if (notice.attachments[attachmentIndex].downloadCount === undefined || 
            notice.attachments[attachmentIndex].downloadCount === null) {
          notice.attachments[attachmentIndex].downloadCount = 0;
        }
        notice.attachments[attachmentIndex].downloadCount += 1;
        await notice.save();

        res.download(attachment.path, attachment.filename, (err) => {
          if (err) {
            res.status(500).json({
              success: false,
              message: 'Error downloading file'
            });
          }
        });
        return;
      }
    }

    // Regular document download
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email role');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access level
    if (!document.accessLevel.includes(req.user.role) && 
        !document.accessLevel.includes('all')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this document'
      });
    }

    // Check department access for students and faculty
    // Admin-created documents are visible to all departments
    // Faculty-created documents are only visible to same department
    if (req.user.role === 'student' || req.user.role === 'faculty') {
      const creator = document.uploadedBy;
      if (creator && creator.role === 'faculty') {
        // Faculty-created documents: check department match
        if (document.department && req.user.department && 
            document.department !== req.user.department) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to download this document'
          });
        }
      }
      // Admin-created documents are visible to all departments (no department check needed)
    }

    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Update download count
    document.downloadCount += 1;
    await document.save();

    res.download(document.path, document.originalName, (err) => {
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

// Upload document (Faculty and Admin)
router.post('/', protect, authorize('admin', 'faculty'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { title, description, category, accessLevel, department, tags } = req.body;

    const document = await Document.create({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      category: category || 'other',
      accessLevel: accessLevel ? accessLevel.split(',') : ['student'],
      department,
      tags: tags ? tags.split(',') : []
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('uploadedBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: populatedDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update document (Faculty and Admin - only own documents or admin)
router.put('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    if (req.user.role === 'faculty' && document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this document'
      });
    }

    const { title, description, category, accessLevel, department, tags } = req.body;

    document.title = title || document.title;
    document.description = description || document.description;
    document.category = category || document.category;
    document.accessLevel = accessLevel ? accessLevel.split(',') : document.accessLevel;
    document.department = department || document.department;
    document.tags = tags ? tags.split(',') : document.tags;

    await document.save();

    const populatedDocument = await Document.findById(document._id)
      .populate('uploadedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      document: populatedDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete document (Faculty and Admin - only own documents or admin)
router.delete('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    if (req.user.role === 'faculty' && document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

