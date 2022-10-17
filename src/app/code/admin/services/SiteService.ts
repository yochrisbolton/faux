import { UserServices } from 'core/modules/authentication/services/UserServices'
import { FastifyReply, FastifyRequest } from 'fastify'
import { InsertNewSiteModel } from '../models/INSERT/InsertNewSiteModel'
import { GetDoesSiteExistByName } from '../models/GET/GetDoesSiteExistByName'
import { GetDoesSiteExistByDomain } from '../models/GET/GetDoesSiteExistByDomain'
import { GetSiteList } from '../models/GET/GetSiteList'
import { GetSiteInfoByName } from '../models/GET/GetSiteInfoByName'
import { GetSiteNameById } from '../models/GET/GetSiteNameById'
import { GetSiteDomainById } from '../models/GET/GetSiteDomainById'
import { UpdateSiteModel } from '../models/UPDATE/UpdateSiteModel'
import { DeleteSiteById } from '../models/DELETE/DeleteSiteById'
import striptags from 'striptags'

export class SiteService {
  public async renderSiteGrid (_req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const siteList = await GetSiteList()
    return await reply.view('templates/pages/admin/sites/grid', { siteList: siteList })
  }

  public async renderNewSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const siteName = striptags(req.params.name) ?? ''
    const siteInfo = await GetSiteInfoByName(siteName)

    return await reply.view('templates/pages/admin/sites/new-site', { siteInfo: siteInfo })
  }

  private async processSite (req: FastifyRequest<WildBody>, reply: FastifyReply, update: boolean = false): Promise<void> {
    /** the required items */
    const domainName = striptags(req.body['domain-name'])
    const siteName = striptags(req.body['site-name'])
    const authToken = striptags(req.cookies['auth-token'] ?? '')
    const siteDisclaimer = striptags(req.body['site-disclaimer'] ?? '')
    const siteMetaDescription = striptags(req.body['site-meta-description'])
    const authorList = []

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

    for (const property in req.body) {
      if (property.startsWith('author-name-')) {
        const selectId = property.replace('author-name-', '')
        const authorImage = striptags(req.body[`author-image-${selectId}`])
        const authorName = striptags(req.body[`author-name-${selectId}`])
        const authorId = striptags(req.body[`author-id-${selectId}`])

        if (authorName.length < 3 || authorImage.length < 3 || authorId.length < 3) {
          throw new Error('Author name and image are required')
        }

        authorList.push({
          id: authorId,
          name: authorName,
          image: authorImage
        })
      }
    }

    if (authorList.length < 1) {
      throw new Error('Must have at least one author')
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

    if (await GetDoesSiteExistByName(siteName)) {
      if (update) {
        if (await GetSiteNameById(siteId) !== siteName) {
          throw new Error('Site already exists or unable to edit')
        }
      } else {
        throw new Error('Site already exists')
      }
    }

    if (await GetDoesSiteExistByDomain(domainName)) {
      if (update) {
        if (await GetSiteDomainById(siteId) !== domainName) {
          throw new Error('Domain already exists or unable to edit')
        }
      } else {
        throw new Error('Domain already exists')
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
        authorList,
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
        authorList,
        newsletterHook
      )
    }
  }

  public async postSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await this.processSite(req, reply)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/sites' })
  }

  public async updateSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await this.processSite(req, reply, true)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/sites' })
  }

  public async deleteSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const siteId = striptags(req.params.id) ?? ''

    if (siteId === '') {
      throw new Error('Missing site id')
    }

    await DeleteSiteById(siteId)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/sites' })
  }
}
