import { MongoDriver } from 'core/database/Mongo/MongoDriver'

/**
 * Checks if a username is already in database
 *
 * @param {string} username username
 * @returns {Promise<boolean>}
 */
export async function GetDoesUsernameExist (username: string): Promise<boolean> {
  const mongo = MongoDriver.getDatabase()
  const operationObject = await mongo.collection('users').findOne({
    username_lowercase: username.toLocaleLowerCase()
  })

  if (operationObject === null || operationObject === undefined) {
    return false
  }

  return true
}
