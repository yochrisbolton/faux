import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function UpdateArticleImpressions (postId: string): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('posts').updateOne({ human_id: postId }, {
    $inc: {
      impressions: 1
    }
  })

  return opObject
}
