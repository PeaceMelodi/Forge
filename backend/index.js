require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { startScheduler } = require('./utils/scheduler')

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected!')
    startScheduler()
  })
  .catch(err => console.log('MongoDB error:', err.message))

app.get('/', (req, res) => {
  res.json({ message: 'Forge API is running!' })
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/snippets', require('./routes/snippets'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/links', require('./routes/links'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Forge running on port ${PORT}`))