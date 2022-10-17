import { MongoDriver } from 'core/database/Mongo/MongoDriver'
import { Collection, FindOptions } from 'mongodb'

// Implement our Getters and Setters
export class Mongo {
  /**
   * Get Mongo collection
   */
  public async getCollection (collectionName: string): Promise<Collection> {
    const database = MongoDriver.getDatabase()
    return database.collection(collectionName)
  }

  /**
   * Find a value from Mongo
   * @param collectionName
   * @param query
   * @returns {Promise<any>}
   */
  public async findOne (collectionName: string, query: any, options: FindOptions): Promise<any> {
    const collection = await this.getCollection(collectionName)
    const result = await collection.findOne(query, options)
    return result
  }

  /**
   * Find multiple values from Mongo
   * @param collectionName
   * @param query
   * @returns {Promise<any>}
   */
  public async findMany (collectionName: string, query: any, options: FindOptions): Promise<any> {
    const collection = await this.getCollection(collectionName)
    const result = await collection.find(query, options).toArray()
    return result
  }

  /**
   * Insert a value in Mongo
   * @param collectionName
   * @param data
   * @returns {Promise<any>}
   */
  public async insertOne (collectionName: string, data: any): Promise<any> {
    const collection = await this.getCollection(collectionName)
    const result = await collection.insertOne(data)
    return result
  }

  /**
   * Insert multiple values in Mongo
   * @param collectionName
   * @param data
   * @returns {Promise<any>}
   */
  public async insertMany (collectionName: string, data: any): Promise<any> {
    const collection = await this.getCollection(collectionName)
    const result = await collection.insertMany(data)
    return result
  }

  /**
   * Update a value in Mongo
   * @param collectionName
   * @param query
   * @param data
   * @returns {Promise<any>}
   */
  public async updateOne (collectionName: string, query: any, data: any): Promise<any> {
    const collection = await this.getCollection(collectionName)
    const result = await collection.updateOne(query, data)
    return result
  }

  /**
   * Update multiple values in Mongo
   * @param collectionName
   * @param query
   * @param data
   * @returns {Promise<any>}
   */
  public async updateMany (collectionName: string, query: any, data: any): Promise<any> {
    const collection = await this.getCollection(collectionName)
    const result = await collection.updateMany(query, data)
    return result
  }

  /**
   * Delete a value in Mongo
   * @param collectionName
   * @param query
   * @returns {Promise<any>}
   */
  public async deleteOne (collectionName: string, query: any): Promise<any> {
    const collection = await this.getCollection(collectionName)
    const result = await collection.deleteOne(query)
    return result
  }

  /**
   * Delete multiple values in Mongo
   * @param collectionName
   * @param query
   * @returns {Promise<any>}
   */
  public async deleteMany (collectionName: string, query: any): Promise<any> {
    const collection = await this.getCollection(collectionName)
    const result = await collection.deleteMany(query)
    return result
  }
}
