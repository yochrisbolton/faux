import Redis from 'ioredis'

export class RedisDriver {
  private static instance: RedisDriver
  private static client: Redis
  private constructor () {}

  /**
   * Return our Redis instance
   */
  public static getInstance (): RedisDriver {
    if (RedisDriver.instance == null) {
      RedisDriver.instance = new RedisDriver()
    }

    return RedisDriver.instance
  }

  /**
   * Fetch our Redis client connection
   *
   * @todo Add reconnect if no connection established
   */
  public static getClient (): Redis {
    if (RedisDriver.client == null) {
      throw new Error('No connection established')
    }

    return RedisDriver.client
  }

  /**
   * Connect to Redis
   *
   * Connects and stores client into singleton static variable
   */
  public async connect (): Promise<any> {
    const client = new Redis(parseInt(process.env.REDIS_PORT ?? '6379'), process.env.REDIS_HOST ?? 'localhost', {
      password: process.env.REDIS_PASSWORD,
      commandTimeout: 200
    })

    RedisDriver.client = client
  }
}
