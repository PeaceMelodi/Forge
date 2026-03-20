const Note = require('../models/Note')

// CREATE NOTE
const createNote = async (req, res) => {
  try {
    const { title, content, type, reminderDate } = req.body

    const note = new Note({
      userId: req.user.id,
      title,
      content,
      type,
      reminderDate: type === 'reminder' ? reminderDate : null
    })

    await note.save()
    res.status(201).json({ message: 'Note saved!', note })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET ALL NOTES
const getNotes = async (req, res) => {
  try {
    const { search, type } = req.query

    let query = { userId: req.user.id }

    if (type) query.type = type

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    const notes = await Note.find(query).sort({ createdAt: -1 })
    res.json(notes)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET ONE NOTE
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json(note)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE NOTE
const updateNote = async (req, res) => {
  try {
    const { title, content, type, reminderDate } = req.body

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        title,
        content,
        type,
        reminderDate: type === 'reminder' ? reminderDate : null
      },
      { new: true }
    )

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json({ message: 'Note updated!', note })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE NOTE
const deleteNote = async (req, res) => {
  try {
    await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })

    res.json({ message: 'Note deleted!' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createNote, getNotes, getNote, updateNote, deleteNote }