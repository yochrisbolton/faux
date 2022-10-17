import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetPostInfoById (postId: string): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('posts').findOne({ human_id: postId })

  return opObject
}
