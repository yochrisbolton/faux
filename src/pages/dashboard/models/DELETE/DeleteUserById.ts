import { MongoHelper } from 'core/MongoHelper'
/**
 * Delete user by id
 *
 * @param {string} userId the user id to delete
 * @throws {error} if unable to delete
 */
export async function DeleteUserByUserId (userId: string): Promise<void> {
  const mongo = MongoHelper.getDatabase()
  const operationObject = await mongo.collection('users').deleteOne({
    user_id: userId
  })

  if (operationObject === null || operationObject === undefined) {
    throw new Error('Unable to delete user')
  }
}
