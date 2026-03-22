const { Resend } = require('resend')
require('dotenv').config()

const resend = new Resend(process.env.RESEND_API_KEY)

const sendReminderEmail = async (to, title, content) => {
  try {
    await resend.emails.send({
      from: 'Forge <onboarding@resend.dev>',
      to,
      subject: `🔔 Forge Reminder: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #111111; color: #ffffff; border-radius: 12px;">
          <h2 style="color: #ffffff; margin-bottom: 8px;">🔔 Reminder</h2>
          <h3 style="color: #aaaaaa; margin-bottom: 16px;">${title}</h3>
          <p style="color: #cccccc; line-height: 1.6;">${content}</p>
          <hr style="border-color: #333333; margin: 24px 0;" />
          <p style="color: #666666; font-size: 12px;">This reminder was sent by Forge.</p>
        </div>
      `
    })
    console.log(`Reminder email sent to ${to}`)
  } catch (error) {
    console.log('Email error:', error.message)
  }
}

module.exports = { sendReminderEmail }