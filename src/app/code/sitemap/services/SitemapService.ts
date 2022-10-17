import { FastifyReply, FastifyRequest } from 'fastify'
import striptags from 'striptags'
import { SitemapStream, streamToPromise } from 'sitemap'
import { createGzip } from 'zlib'
import { GetEnabledArticlesBySiteId } from '../models/GET/GetEnabledArticlesBySiteId'
import { GetSiteInfoByDomain } from 'app/code/admin/models/GET/GetSiteInfoByDomain'

export class SitemapService {
  public async render (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<any> {
    const site = striptags(req.hostname)

    let siteInfo: any

    if (site.includes('localhost:')) {
      siteInfo = await GetSiteInfoByDomain({ $regex: '.*.', $options: 'i' })
    } else {
      siteInfo = await GetSiteInfoByDomain(site)
    }

    const articles = await GetEnabledArticlesBySiteId(siteInfo.human_id)

    if (articles.length === 0) {
      return await res.status(451).send('Temporary error - please try again later')
    }

    const sitemap = new SitemapStream({
      hostname: `https://${site}`
    })

    for (const article of articles) {
      sitemap.write({
        url: `/article/${article.human_id}/${article.slug}`,
        lastmod: article.updatedAt
      })
    }

    sitemap.end()

    const sitemapGz = createGzip()

    sitemap.pipe(sitemapGz)

    void res.header('Content-Type', 'application/xml')
    void res.header('Content-Encoding', 'gzip')

    const gziped = await streamToPromise(sitemapGz)

    return await res.send(gziped)
  }
}
