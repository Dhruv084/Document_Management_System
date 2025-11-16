const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single user
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Students can only view their own profile, faculty can view students, admin can view all
    if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user (Admin or self)
router.put('/:id', protect, async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Only admin can change role and isActive
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.isActive;
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get students (Faculty and Admin)
router.get('/students/list', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { department, search, page = 1, limit = 20 } = req.query;
    
    const query = { role: 'student' };
    
    // Faculty can only see students from their department
    // Admin can see all students or filter by department if provided
    if (req.user.role === 'faculty' && req.user.department) {
      query.department = req.user.department;
    } else if (req.user.role === 'admin' && department) {
      query.department = department;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

