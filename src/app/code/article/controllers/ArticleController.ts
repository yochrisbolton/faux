import { Controller, GET } from 'fastify-decorators'
import { ArticleService } from '../services/ArticleService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/article')
export class ArticleController {
  private readonly ArticleService: ArticleService = new ArticleService()

  /**
   * Article landing page
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   */
  @GET('/:id', {
    config: {
      rateLimit: {
        max: 60,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async index (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await this.ArticleService.redirectToFullUrl(req, res)
  }

  @GET('/:id/:title', {
    config: {
      rateLimit: {
        max: 60,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async indexWithTitle (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await this.ArticleService.render(req, res)
  }

  @GET('/:id/:title/*', {
    config: {
      rateLimit: {
        max: 60,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async indexWithTitleAndWild (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    return await this.ArticleService.render(req, res)
  }
}
