import { GetRelatedArticles } from 'app/code/article/models/GET/GetRelatedArticles'
import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * "We have to go back!"
 * - Jack Shepard, Lost
 */
export class MaintenanceService {
  public async render (_req: FastifyRequest<WildBody>, res: FastifyReply): Promise<void> {
    const related = await GetRelatedArticles('lost', 10)
    return await res.status(404).view('templates/pages/maintenance/maintenance', { related: related })
  }
}
