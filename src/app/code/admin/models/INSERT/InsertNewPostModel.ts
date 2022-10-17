import { MongoDriver } from 'core/database/Mongo/MongoDriver'
import { customAlphabet } from 'nanoid/non-secure'

export async function InsertNewPostModel (
  enabled: boolean,
  slug: string,
  site: string,
  author: string,
  title: string,
  summary: string,
  markdown: string,
  username: string,
  hero: string,
  showHero: boolean
): Promise<any> {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('posts').insertOne({
    human_id: nanoid(),
    enabled: enabled,
    site: site,
    author: author,
    title: title,
    summary: summary,
    markdown: markdown,
    impressions: 0,
    username: username,
    slug: slug,
    hero: hero,
    show_hero: showHero
  })

  return opObject
}
