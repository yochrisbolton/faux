import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetEnabledArticlesBySiteId (siteId: string): Promise<any[]> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('posts').find({ site: siteId, enabled: true }, {
    projection: {
      _id: 0,
      slug: 1,
      updatedAt: 1,
      human_id: 1
    }
  }).toArray()

  return opObject
}
