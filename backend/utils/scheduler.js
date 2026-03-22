const cron = require('node-cron')
const Note = require('../models/Note')
const User = require('../models/User')
const { sendReminderEmail } = require('./mailer')

const startScheduler = () => {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      // Use UTC now — Render server runs UTC so this is always accurate
      const now = new Date()

      const dueReminders = await Note.find({
        type: 'reminder',
        reminderSent: false,
        reminderDate: { $lte: now }
      })

      for (const note of dueReminders) {
        const user = await User.findById(note.userId)
        if (user) {
          await sendReminderEmail(user.email, note.title, note.content)
          note.reminderSent = true
          await note.save()
          console.log(`Reminder sent for note: ${note.title} to ${user.email}`)
        }
      }

    } catch (error) {
      console.log('Scheduler error:', error.message)
    }
  })

  console.log('Reminder scheduler started!')
}

module.exports = { startScheduler }
