import { Controller, GET } from 'fastify-decorators'
import { HomepageService } from '../services/HomepageService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/')
export class HomepageController {
  private readonly HomepageService: HomepageService = new HomepageService()

  @GET('/', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async index (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.HomepageService.render(req, reply)
  }

  @GET('/home', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async home (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.HomepageService.render(req, reply)
  }
}
