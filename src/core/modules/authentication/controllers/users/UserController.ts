import { Controller, POST, GET } from 'fastify-decorators'
import { UserServices } from 'core/modules/authentication/services/UserServices'
import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * The user controller
 */
@Controller('/api/users')
export class UserController {
  private constructor (
    private readonly AuthService: UserServices = UserServices.getInstance()
  ) { }

  private readonly cookieOptons = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 5, // expire after 5 days
    path: '/'
  }

  /**
   * Register endpoint
   *
   * @param {Request} req
   * @param {Response} res
   * @returns {Response}
   */
  @POST('/register', {
    config: {
      rateLimit: {
        max: 7,
        timeWindow: 60 * 60 * 1000
      }
    }
  })
  private async register (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<Response> {
    try {
      const registerService = await this.AuthService.register(req)

      return await reply.status(200).cookie('auth-token', registerService, this.cookieOptons).send({ token: registerService })
    } catch (e: any) {
      return await reply.status(400).send({ error: e.message })
    }
  }

  /**
   * Login enpoint
   *
   * @param {Request} req
   * @param {Response} res
   * @returns {Response}
   */
  @POST('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: 60 * 60 * 1000
      }
    }
  })
  private async login (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<Response> {
    try {
      const loginService = await this.AuthService.login(req)
      return await reply.status(200).cookie('auth-token', loginService, this.cookieOptons).send({ token: loginService })
    } catch (e: any) {
      return await reply.status(400).send({ error: e.message })
    }
  }

  /**
 * Logout endpoint
 *
   * @param {Request} _req
   * @param {Response} res
 */
  @GET('/logout')
  private async logout (_req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await reply.clearCookie('auth-token')
    await reply.redirect('/')
  }
}
