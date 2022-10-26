import { FastifyReply, FastifyRequest } from 'fastify'
import striptags from 'striptags'
import { GetArticleInfoById } from '../models/GET/GetArticleInfoById'
import { GetRelatedArticles } from '../models/GET/GetRelatedArticles'
import { UpdateArticleImpressions } from '../models/UPDATE/UpdateArticleImpressions'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { JSDOM } from 'jsdom'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { logger } from 'core/utils/logger'

const opts = {
  points: 3,
  duration: 3600 // 1 hour in seconds
}

const rateLimiter = new RateLimiterMemory(opts)

export class ArticleService {
  public async redirectToFullUrl (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<any> {
    const articleInfo = await GetArticleInfoById(striptags(req.params.id))

    return await res.status(301).redirect(`/article/${req.params.id}/${articleInfo.slug}`)
  }

  /**
   * Render Article page
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   */
  public async render (req: FastifyRequest<WildBody>, res: FastifyReply): Promise<any> {
    const title = striptags(req.params.title)
    const id = striptags(req.params.id)
    const articleInfo = await GetArticleInfoById(id)

    if (articleInfo === null || articleInfo.enabled === false) {
      return await res.status(302).redirect('/lost')
    }

    if (req.meta.siteId !== articleInfo.site) {
      return await res.status(302).redirect('/lost')
    }

    const junk = striptags(req.params['*'])

    const window = new JSDOM('<!DOCTYPE html>').window
    // @ts-expect-error
    const purify = DOMPurify(window)
    const output = purify.sanitize(marked.parse(articleInfo.markdown))
    const domTree = new JSDOM(output).window
    const itemArray: string[] = []

    domTree.document.querySelectorAll('body > *').forEach((elem, index) => {
      itemArray.push(elem.outerHTML)
    })

    // array is spliced so that the first array is muted
    // and the other half is stored in embeddedRelated
    const related = await GetRelatedArticles(articleInfo.site)
    const embeddedRelated = related.splice(0, Math.ceil(related.length / 2))

    articleInfo.markdown = itemArray

    if (title.length === 0 || (junk !== '/' && junk !== '') || title !== articleInfo.slug) {
      return await res.status(301).redirect(`/article/${id}/${articleInfo.slug}`)
    }

    void rateLimiter.consume(req.ip, 1)
      .then(() => {
        void UpdateArticleImpressions(id).catch((err) => {
          logger.log('error', `Unable to update impression count on article ${id}`, err)
        })
      }).catch(() => {
        // ignore
      })

    return await res.view('templates/pages/article/view', { articleInfo: articleInfo, embeddedRelated: embeddedRelated, related: related })
  }
}
