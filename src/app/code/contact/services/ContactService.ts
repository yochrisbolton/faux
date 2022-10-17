import { sendMessage } from 'core/utils/mailer'
import { FastifyReply, FastifyRequest } from 'fastify'
import striptags from 'striptags'

export class ContactService {
  private readonly MAX_NAME_LENGTH = 50
  private readonly MAX_MESSAGE_LENGTH = 500
  private readonly MAX_EMAIL_LENGTH = 100

  public async render (_req: FastifyRequest<WildBody>, res: FastifyReply): Promise<any> {
    return await res.view('templates/pages/contact/view')
  }

  public async submit (_req: FastifyRequest<WildBody>, res: FastifyReply): Promise<any> {
    const name = striptags(_req.body.name)
    const email = striptags(_req.body.email)
    const message = striptags(_req.body.message)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

    if ((name.length === 0) || (email.length === 0) || (message.length === 0)) {
      return await res.view('templates/pages/contact/view', {
        error: 'Please fill in all fields'
      })
    }

    if (name.length > this.MAX_NAME_LENGTH) {
      return await res.view('templates/pages/contact/view', {
        error: 'Name is too long'
      })
    }

    if (email.length > this.MAX_EMAIL_LENGTH) {
      return await res.view('templates/pages/contact/view', {
        error: 'Email is too long'
      })
    }

    if (message.length > this.MAX_MESSAGE_LENGTH) {
      return await res.view('templates/pages/contact/view', {
        error: 'Message is too long'
      })
    }

    if (!emailRegex.test(email)) {
      return await res.view('templates/pages/contact/view', {
        error: 'Email is invalid'
      })
    }

    if (name.length < 3) {
      return await res.view('templates/pages/contact/view', {
        error: 'Please enter a name that is at least 3 characters long.'
      })
    }

    if (email.length < 3) {
      return await res.view('templates/pages/contact/view', {
        error: 'Please enter a valid email address.'
      })
    }

    if (message.length < 25) {
      return await res.view('templates/pages/contact/view', {
        error: 'Please enter a message that is at least 25 characters long.'
      })
    }

    if (
      process.env.MAILER_EMAIL != null &&
      process.env.MAILER_EMAIL.length > 0 &&
      emailRegex.test(process.env.MAILER_EMAIL)
    ) {
      void sendMessage({
        from: `contact@${_req.hostname}`,
        to: process.env.MAILER_EMAIL,
        subject: 'Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
      })
    } else {
      // to the void... make sure to add the mailer email to your .env file
    }

    return await res.view('templates/pages/contact/view', {
      success: 'Your message has been sent.'
    })
  }
}
