import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function DeleteSiteById (siteId: string): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').deleteOne({
    human_id: siteId
  })

  return opObject
}
