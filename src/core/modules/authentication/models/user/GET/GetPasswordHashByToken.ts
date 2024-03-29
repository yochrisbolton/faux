import { MongoDriver } from 'core/database/Mongo/MongoDriver'

/**
 * Return password hash given a hashed token
 *
 * @param {string} token hashed token
 * @returns {Promise<string>}
 */
export async function GetPasswordHashByToken (token: string): Promise<string> {
  const mongo = MongoDriver.getDatabase()
  const operationObject = await mongo.collection('users').findOne({
    'resume_tokens.token': token
  }, {
    projection: {
      password_hash: 1
    }
  })

  if (operationObject === null || operationObject === undefined) {
    throw new Error('User not found')
  }

  return operationObject.password_hash
}
