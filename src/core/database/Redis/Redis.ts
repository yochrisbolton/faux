import { RedisDriver } from 'core/database/Redis/RedisDriver'

// Implement our Getters and Setters
export class Redis {
  /**
   * Get a value from Redis
   * @param key
   * @param defaultValue
   * @returns {Promise<any>}
    */
  public async get (key: string, defaultValue: any = null): Promise<any> {
    const value = await RedisDriver.getClient().get(key)
    if (value == null) {
      return defaultValue
    }

    return JSON.parse(value)
  }

  /**
   * Set a value in Redis
   * @param key
   * @param value
   * @param ttl
   * @returns {Promise<any>}
   */
  public async set (key: string, value: any, ttl: number = 0): Promise<any> {
    if (ttl > 0) {
      return await RedisDriver.getClient().set(key, JSON.stringify(value), 'EX', ttl)
    }

    return await RedisDriver.getClient().set(key, JSON.stringify(value))
  }

  /**
   * Delete a value from Redis
   * @param key
   * @returns {Promise<any>}
   */
  public async del (key: string): Promise<any> {
    return await RedisDriver.getClient().del(key)
  }

  /**
   * Check if a key exists in Redis
   * @param key
   * @returns {Promise<boolean>}
   */
  public async exists (key: string): Promise<boolean> {
    return await RedisDriver.getClient().exists(key) === 1
  }

  /**
   * Delete all keys from Redis
   * @returns {Promise<any>}
   */
  public async flushall (): Promise<any> {
    return await RedisDriver.getClient().flushall()
  }

  /**
   * Get all keys from Redis
   * @returns {Promise<any>}
   */
  public async keys (pattern: string): Promise<any> {
    return await RedisDriver.getClient().keys(pattern)
  }
}
