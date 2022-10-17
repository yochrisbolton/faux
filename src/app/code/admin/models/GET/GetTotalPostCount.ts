import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetTotalPostCount (filters: {
  title?: string
  site?: string
}): Promise<number> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('posts').countDocuments(filters)

  if (opObject == null || opObject === undefined) {
    return 0
  }

  return opObject
}
