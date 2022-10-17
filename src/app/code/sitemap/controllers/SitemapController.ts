import { Controller, GET } from 'fastify-decorators'
import { SitemapService } from '../services/SitemapService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/sitemap.xml')
export class SitemapController {
  private readonly SitemapService: SitemapService = new SitemapService()

  /**
   * Sitemap landing page
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   */
  @GET('*', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async index (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await this.SitemapService.render(req, res)
  }
}
