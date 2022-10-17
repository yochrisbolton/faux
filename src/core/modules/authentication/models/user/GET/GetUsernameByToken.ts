import { MongoDriver } from 'core/database/Mongo/MongoDriver'

/**
 *
 * @param {string} authToken the auth token to check
 * @returns {Promise<string>} the username
 * @throws {error} if user not found
 */
export async function GetUsernameByToken (authToken: string): Promise<string> {
  const mongo = MongoDriver.getDatabase()
  const operationObject = await mongo.collection('users').findOne({
    'resume_tokens.token': authToken
  }, {
    projection: {
      username: 1
    }
  })

  if (operationObject === null || operationObject === undefined) {
    throw new Error('User not found')
  }

  return operationObject.username
}
