import { UserServices } from 'core/modules/authentication/services/UserServices'
import { FastifyReply, FastifyRequest } from 'fastify'
import { InsertNewSiteModel } from '../models/INSERT/InsertNewSiteModel'
import { UpdateSiteModel } from '../models/UPDATE/UpdateSiteModel'
import { GetSiteInfo } from '../models/GET/GetSiteInfo'
import striptags from 'striptags'

export class SettingsService {
  public async renderSettings (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    let siteInfo = {}
    try {
      siteInfo = await GetSiteInfo()
    } catch (e) {
      // ignore
    }

    return await reply.view('templates/pages/admin/settings/view', { siteInfo: siteInfo })
  }

  private async processSettings (req: FastifyRequest<WildBody>, reply: FastifyReply, update: boolean = false): Promise<void> {
    /** the required items */
    const domainName = striptags(req.body['domain-name'])
    const siteName = striptags(req.body['site-name'])
    const authToken = striptags(req.cookies['auth-token'] ?? '')
    const siteDisclaimer = striptags(req.body['site-disclaimer'] ?? '')
    const siteMetaDescription = striptags(req.body['site-meta-description'])

    if (domainName.length < 3) {
      throw new Error('Domain name is invalid')
    }

    if (siteName.length < 3) {
      throw new Error('Site name is too short')
    }

    if (authToken.length < 3) {
      throw new Error('Auth token is invalid, are you logged in?')
    }

    if (siteDisclaimer.length < 10) {
      throw new Error('Must provide a site dislcaimer. Must be at least 10 characters.')
    }

    if (siteMetaDescription.length < 10) {
      throw new Error('Must provide a site meta description. Must be at least 10 characters.')
    }

    /** the optional items */
    const siteId = striptags(req.body['site-id'])
    const mainColor = striptags(req.body['main-color'])
    const secondaryColor = striptags(req.body['secondary-color'])
    const accentColor = striptags(req.body['accent-color'])
    const siteEnabled = striptags(req.body.enabled) === 'true'
    const siteMetaTitle = striptags(req.body['site-meta-title'])
    const siteMetaImage = striptags(req.body['site-meta-image'])
    const customCss = striptags(req.body['custom-css'])
    let newsletterHook = striptags(req.body['newsletter-hook'])

    const username = await UserServices.getInstance().getUsernameByToken(authToken)

    if (newsletterHook.length < 3) {
      if (newsletterHook === '') {
        newsletterHook = 'Would you like to know more?'
      } else {
        throw new Error('Newsletter hook must be at least 3 characters')
      }
    }

    if (update) {
      await UpdateSiteModel(
        siteId,
        siteName,
        mainColor,
        secondaryColor,
        accentColor,
        siteEnabled,
        domainName,
        username,
        siteMetaDescription,
        siteMetaTitle,
        siteMetaImage,
        customCss,
        siteDisclaimer,
        newsletterHook
      )
    } else {
      await InsertNewSiteModel(
        siteName,
        mainColor,
        secondaryColor,
        accentColor,
        siteEnabled,
        domainName,
        username,
        siteMetaDescription,
        siteMetaTitle,
        siteMetaImage,
        customCss,
        siteDisclaimer,
        newsletterHook
      )
    }
  }

  public async postSettings (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await this.processSettings(req, reply)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/settings' })
  }

  public async updateSettings (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await this.processSettings(req, reply, true)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/settings' })
  }
}
