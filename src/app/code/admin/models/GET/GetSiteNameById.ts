import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetSiteNameById (siteId: string): Promise<string> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').findOne({
    human_id: siteId
  }, { projection: { site_name: 1 } })

  if (opObject === null || opObject === undefined) {
    return ''
  }

  return opObject.site_name
}
