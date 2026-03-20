const Link = require('../models/Link')

// CREATE LINK
const createLink = async (req, res) => {
  try {
    const { title, url, category, description } = req.body

    const link = new Link({
      userId: req.user.id,
      title,
      url,
      category,
      description
    })

    await link.save()
    res.status(201).json({ message: 'Link saved!', link })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET ALL LINKS
const getLinks = async (req, res) => {
  try {
    const { search, category } = req.query

    let query = { userId: req.user.id }

    if (category) query.category = category

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ]
    }

    const links = await Link.find(query).sort({ createdAt: -1 })
    res.json(links)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE LINK
const updateLink = async (req, res) => {
  try {
    const { title, url, category, description } = req.body

    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, url, category, description },
      { new: true }
    )

    if (!link) {
      return res.status(404).json({ message: 'Link not found' })
    }

    res.json({ message: 'Link updated!', link })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE LINK
const deleteLink = async (req, res) => {
  try {
    await Link.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })

    res.json({ message: 'Link deleted!' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createLink, getLinks, updateLink, deleteLink }