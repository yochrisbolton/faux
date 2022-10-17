import { Controller, GET, POST } from 'fastify-decorators'
import { AdminService } from '../services/AdminService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/admin')
export class AdminController {
  private readonly AdminService: AdminService = new AdminService()

  @GET('*')
  private async index (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await reply.redirect('/admin/dashboard')
  }

  @GET('/login')
  private async login (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.AdminService.renderLogin(req, reply)
  }

  @GET('/register')
  private async register (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.AdminService.renderRegister(req, reply)
  }

  @GET('/dashboard')
  private async dashboard (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.AdminService.render(req, reply)
  }

  @POST('/cache/flush/:type/:from')
  private async flushCache (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    // clear cache by type
    return await this.AdminService.flushCache(req, reply)
  }
}
