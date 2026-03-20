const express = require('express')
const router = express.Router()
const { createSnippet, getSnippets, getSnippet, updateSnippet, deleteSnippet } = require('../controllers/snippetController')
const auth = require('../middleware/auth')

router.post('/', auth, createSnippet)
router.get('/', auth, getSnippets)
router.get('/:id', auth, getSnippet)
router.put('/:id', auth, updateSnippet)
router.delete('/:id', auth, deleteSnippet)

module.exports = router