import { MongoDriver } from 'core/database/Mongo/MongoDriver'
import { customAlphabet } from 'nanoid/non-secure'

/**
 * Insert user into Database
 *
 * A service contract to insert a user
 * into our database
 *
 * @param {string} username
 * @param {string} passwordHash
 * @param {string} token
 * @param {string} tokenExpires
 * @returns
 */
export async function InsertUser (username: string, passwordHash: string, token: string, tokenExpires: Date): Promise<any> {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 36)
  const mongo = MongoDriver.getDatabase()
  const userObj = await mongo.collection('users').insertOne({
    human_id: nanoid(),
    username: username,
    password_hash: passwordHash,
    username_lowercase: username.toLocaleLowerCase(),
    role: 'user',
    resume_tokens: [
      {
        token: token,
        expires: tokenExpires
      }
    ]
  })

  return userObj
}
