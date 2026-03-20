const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['quick', 'reminder'],
    default: 'quick'
  },
  reminderDate: {
    type: Date,
    default: null
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Note', noteSchema)