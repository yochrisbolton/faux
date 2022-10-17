import 'fastify'
import '@fastify/rate-limit'

declare module 'fastify' {
  interface FastifyReply {
    locals: any
  }

  interface FastifyRequest {
    meta: {
    [key: string]: string
    }
  }

  interface FastifyContextConfig {
    rateLimit: import('@fastify/rate-limit').RateLimitOptions
  }
}
