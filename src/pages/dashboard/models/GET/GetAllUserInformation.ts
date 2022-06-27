import { MongoHelper } from 'core/MongoHelper'

/**
 *
 * @param token the token to search with
 * @returns {Promise<any>} the user object
 */
export async function GetAllUserInformation (token: string): Promise<any> {
  const mongo = MongoHelper.getDatabase()
  const operationObject = await mongo.collection('users').findOne({
    'resume_tokens.token': token
  })

  return operationObject
}
