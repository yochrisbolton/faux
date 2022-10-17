import { MongoDriver } from 'core/database/Mongo/MongoDriver'

/**
 * Checks if a username exits on an imported asset
 *
 * @param {string} username username
 * @returns {Promise<boolean>}
 */
export async function GetIsUsernameReserved (username: string): Promise<boolean> {
  const mongo = MongoDriver.getDatabase()
  const operationObject = await mongo.collection('assets').findOne({
    author_lowercase: username.toLocaleLowerCase()
  })

  if (operationObject === null || operationObject === undefined) {
    return false
  }

  return true
}
