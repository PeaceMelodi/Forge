const cron = require('node-cron')
const Note = require('../models/Note')
const User = require('../models/User')
const { sendReminderEmail } = require('./mailer')

const startScheduler = () => {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()

      const dueReminders = await Note.find({
        type: 'reminder',
        reminderSent: false,
        reminderDate: { $lte: now }
      })

      for (const note of dueReminders) {
        try {
          // Mark as sent FIRST before sending email
          // This prevents duplicate sends if email takes long
          await Note.findByIdAndUpdate(note._id, { reminderSent: true })

          const user = await User.findById(note.userId)
          if (user) {
            await sendReminderEmail(user.email, note.title, note.content)
            console.log(`Reminder sent for note: ${note.title} to ${user.email}`)
          }
        } catch (noteError) {
          console.log(`Error processing note ${note._id}:`, noteError.message)
        }
      }

    } catch (error) {
      console.log('Scheduler error:', error.message)
    }
  })

  console.log('Reminder scheduler started!')
}

module.exports = { startScheduler }