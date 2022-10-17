import { FastifyReply, FastifyRequest } from 'fastify'
import { GetSiteList } from '../models/GET/GetSiteList'
import { GetSiteInfoByName } from '../models/GET/GetSiteInfoByName'
import striptags from 'striptags'
import { Database } from 'core/database/Database'
import { logger } from 'core/utils/logger'

export class AdminService {
  public async render (_req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await reply.view('templates/pages/admin/admin')
  }

  public async renderLogin (_req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await reply.view('templates/pages/admin/auth/login')
  }

  public async renderRegister (_req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await reply.view('templates/pages/admin/auth/register')
  }

  public async renderNewSite (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const siteName = striptags(req.params.name) ?? ''
    const siteInfo = await GetSiteInfoByName(siteName)

    return await reply.view('templates/pages/admin/sites/new-site', { siteInfo: siteInfo })
  }

  public async renderNewPost (_req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await reply.view('templates/pages/admin/posts/new')
  }

  public async renderSiteGrid (_req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const siteList = await GetSiteList()
    return await reply.view('templates/pages/admin/sites/grid', { siteList: siteList })
  }

  public async flushCache (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const accepted = [
      'sites',
      'posts',
      'all'
    ]

    const from = striptags(req.params.from)

    // if type not in accepted then do nothing
    if (!accepted.includes(striptags(req.params.type))) {
      return await reply.redirect('/admin/dashboard')
    }

    // clear cache by type
    const type = req.params.type
    if (type === 'all') {
      Database.clearAllRedisCache()
    } else {
      Database.clearRedisCacheThatContains(type)
    }

    logger.log('Info', 'Cache flushed by admin', { type: type })

    // get from param with striptags

    const acceptedFrom = [
      'dashboard',
      'sites',
      'posts'
    ]

    console.log(from)

    // if from not in accepted then do nothing otherwise redirect to from
    if (!acceptedFrom.includes(from)) {
      return await reply.redirect('/admin/dashboard')
    } else {
      return await reply.redirect(`/admin/${from}`)
    }
  }
}
