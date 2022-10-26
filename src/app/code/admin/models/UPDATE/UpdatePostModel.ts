import { Database } from 'core/database/Database'

export async function UpdatePostModel (
  postId: string,
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
  const opObject = await Database.updateOne('posts', { human_id: postId }, {
    $set: {
      enabled: enabled,
      title: title,
      summary: summary,
      markdown: markdown,
      updated_by: username,
      slug: slug,
      hero: hero,
      show_hero: showHero,
      category: category
    }
  })

  return opObject
}
