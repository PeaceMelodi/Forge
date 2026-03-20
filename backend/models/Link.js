const mongoose = require('mongoose')

const linkSchema = new mongoose.Schema({
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
  url: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['documentation', 'tutorial', 'tool', 'article', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Link', linkSchema)