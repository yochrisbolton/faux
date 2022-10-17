import { GetRelatedArticles } from 'app/code/article/models/GET/GetRelatedArticles'
import { FastifyReply, FastifyRequest } from 'fastify'

export class HomepageService {
  public async render (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    const relatedArticles = await GetRelatedArticles(req.meta.siteId, 10)
    return await res.view('templates/pages/homepage/index', { relatedArticles: relatedArticles })
  }
}
