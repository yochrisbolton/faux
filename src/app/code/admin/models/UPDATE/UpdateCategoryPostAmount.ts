import { Database } from 'core/database/Database'

export async function UpdateCategoryPostAmount (
  categoryId: string,
  value: number
): Promise<any> {
  const opObject = await Database.updateOne('categories', { human_id: categoryId }, {
    $inc: {
      post_count: value
    }
  })

  return opObject
}
