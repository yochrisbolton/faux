import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetSiteAuthorList (siteId: string): Promise<string> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').findOne({
    human_id: siteId
  }, { projection: { author_list: 1 } })

  if (opObject === null || opObject === undefined) {
    return ''
  }

  return opObject.author_list
}
