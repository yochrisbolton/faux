import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetDoesSiteExistByName (siteName: string): Promise<boolean> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').findOne({
    site_name: siteName
  })

  if (opObject === null || opObject === undefined) {
    return false
  }

  return true
}
