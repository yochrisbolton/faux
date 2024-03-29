import { MongoDriver } from 'core/database/Mongo/MongoDriver'

/**
 * Get user human_id given hashed token
 *
 * @param {string} token hashed token
 * @returns {Promise<string>}
 */
export async function GetUserIdByToken (token: string): Promise<string> {
  const mongo = MongoDriver.getDatabase()
  const operationObject = await mongo.collection('users').findOne({
    'resume_tokens.token': token
  }, {
    projection: {
      human_id: 1
    }
  })

  if (operationObject === null || operationObject === undefined) {
    throw new Error('User not found')
  }

  return operationObject.human_id
}
