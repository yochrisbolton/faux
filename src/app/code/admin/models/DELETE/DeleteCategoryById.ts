import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function DeleteCategoryById (categoryId: string): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('categories').deleteOne({
    human_id: categoryId
  })

  return opObject
}
