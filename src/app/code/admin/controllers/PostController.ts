import { Controller, GET, POST } from 'fastify-decorators'
import { PostService } from '../services/PostService'
import { FastifyReply, FastifyRequest } from 'fastify'

@Controller('/admin/posts')
export class PostsController {
  private readonly PostService: PostService = new PostService()

  @GET('*')
  private async postGrid (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.PostService.renderPostGrid(req, reply)
  }

  @GET('/new')
  private async newPostForm (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.PostService.renderNewPost(req, reply)
  }

  @GET('/:id')
  private async editPost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.PostService.renderNewPost(req, reply)
  }

  @GET('/get/site/authors/:id')
  private async getSiteAuthors (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.PostService.getSiteAuthors(req, reply)
  }

  @POST('/new')
  private async newPost (req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
    return await this.PostService.post(req, reply)
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
    return await this.PostService.deletePost(req, reply)
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
    return await this.PostService.updatePost(req, reply)
  }
}
