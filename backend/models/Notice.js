const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'event', 'important'],
    default: 'general'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetAudience: {
    type: [String],
    enum: ['admin', 'faculty', 'student', 'all'],
    default: ['all']
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    downloadCount: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  },
  department: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notice', noticeSchema);

