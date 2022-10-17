import { UserServices } from 'core/modules/authentication/services/UserServices'
import { FastifyReply, FastifyRequest } from 'fastify'
import { GetPostList } from '../models/GET/GetPostList'
import { GetSiteList } from '../models/GET/GetSiteList'
import { GetSiteAuthorList } from '../models/GET/GetSiteAuthorList'
import { GetPostInfoById } from '../models/GET/GetPostInfoById'
import { InsertNewPostModel } from '../models/INSERT/InsertNewPostModel'
import { UpdatePostModel } from '../models/UPDATE/UpdatePostModel'
import { DeletePostById } from '../models/DELETE/DeletePostById'
import { GetTotalPostCount } from '../models/GET/GetTotalPostCount'
import striptags from 'striptags'
import slugify from 'slugify'
import { SortDirection } from 'mongodb'

export class PostService {
  public async renderNewPost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const siteList = await GetSiteList()
    const postId = striptags(req.params.id) ?? ''
    const postInfo = postId !== '' ? await GetPostInfoById(postId) : null
    const authorList = postInfo !== null ? await GetSiteAuthorList(postInfo.site) : []

    return await reply.view('templates/pages/admin/posts/new', { siteList: siteList, postInfo: postInfo, authorList })
  }

  public async renderPostGrid (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const siteList = await GetSiteList()

    const sort = striptags(req.query.sort) ?? ''
    const site = striptags(req.query.site) ?? ''
    const title = striptags(req.query.title) ?? ''
    let order: SortDirection = 'desc'

    const filters: {[key: string]: any} = {}

    if (sort !== '') {
      filters.sort = sort

      if (sort === 'title') {
        order = 'asc'
      }
    }

    if (site !== '') {
      filters.site = site
    }

    if (title !== '') {
      filters.title = { $regex: `.*${title}.*`, $options: 'i' }
    }

    const page = !Number.isNaN(parseInt(striptags(req.query.page))) ? parseInt(striptags(req.query.page)) : 0
    const postsPerPage = 25

    const postList = await GetPostList({
      title: filters.title ?? { $regex: '.*.', $options: 'i' },
      site: filters.site ?? { $regex: '.*.', $options: 'i' }
    }, filters.sort ?? 'default', order, (postsPerPage * page), postsPerPage)

    const pagination = {
      total: await GetTotalPostCount({
        title: filters.title ?? { $regex: '.*.', $options: 'i' },
        site: filters.site ?? { $regex: '.*.', $options: 'i' }
      }),
      page: page,
      start: (postsPerPage * page),
      end: (postsPerPage * page) + postList.length
    }

    filters.title = title

    return await reply.view('templates/pages/admin/posts/grid', { siteList: siteList, postList: postList, filters: filters, pagination: pagination })
  }

  private async processPost (req: FastifyRequest<WildBody>, reply: FastifyReply, update: boolean = false): Promise<void> {
    const enabled = striptags(req.body.enabled) === 'true'
    const site = striptags(req.body.site)
    const author = striptags(req.body.author)
    const postId = striptags(req.params.id)
    const title = striptags(req.body.title)
    const summary = striptags(req.body.summary)
    const markdown = striptags(req.body.markdown)
    const hero = striptags(req.body.hero)
    const showHero = striptags(req.body['show-hero']) === 'true'
    const authToken = req.cookies['auth-token'] ?? ''
    const username = await UserServices.getInstance().getUsernameByToken(authToken)
    const slug = slugify(title, { lower: true })

    if (title.length < 5) {
      throw new Error('Title must be at least 5 characters')
    }

    if (markdown.length < 5) {
      throw new Error('Markdown must be at least 5 characters')
    }

    if (summary.length > 400) {
      throw new Error('Summary must be less than 200 characters')
    }

    if (hero.length < 5) {
      throw new Error('Hero must be at least 5 characters')
    }

    if (site === '') {
      throw new Error('Missing site')
    }

    if (postId === '' && update) {
      throw new Error('Missing post id')
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g

    if (hero !== '' && !urlRegex.test(hero)) {
      throw new Error('Hero must be a valid URL')
    }

    if (update) {
      await UpdatePostModel(
        postId,
        enabled,
        slug,
        site,
        author,
        title,
        summary,
        markdown,
        username,
        hero,
        showHero
      )
    } else {
      await InsertNewPostModel(
        enabled,
        slug,
        site,
        author,
        title,
        summary,
        markdown,
        username,
        hero,
        showHero
      )
    }

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/posts' })
  }

  public async post (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await this.processPost(req, reply)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/posts' })
  }

  public async deletePost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const postId = striptags(req.params.id) ?? ''

    if (postId === '') {
      throw new Error('Missing post id')
    }

    await DeletePostById(postId)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/posts' })
  }

  public async updatePost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await this.processPost(req, reply, true)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/posts' })
  }

  public async getSiteAuthors (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const site = striptags(req.params.id) ?? ''
    const authorList = await GetSiteAuthorList(site)

    await reply.status(200).send({ message: 'ok', authorList: authorList })
  }
}
