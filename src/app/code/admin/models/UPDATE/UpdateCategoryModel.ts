import { Database } from 'core/database/Database'

export async function UpdateCategoryModel (
  categoryId: string,
  enabled: boolean,
  name: string,
  description: string,
  customCss: string,
  slug: string
): Promise<any> {
  const opObject = await Database.updateOne('categories', { human_id: categoryId }, {
    $set: {
      enabled: enabled,
      name: name,
      description: description,
      custom_css: customCss,
      slug: slug
    }
  })

  return opObject
}
