import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetTotalCategoryCount (filters: {
  name?: string
}): Promise<number> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('categories').countDocuments(filters)

  if (opObject == null || opObject === undefined) {
    return 0
  }

  return opObject
}
