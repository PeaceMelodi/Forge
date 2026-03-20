const Snippet = require('../models/Snippet')

// CREATE SNIPPET
const createSnippet = async (req, res) => {
  try {
    const { title, code, language, tags } = req.body

    const snippet = new Snippet({
      userId: req.user.id,
      title,
      code,
      language,
      tags
    })

    await snippet.save()
    res.status(201).json({ message: 'Snippet saved!', snippet })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET ALL SNIPPETS
const getSnippets = async (req, res) => {
  try {
    const { search, language } = req.query

    let query = { userId: req.user.id }

    if (language) query.language = language

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    const snippets = await Snippet.find(query).sort({ createdAt: -1 })
    res.json(snippets)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET ONE SNIPPET
const getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' })
    }

    res.json(snippet)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE SNIPPET
const updateSnippet = async (req, res) => {
  try {
    const { title, code, language, tags } = req.body

    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, code, language, tags },
      { new: true }
    )

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' })
    }

    res.json({ message: 'Snippet updated!', snippet })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE SNIPPET
const deleteSnippet = async (req, res) => {
  try {
    await Snippet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })

    res.json({ message: 'Snippet deleted!' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createSnippet, getSnippets, getSnippet, updateSnippet, deleteSnippet }