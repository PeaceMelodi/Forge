const express = require('express')
const router = express.Router()
const { createNote, getNotes, getNote, updateNote, deleteNote } = require('../controllers/noteController')
const auth = require('../middleware/auth')

router.post('/', auth, createNote)
router.get('/', auth, getNotes)
router.get('/:id', auth, getNote)
router.put('/:id', auth, updateNote)
router.delete('/:id', auth, deleteNote)

module.exports = router