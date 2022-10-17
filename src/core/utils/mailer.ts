import nodemailer from 'nodemailer'

export const sendMessage = async function (args: {
  from: string
  to: string
  subject: string
  text: string
}): Promise<void> {
  const host = process.env.SMTP_HOST ?? ''
  const port = Number(process.env.SMTP_PORT) ?? 0
  const user = process.env.SMTP_USER ?? ''
  const pass = process.env.SMTP_PASS ?? ''

  if (host !== '' && port !== 0 && user !== '' && pass !== '') {
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: true,
      auth: {
        user: user,
        pass: pass
      }
    })

    await transporter.sendMail({
      from: args.from,
      to: args.to,
      subject: args.subject,
      text: args.text
    })
  } else {
    throw new Error('Missing mailer info')
  }
}
