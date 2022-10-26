import { MongoDriver } from 'core/database/Mongo/MongoDriver'
import { customAlphabet } from 'nanoid/non-secure'

export async function InsertNewPostModel (
  enabled: boolean,
  slug: string,
  title: string,
  summary: string,
  markdown: string,
  username: string,
  hero: string,
  showHero: boolean,
  category: string
): Promise<any> {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('posts').insertOne({
    human_id: nanoid(),
    enabled: enabled,
    title: title,
    summary: summary,
    markdown: markdown,
    impressions: 0,
    username: username,
    slug: slug,
    hero: hero,
    show_hero: showHero,
    category: category
  })

  return opObject
}
