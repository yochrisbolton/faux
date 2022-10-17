import { MongoClient, Db } from 'mongodb'
import { logger } from 'core/utils/logger'

export class MongoDriver {
  private static instance: MongoDriver
  private static client: MongoClient
  private static db: Db
  private constructor () {}

  /**
   * Return our Mongo instance
   */
  public static getInstance (): MongoDriver {
    if (MongoDriver.instance == null) {
      MongoDriver.instance = new MongoDriver()
    }

    return MongoDriver.instance
  }

  /**
   * Fetch our MongoDB client connection
   *
   * @todo Add reconnect if no connection established
   */
  public static getClient (): MongoClient {
    if (MongoDriver.client == null) {
      throw new Error('No connection established')
    }

    return MongoDriver.client
  }

  /**
   * Fetch our default database
   *
   * @todo Add reconnect if no connection established
   */
  public static getDatabase (): Db {
    if (MongoDriver.db == null) {
      throw new Error('No connection established')
    }

    return MongoDriver.db
  }

  /**
   * Connect to MongoDB
   *
   * Connects and stores client and DB
   * into singleton static variables
   */
  public async connect (): Promise<any> {
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`

    try {
      const client = await MongoClient.connect(url)
      MongoDriver.client = client
      MongoDriver.db = client.db(process.env.DB_NAME)

      return
    } catch (e: any) {
      const message = e.message ?? 'Failed to connect to Mongo'
      logger.log('warn', message, ...[e])
      throw new Error(e) // we want the app to crash if our DB is offline
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public disconnect (): void {
    MongoDriver.client.close().catch(e => {
      logger.log('info', e.message)
    })
  }
}
