import { Database } from 'core/database/Database'

export async function GetArticleInfoById (postId: string): Promise<any> {
  const opObject = await Database.findOne('posts',
    {
      human_id: postId
    },
    {
      projection: {
        _id: 0,
        username: 0,
        impressions: 0
      }
    }
  )

  return opObject
}
