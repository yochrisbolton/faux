import { Request, Response } from 'express'
import { UpdatePromobarMessage } from '../models/UPDATE/UpdatePromobarMessage'
import striptags from 'striptags'

export class AdminService {
  public async render (_req: Request, res: Response): Promise<void> {
    const pageBanner = {
      title: 'Site Settings',
      info: 'Manage site settings like promobar message and featured posts'
    }

    return res.render('templates/pages/admin/admin', { pageBanner: pageBanner })
  }

  public async updateSiteSettings (req: Request, res: Response): Promise<void> {
    const message = striptags(req.body.message ?? '')

    if (message.length > 100) {
      throw new Error('Promobar message too long, must be less than 100 characters')
    }

    await UpdatePromobarMessage(message)

    res.send()
  }
}
