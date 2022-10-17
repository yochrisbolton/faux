import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetSiteIdByDomain (domain: string | object): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').findOne({ domain_name: domain }, {
    projection: {
      human_id: 1
    }
  })

  if (opObject == null) {
    throw new Error('Site not found')
  }

  return opObject
}
