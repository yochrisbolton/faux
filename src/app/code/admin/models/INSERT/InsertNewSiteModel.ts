import { MongoDriver } from 'core/database/Mongo/MongoDriver'
import { customAlphabet } from 'nanoid/non-secure'

export async function InsertNewSiteModel (
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
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)
  const mongo = MongoDriver.getDatabase()
  const opObject = await mongo.collection('sites').insertOne({
    human_id: nanoid(),
    site_name: siteName,
    main_color: mainColor,
    secondary_color: secondaryColor,
    accent_color: accentColor,
    site_enabled: siteEnabled,
    domain_name: domainName,
    username: username,
    site_name_lowercase: siteName.toLocaleLowerCase(),
    site_meta_description: siteMetaDescription,
    site_meta_title: siteMetaTitle,
    site_meta_image: siteMetaImage,
    custom_css: customCss,
    site_disclaimer: siteDisclaimer,
    author_list: authorList,
    newsletter_hook: newsletterHook
  })

  return opObject
}
