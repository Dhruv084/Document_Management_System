const express = require('express');
const router = express.Router();
const Calendar = require('../models/Calendar');
const { protect, authorize } = require('../middleware/auth');

// Get all calendar events
router.get('/', protect, async (req, res) => {
  try {
    const { eventType, startDate, endDate } = req.query;
    
    const query = { isActive: true };
    
    if (eventType) {
      query.eventType = eventType;
    }
    
    if (startDate || endDate) {
      query.$or = [];
      if (startDate) {
        query.$or.push({ startDate: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        query.$or.push({ endDate: { $lte: new Date(endDate) } });
      }
    }

    const events = await Calendar.find(query)
      .populate('createdBy', 'name email role')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single event
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id)
      .populate('createdBy', 'name email role');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create calendar event (Admin and Faculty)
router.post('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { title, description, startDate, endDate, eventType } = req.body;

    const event = await Calendar.create({
      title,
      description,
      startDate,
      endDate,
      eventType: eventType || 'other',
      createdBy: req.user._id
    });

    const populatedEvent = await Calendar.findById(event._id)
      .populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update calendar event (Admin and Faculty - only own events or admin)
router.put('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    let event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (req.user.role === 'faculty' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const { title, description, startDate, endDate, eventType } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.eventType = eventType || event.eventType;

    await event.save();

    const populatedEvent = await Calendar.findById(event._id)
      .populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: populatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete calendar event (Admin and Faculty - only own events or admin)
router.delete('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (req.user.role === 'faculty' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

