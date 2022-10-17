import { Database } from 'core/database/Database'

export async function UpdatePostModel (
  postId: string,
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
  const opObject = await Database.updateOne('posts', { human_id: postId }, {
    $set: {
      enabled: enabled,
      site: site,
      author: author,
      title: title,
      summary: summary,
      markdown: markdown,
      updated_by: username,
      slug: slug,
      hero: hero,
      show_hero: showHero
    }
  })

  return opObject
}
