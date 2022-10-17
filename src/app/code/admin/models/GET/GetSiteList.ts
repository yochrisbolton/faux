import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetSiteList (): Promise<any[]> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').find({}).toArray()

  return opObject
}
