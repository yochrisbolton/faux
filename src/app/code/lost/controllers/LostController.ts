import { Controller, GET } from 'fastify-decorators'
import { LostService } from '../services/LostService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('lost')
export class LostController {
  private readonly LostService: LostService = new LostService()

  @GET('/')
  private async index (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    // TODO: Cache below response (make page generic so no sensitive info is exposed)
    return await this.LostService.render(req, reply)
  }
}
