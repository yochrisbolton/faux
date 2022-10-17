import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetSiteInfoByName (siteName: string): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').findOne({ site_name: siteName })

  return opObject
}
