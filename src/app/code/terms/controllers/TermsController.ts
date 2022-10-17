import { FastifyReply, FastifyRequest } from 'fastify'
import { Controller, GET } from 'fastify-decorators'
import { TermsService } from '../services/TermsService'

@Controller('')
export class TermsController {
  private readonly TermsService: TermsService = new TermsService()

  @GET('/privacy-policy')
  private async privacy (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.TermsService.renderPrivacyPolicy(req, reply)
  }

  @GET('/terms-of-service')
  private async terms (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.TermsService.renderTermsOfService(req, reply)
  }

  @GET('/cookie-policy')
  private async cookie (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.TermsService.renderCookiePolicy(req, reply)
  }

  @GET('/acceptable-use-policy')
  private async acceptable (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.TermsService.renderAcceptableUsePolicy(req, reply)
  }
}
