import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetSiteDomainById (siteId: string): Promise<string> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').findOne({
    human_id: siteId
  }, { projection: { domain_name: 1 } })

  if (opObject === null || opObject === undefined) {
    return ''
  }

  return opObject.domain_name
}
