import { MongoDriver } from 'core/database/Mongo/MongoDriver'

export async function UpdateSiteModel (
  siteId: string,
  siteName: string,
  mainColor: string,
  secondaryColor: string,
  accentColor: string,
  siteEnabled: boolean,
  domainName: string,
  username: string,
  siteMetaDescription: string,
  siteMetaTitle: string,
  siteMetaImage: string,
  customCss: string,
  siteDisclaimer: string,
  authorList: Array<{ id: string, name: string, image: string }>,
  newsletterHook: string
): Promise<any> {
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').updateOne({ human_id: siteId }, {
    $set: {
      site_name: siteName,
      main_color: mainColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      site_enabled: siteEnabled,
      domain_name: domainName,
      updated_by: username,
      site_name_lowercase: siteName.toLocaleLowerCase(),
      site_meta_description: siteMetaDescription,
      site_meta_title: siteMetaTitle,
      site_meta_image: siteMetaImage,
      custom_css: customCss,
      site_disclaimer: siteDisclaimer,
      author_list: authorList,
      newsletter_hook: newsletterHook
    }
  })

  return opObject
}
