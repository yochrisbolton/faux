import { FastifyReply, FastifyRequest } from 'fastify'

export class TermsService {
  public async render (_req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await res.view('templates/pages/terms/privacy-policy')
  }

  public async renderPrivacyPolicy (_req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await res.view('templates/pages/terms/privacy-policy')
  }

  public async renderTermsOfService (_req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await res.view('templates/pages/terms/terms-of-service')
  }

  public async renderCookiePolicy (_req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await res.view('templates/pages/terms/cookie-policy')
  }

  public async renderAcceptableUsePolicy (_req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await res.view('templates/pages/terms/acceptable-use-policy')
  }
}
