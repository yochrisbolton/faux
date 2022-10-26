import { Database } from 'core/database/Database'

export async function GetSiteInfo (): Promise<any> {
  const opObject = await Database.findOne('site_info', {})

  if (opObject == null) {
    throw new Error('Site not found')
  }

  return opObject
}
