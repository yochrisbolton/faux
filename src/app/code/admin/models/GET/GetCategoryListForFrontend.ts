import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetCategoryListForFrontend (): Promise<any[]> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('categories').find({}).toArray()

  return opObject
}
