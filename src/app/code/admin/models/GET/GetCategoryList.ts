import { MongoDriver } from 'core/database/Mongo/MongoDriver'
import { SortDirection } from 'mongodb'

export async function GetCategoryList (
  filters: object,
  sort: string,
  order: SortDirection,
  skip: number,
  limit: number
): Promise<any[]> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('categories').find(filters).skip(skip).limit(limit).sort(sort, order).toArray()

  return opObject
}
