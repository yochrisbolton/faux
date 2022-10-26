/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import { Controller, GET, POST } from 'fastify-decorators'
import { SettingsService } from '../services/SettingsService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/admin/settings')
export class SettingsController {
  private readonly SettingsService: SettingsService = new SettingsService()

  @GET('/')
  private async editSettings (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.SettingsService.renderSettings(req, reply)
  }

  @POST('/update/', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: 1000 * 60 * 15 // 15 minutes
        }
      }
  })
  private async updateSettings (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.SettingsService.updateSettings(req, reply)
  }
}
