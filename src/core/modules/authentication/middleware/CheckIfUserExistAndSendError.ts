import { GetDoesUserExistByToken } from 'core/modules/authentication/models/user/GET/GetDoesUserExistByToken'
import { TokenServices } from 'core/modules/authentication/services/TokenServices'
import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Check if user exists and send error if not
 *
 * @param {string} error error message to print if not found
 * @returns
 */
export async function CheckIfUserExistAndSendError (error: string = 'User not found', req: FastifyRequest<WildBody>, reply: FastifyReply): Promise<any> {
  const authToken = req.cookies['auth-token']

  if (authToken === undefined) {
    return await reply.status(400).send({ error: 'Missing auth token, are you logged in?' })
  }

  const tokenServices = TokenServices.getInstance()
  const hashedToken = tokenServices.hashToken(authToken)

  if (await GetDoesUserExistByToken(hashedToken)) {
    req.body.hashedToken = hashedToken
  } else {
    return await reply.status(400).send({ error: error })
  }
}
