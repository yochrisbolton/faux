import { UserServices } from 'core/modules/authentication/services/UserServices'
import { FastifyReply, FastifyRequest } from 'fastify'
import { GetPostList } from '../models/GET/GetPostList'
import { GetPostInfoById } from '../models/GET/GetPostInfoById'
import { InsertNewPostModel } from '../models/INSERT/InsertNewPostModel'
import { UpdatePostModel } from '../models/UPDATE/UpdatePostModel'
import { DeletePostById } from '../models/DELETE/DeletePostById'
import { GetTotalPostCount } from '../models/GET/GetTotalPostCount'
import { SortDirection } from 'mongodb'
import { GetCategoryListForFrontend } from '../models/GET/GetCategoryListForFrontend'
import { GetCategoryInfoById } from '../models/GET/GetCategoryInfoById'
import { UpdateCategoryPostAmount } from '../models/UPDATE/UpdateCategoryPostAmount'
import striptags from 'striptags'
import slugify from 'slugify'

export class PostService {
  public async renderNewPost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const postId = striptags(req.params.id) ?? ''
    const postInfo = postId !== '' ? await GetPostInfoById(postId) : null
    const categoryList = await GetCategoryListForFrontend()

    return await reply.view('templates/pages/admin/posts/new', { categoryList: categoryList, postInfo: postInfo })
  }

  public async renderPostGrid (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const categoryList = await GetCategoryListForFrontend()

    const sort = striptags(req.query.sort) ?? ''
    const category = striptags(req.query.category) ?? ''
    const title = striptags(req.query.title) ?? ''
    let order: SortDirection = 'desc'

    const filters: {[key: string]: any} = {}

    if (sort !== '') {
      filters.sort = sort

      if (sort === 'title') {
        order = 'asc'
      }
    }

    if (category !== '') {
      filters.category = category
    }

    if (title !== '') {
      filters.title = { $regex: `.*${title}.*`, $options: 'i' }
    }

    const page = !Number.isNaN(parseInt(striptags(req.query.page))) ? parseInt(striptags(req.query.page)) : 0
    const postsPerPage = 25

    const postList = await GetPostList({
      title: filters.title ?? { $regex: '.*.', $options: 'i' },
      category: filters.category ?? { $regex: '.*.', $options: 'i' }
    }, filters.sort ?? 'default', order, (postsPerPage * page), postsPerPage)

    const pagination = {
      total: await GetTotalPostCount({
        title: filters.title ?? { $regex: '.*.', $options: 'i' },
        category: filters.title ?? { $regex: '.*.', $options: 'i' }
      }),
      page: page,
      start: (postsPerPage * page),
      end: (postsPerPage * page) + postList.length
    }

    filters.title = title

    postList.forEach((post) => {
      post.categoryName = post.category !== '' ? (categoryList.find((category) => category.human_id === post.category)?.name ?? '') : ''
    })

    return await reply.view('templates/pages/admin/posts/grid', { categoryList: categoryList, postList: postList, filters: filters, pagination: pagination })
  }

  private async processPost (req: FastifyRequest<WildBody>, reply: FastifyReply, update: boolean = false): Promise<void> {
    const enabled = striptags(req.body.enabled) === 'true'
    const postId = striptags(req.params.id)
    const title = striptags(req.body.title)
    const summary = striptags(req.body.summary)
    const markdown = striptags(req.body.markdown)
    const hero = striptags(req.body.hero)
    const category = striptags(req.body.category)
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

    if (category.length < 1) {
      throw new Error('Missing category - please select one for the post')
    }

    const categoryInfoCheck = await GetCategoryInfoById(category)

    if (categoryInfoCheck === null) {
      throw new Error('Invalid category - please select one for the post')
    }

    if (summary.length > 400) {
      throw new Error('Summary must be less than 200 characters')
    }

    if (hero.length < 5) {
      throw new Error('Hero must be at least 5 characters')
    }

    if (postId === '' && update) {
      throw new Error('Missing post id')
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g

    if (hero !== '' && !urlRegex.test(hero)) {
      throw new Error('Hero must be a valid URL')
    }

    if (update) {
      const existingInfo = await GetPostInfoById(postId)

      if (existingInfo !== null && existingInfo.category !== category) {
        /** Update category post amount by -1 */
        await UpdateCategoryPostAmount(existingInfo.category, -1)
      }

      await Promise.all([
        await UpdateCategoryPostAmount(category, 1),
        await UpdatePostModel(
          postId,
          enabled,
          slug,
          title,
          summary,
          markdown,
          username,
          hero,
          showHero,
          category
        )
      ])
    } else {
      await Promise.all([
        await UpdateCategoryPostAmount(category, 1),
        await InsertNewPostModel(
          enabled,
          slug,
          title,
          summary,
          markdown,
          username,
          hero,
          showHero,
          category
        )
      ])
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
}
