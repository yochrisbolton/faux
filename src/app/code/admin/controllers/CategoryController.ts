/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import { Controller, GET, POST } from 'fastify-decorators'
import { CategoryService } from '../services/CategoryService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/admin/category')
export class CategoryController {
  private readonly CategoryService: CategoryService = new CategoryService()

  @GET('*')
  private async categoryGrid (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.CategoryService.renderGrid(req, reply)
  }

  @GET('/new')
  private async newPostForm (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.CategoryService.renderNew(req, reply)
  }

  @GET('/:id')
  private async editPost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.CategoryService.renderNew(req, reply)
  }

  @POST('/new')
  private async newPost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.CategoryService.post(req, reply)
  }

  @POST('/delete/:id', {
    config: {
      rateLimit: {
        max: 1,
        timeWindow: 1000 * 60 * 5 // 15 minutes
      }
    }
  })
  private async deletePost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.CategoryService.delete(req, reply)
  }

  @POST('/update/:id', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: 1000 * 60 * 15 // 15 minutes
      }
    }
  })
  private async updatePost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.CategoryService.update(req, reply)
  }
}
