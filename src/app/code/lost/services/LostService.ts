import { GetRelatedArticles } from 'app/code/article/models/GET/GetRelatedArticles'
import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * "We have to go back!"
 * - Jack Shepard, Lost
 */
export class LostService {
  public async render (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    const related = await GetRelatedArticles(req.meta.siteId, 10)
    return await res.status(404).view('templates/pages/lost/not-found', { related: related })
  }
}
