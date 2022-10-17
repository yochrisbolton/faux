import { Controller, GET } from 'fastify-decorators'
import { MaintenanceService } from '../services/MaintenanceService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('error')
export class MaintenanceController {
  private readonly MaintenanceService: MaintenanceService = new MaintenanceService()

  @GET('/')
  private async index (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    // TODO: Cache below response (make page generic so no sensitive info is exposed)
    return await this.MaintenanceService.render(req, reply)
  }
}
