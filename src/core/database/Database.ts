import { logger } from 'core/utils/logger'
import { FindOptions } from 'mongodb'
import { customAlphabet } from 'nanoid'
import { Mongo } from './Mongo/Mongo'
import { Redis } from './Redis/Redis'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Database {
  private static instance: Database
  private static readonly DEFAULT_TTL = 7200 // 2 hours in seconds
  private static readonly mongo: Mongo = new Mongo()
  private static readonly redis: Redis = new Redis()
  private static readonly nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)

  /**
   * Return our Database instance
   */
  public static getInstance (): Database {
    if (Database.instance == null) {
      Database.instance = new Database()
    }

    return Database.instance
  }

  /**
   * Fetch our Mongo instance
   */
  public static getMongo (): Mongo {
    if (Database.mongo == null) {
      throw new Error('No connection established')
    }

    return Database.mongo
  }

  /**
   * Fetch our Redis instance
   */
  public static getRedis (): Redis {
    if (Database.redis == null) {
      throw new Error('No connection established')
    }

    return Database.redis
  }

  /**
   * FindOne in Mongo with cache
   *
   * @param collection
   * @param query
   * @param cache
   * @param cacheKey custom cache key, else it will be generated
   * @param cacheTTL
   * @returns {Promise<any>}
   */
  public static async findOne (collection: string, query: any, options: FindOptions = {}, cache: boolean = true, cacheKey: string | null = null, cacheTTL = Database.DEFAULT_TTL): Promise<any> {
    if (cache) {
      try {
        const cached = await Database.getRedis().get(cacheKey ?? `findOne:${collection}:${JSON.stringify(query)}`)
        if (cached != null) {
          return cached
        }
        logger.debug(`Cache miss on findOne with query ${JSON.stringify(query)}`)
      } catch (e) {
        logger.error(e)
      }
    }

    const result = await Database.getMongo().findOne(collection, query, options)

    if (cache) {
      Database.getRedis().set(cacheKey ?? `findOne:${collection}:${JSON.stringify(query)}`, result, cacheTTL).catch((e) => {
        logger.error(e)
      })
    }

    return result
  }

  /**
   * FindMany in Mongo with cache
   *
   * @param collection
   * @param query
   * @param cache
   * @param cacheKey custom cache key, else it will be generated
   * @param cacheTTL
   * @returns {Promise<any>}
   */
  public static async findMany (collection: string, query: any, options: FindOptions = {}, cache: boolean = true, cacheKey: string | null = null, cacheTTL = Database.DEFAULT_TTL): Promise<any> {
    if (cache) {
      try {
        const cached = await Database.getRedis().get(cacheKey ?? `findMany:${collection}:${JSON.stringify(query)}`)

        if (cached != null) {
          return cached
        }
      } catch (e) {
        logger.error(e)
      }
    }

    const result = await Database.getMongo().findMany(collection, query, options)

    if (cache) {
      Database.getRedis().set(cacheKey ?? `findMany:${collection}:${JSON.stringify(query)}`, result, cacheTTL).catch((e) => {
        logger.error(e)
      })
    }

    return result
  }

  /**
   * InsertOne in Mongo with cache
   *
   * @param collection
   * @param data
   * @param cache weather or not to cache the result
   * @param cacheKey custom cache key, else it will be generated
   * @param cacheTTL
   * @returns {Promise<any>}
   */
  public static async insertOne (collection: string, data: any, cache: boolean = true, cacheKey: string | null = null, cacheTTL = Database.DEFAULT_TTL): Promise<any> {
    const id = Database.nanoid()

    data._id = id

    const result = await Database.getMongo().insertOne(collection, data)

    if (cache) {
      Database.getRedis().set(cacheKey ?? `findOne:${collection}:${JSON.stringify(id)}`, data, cacheTTL).catch((e) => {
        logger.error(e)
      })
    }

    return result
  }

  /**
   * InsertMany in Mongo with cache
   *
   * @param collection
   * @param data
   * @param cache
   * @param cacheKey custom cache key, else it will be generated
   * @param cacheTTL
   * @returns {Promise<any>}
   */
  public static async insertMany (collection: string, data: any, cache: boolean = true, cacheKey: string | null = null, cacheTTL = Database.DEFAULT_TTL): Promise<any> {
    for (const item of data) {
      await Database.insertOne(collection, item, cache, cacheKey, cacheTTL)
    }
  }

  /**
   * UpdateOne in Mongo with cache
   *
   * @param collection
   * @param query
   * @param data
   * @param cache
   * @param cacheKey custom cache key, else it will be generated
   * @param cacheTTL
   * @returns {Promise<any>}
   */
  public static async updateOne (collection: string, query: any, data: any, cache: boolean = true, cacheKey: string | null = null, cacheTTL = Database.DEFAULT_TTL): Promise<any> {
    const result = await Database.getMongo().updateOne(collection, query, data)

    // fetch the query from mongo and use its id in redis cache
    const mongoResult = await Database.findOne(collection, query, {}, false)

    if (cache) {
      /**
       * At some point we need to figure out what the id is, so we can update the cache
       *
       * Right now we assume that the query will match what we use in findOne - which is not always the case
       *
       * TODO: Figure out a way to get the id from the query that maps to the same value as the findOne query consistently
       */
      Database.getRedis().set(cacheKey ?? `findOne:${collection}:${JSON.stringify(query)}`, mongoResult, cacheTTL).catch((e) => {
        logger.error(e)
      })
    }

    return result
  }

  /**
   * UpdateMany in Mongo with cache
   *
   * @param collection
   * @param query
   * @param data
   * @param cache
   * @param cacheKey custom cache key, else it will be generated
   * @param cacheTTL
   * @returns {Promise<any>}
   */
  public static async updateMany (collection: string, query: any, data: any, cache: boolean = true, cacheKey: string | null = null, cacheTTL = Database.DEFAULT_TTL): Promise<any> {
    const results = await Database.findMany(collection, query)

    for (const result of results) {
      const query = { _id: result._id }
      await Database.updateOne(collection, query, data, cache, cacheKey, cacheTTL)
    }
  }

  /**
   * DeleteOne in Mongo with cache
   *
   * @param collection
   * @param query
   * @param cache
   * @param cacheKey custom cache key, else it will be generated
   * @returns {Promise<any>}
   */
  public static async deleteOne (collection: string, query: any, cache: boolean = true, cacheKey: string | null = null): Promise<any> {
    const result = await Database.getMongo().deleteOne(collection, query)

    if (cache) {
      Database.getRedis().del(cacheKey ?? `findOne:${collection}:${JSON.stringify(query)}`).catch((e) => {
        logger.error(e)
      })
    }

    return result
  }

  /**
   * DeleteMany in Mongo with cache
   *
   * @param collection
   * @param query
   * @param cache
   * @param cacheKey custom cache key, else it will be generated
   * @returns {Promise<any>}
   */
  public static async deleteMany (collection: string, query: any, cache: boolean = true, cacheKey: string | null = null): Promise<any> {
    const results = await Database.findMany(collection, query)

    for (const result of results) {
      const query = { _id: result._id }

      await Database.deleteOne(collection, query, cache, cacheKey)
    }
  }

  public static clearCache (collection: string, query: any): void {
    Database.getRedis().del(`findOne:${collection}:${JSON.stringify(query)}`).catch((e) => {
      logger.error(e)
    })
  }

  public static clearAllRedisCache (): void {
    Database.getRedis().flushall().catch((e) => {
      logger.error(e)
    })
  }

  public static clearRedisCacheThatContains (contains: string): void {
    Database.getRedis().keys(`*${contains}*`).then((keys) => {
      Database.getRedis().del(keys).catch((e) => {
        logger.error(e)
      })
    }).catch((e) => {
      logger.error(e)
    })
  }
}
