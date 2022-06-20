import { ClassMiddleware, Controller, Get, Middleware, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { CheckIfUserAdminAndRedirectIfNot } from 'core/modules/authentication/middleware/CheckIfUserAdminAndRedirectIfNot'
import { CheckIfUserExistAndRedirect } from 'core/modules/authentication/middleware/CheckIfUserExistAndRedirect'
import { AdminService } from '../services/AdminService'

const siteActionRateLimit = rateLimit({
  windowMs: 1000 * 60 * 15, // 15 minutes
  max: 10, // start blocking after x requests
  message: JSON.stringify({ error: 'You\'re doing that too much, please try again later' })
})

@Controller('admin')
@ClassMiddleware([CheckIfUserExistAndRedirect('/register', false), CheckIfUserAdminAndRedirectIfNot('/404')])
export class AdminController {
  private readonly AdminService: AdminService = new AdminService()

  @Get('/')
  private async index (req: Request, res: Response): Promise<void> {
    return await this.AdminService.render(req, res)
  }

  @Post('update/settings')
  @Middleware(siteActionRateLimit)
  private async updateSiteSettings (req: Request, res: Response): Promise<void> {
    return await this.AdminService.updateSiteSettings(req, res)
  }
}
