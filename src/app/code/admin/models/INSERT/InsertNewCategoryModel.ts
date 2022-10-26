import { MongoDriver } from 'core/database/Mongo/MongoDriver'
import { customAlphabet } from 'nanoid/non-secure'

export async function InsertNewCategoryModel (
  enabled: boolean,
  name: string,
  description: string,
  customCss: string,
  slug: string
): Promise<any> {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('categories').insertOne({
    human_id: nanoid(),
    enabled: enabled,
    name: name,
    description: description,
    custom_css: customCss,
    slug: slug
  })

  return opObject
}
