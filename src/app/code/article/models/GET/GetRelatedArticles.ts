import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetRelatedArticles (site: string, limit: number = 10): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('posts').aggregate([{
    $match: {
      site: site,
      enabled: true
    }
  }, {
    $sample: {
      size: limit
    }
  }, {
    $project: {
      human_id: 1,
      slug: 1,
      title: 1,
      summary: 1,
      hero: 1
    }
  }]).toArray()

  return opObject
}
