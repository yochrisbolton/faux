import { Controller, GET, POST } from 'fastify-decorators'
import { ContactService } from '../services/ContactService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/contact')
export class ContactController {
  private readonly ContactService: ContactService = new ContactService()

  /**
   * Contact landing page
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   */
  @GET('', {
    config: {
      rateLimit: {
        max: 60,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async index (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await this.ContactService.render(req, res)
  }

  /**
   * Contact landing page
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   */
  @POST('', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async submit (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await this.ContactService.submit(req, res)
  }
}
