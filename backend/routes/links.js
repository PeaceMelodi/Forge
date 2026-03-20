const express = require('express')
const router = express.Router()
const { createLink, getLinks, updateLink, deleteLink } = require('../controllers/linkController')
const auth = require('../middleware/auth')

router.post('/', auth, createLink)
router.get('/', auth, getLinks)
router.put('/:id', auth, updateLink)
router.delete('/:id', auth, deleteLink)

module.exports = router