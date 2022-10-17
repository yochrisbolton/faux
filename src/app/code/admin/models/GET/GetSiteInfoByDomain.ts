import { Database } from 'core/database/Database'

export async function GetSiteInfoByDomain (domain: string | object): Promise<any> {
  const opObject = await Database.findOne('sites', { domain_name: domain })

  if (opObject == null) {
    throw new Error('Site not found')
  }

  return opObject
}
