import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function DeletePostById (postId: string): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('posts').deleteOne({
    human_id: postId
  })

  return opObject
}
