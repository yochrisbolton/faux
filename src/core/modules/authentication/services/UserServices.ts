import * as argon2 from 'argon2'
import { logger } from 'core/utils/logger'
import { InsertUser } from 'core/modules/authentication/models/user/INSERT/InserUser'
import { InsertToken } from 'core/modules/authentication/models/user/INSERT/InsertToken'
import { GetPasswordHash } from 'core/modules/authentication/models/user/GET/GetPasswordHash'
import { GetUserIdByToken } from 'core/modules/authentication/models/user/GET/GetUserIdByToken'
import { TokenServices } from 'core/modules/authentication/services/TokenServices'
import { GetDoesUsernameExist } from '../models/user/GET/GetDoesUsernameExist'
import striptags from 'striptags'
import { FastifyRequest } from 'fastify'
import { GetUsernameByToken } from '../models/user/GET/GetUsernameByToken'

export class UserServices {
  private static instance: UserServices
  private readonly USERNAME_REGEX: RegExp = /^[a-zA-Z0-9_-]{3,16}$/
  private readonly PASSWORD_REGEX: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
  private readonly TokenService: TokenServices = TokenServices.getInstance()

  /**
   * Return our class for singleton init
   */
  public static getInstance (): UserServices {
    if (UserServices.instance == null) {
      UserServices.instance = new UserServices()
    }

    return UserServices.instance
  }

  /**
   * Account registration
   *
   * @param {Request} req request object
   *
   * @returns {string} resume token
   *
   * @throws {Error} Username Regex error
   * @throws {Error} Password Regex error
   * @throws {Error} Password match error
   * @throws {Error} Auth token missing error
   */
  public async register (req: FastifyRequest<WildBody>): Promise<string> {
    const username = striptags(req.body.username ?? '')
    const password = striptags(req.body.password ?? '')
    const passwordConf = striptags(req.body['password-confirm'] ?? '')
    const authToken = striptags(req.body['auth-token'] ?? '')

    if (authToken.length === 0) {
      throw new Error('Auth token missing')
    }

    if (authToken !== process.env.REGISTER_AUTH_TOKEN) {
      throw new Error('Invalid auth token')
    }

    if (!this.USERNAME_REGEX.test(username)) {
      throw new Error('Username validation failed')
    } else if (!this.PASSWORD_REGEX.test(password)) {
      throw new Error('Password failed validation. Is it too short?')
    } else if (password !== passwordConf) {
      throw new Error('Password mismatch')
    }

    if (await GetDoesUsernameExist(username)) {
      throw new Error('Username already in use')
    }

    const tokenExpires = this.TokenService.generateExpiry()
    const token = this.TokenService.generateToken()
    const tokenHash = this.TokenService.hashToken(token)
    const passwordHash = await argon2.hash(password)

    try {
      await InsertUser(username, passwordHash, tokenHash, tokenExpires)
      return token
    } catch (e: any) {
      logger.log('error', e.message)
      throw new Error('Failed to create user')
    }
  }

  /**
   * Account login
   *
   * @param {Request} req request object
   *
   * @returns {string} resume token
   *
   * @throws {Error} header error
   * @throws {Error} param error
   * @throws {Error} mongo insert / find error
   */
  public async login (req: FastifyRequest<WildBody>): Promise<string> {
    const authHeader = req.headers.authorization ?? ''

    if (authHeader.includes('Bearer')) {
      // TODO: bearer token implementation
    } else {
      // if not explicity Bearer token, we'll assume basic auth

      let username = ''
      let password = ''

      if (authHeader.includes('Basic')) {
        let authString = striptags(authHeader.split('Basic ')[1])
        authString = Buffer.from(authString, 'base64').toString('ascii')
        username = authString.split(':')[0] ?? ''
        password = authString.split(':')[1] ?? ''
      } else {
        username = striptags(req.body.username ?? '')
        password = striptags(req.body.password ?? '')
      }

      if (username === '' || password === '') {
        throw new Error('Missing auth params')
      }

      try {
        const passwordHash = await GetPasswordHash(username)
        const verify = await argon2.verify(passwordHash, password)

        if (!verify) {
          throw new Error('Invalid credentials')
        }

        /**
         * Lets break this down
         *
         * We create a token, then hash it and put it in
         * the database, and then send back the original
         * unhased token back to the caller (which in this
         * case probably means added as a cookie on the
         * client)
         *
         * When we go to check the token validity, we then
         * re-hash it and find the user who has that matching
         * hash. This way if the DB becomes compromised,
         * all they have is the token hash. And since we re-hash
         * on the login checks, they will not be able to
         * imepersonate a user.
         *
         * This is very similar to how MeteorJS does (did?) their
         * token implementation
         */
        const token = this.TokenService.generateToken()
        const tokenHash = this.TokenService.hashToken(token)
        const tokenExpires = this.TokenService.generateExpiry()

        await InsertToken(username, tokenHash, tokenExpires)

        return token
      } catch (e: any) {
        logger.log('error', e.message)
        throw new Error(e.message)
      }
    }

    throw new Error('Invalid auth param')
  }

  /**
   * Find user with token
   */
  public async verify (token: string): Promise<string> {
    const hashedToken = this.TokenService.hashToken(token)
    const userId = await GetUserIdByToken(hashedToken)
    return userId
  }

  /**
   * Checks a given username against the regex test
   *
   * @param username username
   */
  public isUsernameValid (username: string): boolean {
    return this.USERNAME_REGEX.test(username)
  }

  /**
   * Check if password matches regex requirements
   *
   * @param {string} password password
   * @returns {boolean}
   */
  public isPasswordValid (password: string): boolean {
    return this.PASSWORD_REGEX.test(password)
  }

  /**
   * Verify if password matches hash
   *
   * @param {string} hash
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  public async doesPasswordMatchHash (hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password)
  }

  /**
   * Hash the password with argon2
   *
   * @param {string} password
   * @returns {Promise<string>}
   */
  public async hashPassword (password: string): Promise<string> {
    return await argon2.hash(password)
  }

  public async getUsernameByToken (token: string): Promise<string> {
    const authToken = token

    if (authToken === undefined) {
      throw new Error('Auth token missing')
    }

    const tokenServices = TokenServices.getInstance()
    const hashedToken = tokenServices.hashToken(authToken)

    return await GetUsernameByToken(hashedToken)
  }
}
