import { Controller, GET, POST } from 'fastify-decorators'
import { SiteService } from '../services/SiteService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/admin/sites')
export class SitesController {
  private readonly SiteService: SiteService = new SiteService()

  @GET('*')
  private async siteGrid (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.SiteService.renderSiteGrid(req, reply)
  }

  @GET('/new')
  private async newSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.SiteService.renderNewSite(req, reply)
  }

  @GET('/:name')
  private async editSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.SiteService.renderNewSite(req, reply)
  }

  @POST('/new', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async postNewSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.SiteService.postSite(req, reply)
  }

  @POST('/update/:name', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async updateSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.SiteService.updateSite(req, reply)
  }

  @POST('/delete/:id', {
    config: {
      rateLimit: {
        max: 1,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async deleteSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.SiteService.deleteSite(req, reply)
  }
}
