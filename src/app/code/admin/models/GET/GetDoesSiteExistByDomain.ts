import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetDoesSiteExistByDomain (domainName: string): Promise<boolean> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').findOne({
    domain_name: domainName
  })

  if (opObject == null || opObject === undefined) {
    return false
  }

  return true
}
