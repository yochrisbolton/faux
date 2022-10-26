import * as controllers from 'core/controllers.index'
import { logger } from 'core/utils/logger'
import { generateProxyUrl } from 'core/utils/generateProxyUrl'
import { fastify, FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { bootstrap } from 'fastify-decorators'
import { CheckIfUserExist } from './modules/authentication/middleware/CheckIfUserExist'
import { CheckIfUserExistAndRedirectIfNot } from './modules/authentication/middleware/CheckIfUserExistAndRedirectIfNot'
import { fetchCss } from './utils/fetchCss'
import { fetchJs } from './utils/fetchJs'
import { GetArticleInfoById } from 'app/code/article/models/GET/GetArticleInfoById'
import { GetSiteInfo } from 'app/code/admin/models/GET/GetSiteInfo'
import path from 'path'
import art from 'art-template'

/**
 * Starts the server
 */
class RouterServer {
  private readonly PROD_MODE = process.env['NODE' + '_ENV'] !== null ? process.env['NODE' + '_ENV'] === 'production' : false
  private readonly app: FastifyInstance = fastify({
    trustProxy: true,
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true
  })

  private async registerPlugins (): Promise<void> {
    await this.app.register(import('@fastify/rate-limit'), {
      max: 100,
      timeWindow: '1 minute'
    })

    /**
     * Needs to be registered before @fastify/static
     * See: https://github.com/fastify/fastify-compress#global-hook
     **/
    await this.app.register(import('@fastify/compress'), {
      global: true
    })

    await this.app.register(import('@fastify/static'), {
      root: path.join(__dirname, 'public')
    })

    art.defaults.rules[1].test = /{{#?([@]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}}/

    await this.app.register(import('@fastify/view'), {
      engine: {
        'art-template': art
      },
      root: path.join(__dirname, '/'),
      production: this.PROD_MODE,
      options: {
        debug: !this.PROD_MODE,
        cache: this.PROD_MODE,
        minimize: this.PROD_MODE,
        imports: {
          fetchCss: fetchCss,
          fetchJs: fetchJs,
          generateProxyUrl: generateProxyUrl,
          buildString: new Date().getTime().toString(),
          encodeURIComponent: encodeURIComponent
        }
      }
    })

    await this.app.register(import('@fastify/cookie'), { secret: process.env.COOKIE_SECRET ?? 'change-me-in-env' })

    await this.app.register(import('@fastify/formbody'))
  }

  private registerErrorHandler (): void {
    this.app.setErrorHandler(function (error, _request, reply) {
      // Log error
      logger.log('error', error?.message ?? 'Unknown error', error)

      if (process.env.SHOW_ERRORS === 'true') {
        void reply.status(409).send({ error: error?.message ?? error })
      } else {
        void reply.status(409).redirect('/error')
      }
    })
  }

  private registerNotFoundHandler (): void {
    this.app.setNotFoundHandler((_req, reply) => {
      void reply.status(302).redirect('/lost')
    })
  }

  /**
   * Load all controllers
   */
  private async setupControllers (): Promise<void> {
    const controllerInstances = []
    for (const name of Object.keys(controllers)) {
      const Controller = (controllers as any)[name]
      controllerInstances.push(Controller)
      logger.log('info', `Registering controller: ${name}`)
    }

    await this.app.register(bootstrap, {
      controllers: controllerInstances
    })
  }

  public registerHooks (): void {
    this.app.decorateReply('locals', null)
    this.app.decorateRequest('meta', null)

    this.app.addHook('onRequest', async function (request: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
      const routerPath = request.url
      if (routerPath.substring(0, 6) === '/admin') return
      if (routerPath.substring(0, 6) === '/api/u') return
      reply.locals = {}
      request.meta = {}

      let siteInfo: any = {}
      try {
        siteInfo = await GetSiteInfo()
      } catch (e) {
        siteInfo.site_name = 'Site Name'
        siteInfo.site_meta_description = 'Site Description'
        siteInfo.site_disclaimer = 'Site Disclaimer'
        siteInfo.custom_css = ''
        siteInfo.domain_name = 'localhost'
      }

      reply.locals.siteInfo = {
        site_name: siteInfo.site_name,
        site_meta_description: siteInfo.site_meta_description,
        site_disclaimer: siteInfo.site_disclaimer,
        custom_css: `<style>${siteInfo.custom_css}</style>`,
        domain_name: siteInfo.domain_name
      }

      request.meta.siteId = siteInfo.human_id

      if (siteInfo == null || siteInfo.site_enabled === false) {
        void reply.status(302).redirect('/maintenance')
      }

      if (routerPath.includes('article/')) {
        const article = await GetArticleInfoById(request.params.id)

        if (article == null || article.enabled === false) {
          return await reply.status(302).redirect('/lost')
        }
      }
    })

    this.app.addHook('preValidation', async function (request: FastifyRequest<WildBody>, reply: FastifyReply): Promise<void> {
      if (!request.url.includes('/admin/')) return

      if (request.url === '/admin/login' || request.url === '/admin/register') {
        if (await CheckIfUserExist(request)) {
          return await reply.redirect('/admin/')
        }
      } else {
        await CheckIfUserExistAndRedirectIfNot('/admin/login', request, reply)
      }
    })
  }

  /**
   * Start the express server
   *
   * @param port {Number} declare the server port
   */
  public async start (port: number): Promise<void> {
    this.registerErrorHandler()
    await this.registerPlugins()
    await this.setupControllers()
    this.registerHooks()
    this.registerNotFoundHandler()

    this.app.listen({ port: port, host: '0.0.0.0' }, (err, address) => {
      if (err != null) throw err
      logger.log('info', `Running on port: ${address}`)
    })
  }
}

export default RouterServer
