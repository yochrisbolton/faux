import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function GetArticleAuthorInfo (siteId: string, authorId: string): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').findOne({ human_id: siteId }, {
    projection: {
      author_list: {
        $elemMatch: {
          id: authorId
        }
      }
    }
  })

  if (opObject === null || opObject === undefined) {
    throw new Error('Site not found')
  }

  if (!('author_list' in opObject)) {
    throw new Error('Author list not found')
  }

  return opObject?.author_list[0]
}
