import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetCategoryInfoById (categoryId: string): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('categories').findOne({ human_id: categoryId })

  return opObject
}
