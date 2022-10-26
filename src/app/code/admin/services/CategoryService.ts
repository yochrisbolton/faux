import { FastifyReply, FastifyRequest } from 'fastify'
import { GetCategoryList } from '../models/GET/GetCategoryList'
import { GetCategoryInfoById } from '../models/GET/GetCategoryInfoById'
import { InsertNewCategoryModel } from '../models/INSERT/InsertNewCategoryModel'
import { UpdateCategoryModel } from '../models/UPDATE/UpdateCategoryModel'
import { DeleteCategoryById } from '../models/DELETE/DeleteCategoryById'
import { GetTotalCategoryCount } from '../models/GET/GetTotalCategoryCount'
import { SortDirection } from 'mongodb'
import striptags from 'striptags'
import slugify from 'slugify'

export class CategoryService {
  public async renderNew (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const categoryId = striptags(req.params.id) ?? ''
    const categoryInfo = categoryId !== '' ? await GetCategoryInfoById(categoryId) : null

    return await reply.view('templates/pages/admin/category/new', { categoryInfo: categoryInfo })
  }

  public async renderGrid (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const sort = striptags(req.query.sort) ?? ''
    const name = striptags(req.query.title) ?? ''
    let order: SortDirection = 'desc'

    const filters: {[key: string]: any} = {}

    if (sort !== '') {
      filters.sort = sort

      if (sort === 'title') {
        order = 'asc'
      }
    }

    if (name !== '') {
      filters.name = { $regex: `.*${name}.*`, $options: 'i' }
    }

    const page = !Number.isNaN(parseInt(striptags(req.query.page))) ? parseInt(striptags(req.query.page)) : 0
    const categoryPerPage = 25

    const categoryList = await GetCategoryList({
      name: filters.name ?? { $regex: '.*.', $options: 'i' }
    }, filters.sort ?? 'default', order, (categoryPerPage * page), categoryPerPage)

    const pagination = {
      total: await GetTotalCategoryCount({
        name: filters.name ?? { $regex: '.*.', $options: 'i' }
      }),
      page: page,
      start: (categoryPerPage * page),
      end: (categoryPerPage * page) + categoryList.length
    }

    filters.name = name

    return await reply.view('templates/pages/admin/category/grid', { categoryList: categoryList, filters: filters, pagination: pagination })
  }

  private async process (req: FastifyRequest<WildBody>, reply: FastifyReply, update: boolean = false): Promise<void> {
    const enabled = striptags(req.body.enabled) === 'true'
    const categoryId = striptags(req.params.id)
    const name = striptags(req.body.name)
    const description = striptags(req.body.description)
    const customCss = striptags(req.body.custom_css)
    const slug = slugify(name, { lower: true })

    if (name.length < 5) {
      throw new Error('Name must be at least 5 characters')
    }

    if (description.length > 500) {
      throw new Error('Description must be less than 500 characters')
    }

    if (categoryId === '' && update) {
      throw new Error('Missing category id')
    }

    if (update) {
      await UpdateCategoryModel(
        categoryId,
        enabled,
        name,
        description,
        customCss,
        slug
      )
    } else {
      await InsertNewCategoryModel(
        enabled,
        name,
        description,
        customCss,
        slug
      )
    }

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/category' })
  }

  public async post (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await this.process(req, reply)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/category' })
  }

  public async delete (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    const categoryId = striptags(req.params.id) ?? ''

    if (categoryId === '') {
      throw new Error('Missing category id')
    }

    await DeleteCategoryById(categoryId)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/category' })
  }

  public async update (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    await this.process(req, reply, true)

    return await reply.status(200).send({ message: 'ok', redirectTo: '/admin/category' })
  }
}
