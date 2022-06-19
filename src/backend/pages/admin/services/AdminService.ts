import { Request, Response } from 'express'
import { GetSiteRestrictions } from '../models/GET/GetSiteRestrictions'
import { UpdatePromobarMessage } from '../models/UPDATE/UpdatePromobarMessage'
import { UpdateSiteRestrictions } from '../models/UPDATE/UpdateSiteRestrictions'
import striptags from 'striptags'

export class AdminService {
  public async render (_req: Request, res: Response): Promise<void> {
    const pageBanner = {
      title: 'Site Settings',
      info: 'Manage site settings like promobar message and featured posts'
    }

    let siteRestrictions = {}
    try {
      siteRestrictions = await GetSiteRestrictions()
    } catch (e) {
      // ignore
    }

    return res.render('templates/pages/admin/admin', { pageBanner: pageBanner, siteRestrictions: siteRestrictions })
  }

  public async updateSiteSettings (req: Request, res: Response): Promise<void> {
    const message = striptags(req.body.message ?? '')
    const disableNewAccounts = Boolean(req.body.disable_new_accounts ?? false)
    const disableNewComments = Boolean(req.body.disable_new_comments ?? false)

    if (message.length > 100) {
      throw new Error('Promobar message too long, must be less than 100 characters')
    }

    await UpdatePromobarMessage(message)
    await UpdateSiteRestrictions(disableNewAccounts, disableNewComments)

    res.send()
  }
}
