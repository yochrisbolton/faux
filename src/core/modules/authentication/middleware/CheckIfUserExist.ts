import { GetDoesUserExistByToken } from 'core/modules/authentication/models/user/GET/GetDoesUserExistByToken'
import { TokenServices } from 'core/modules/authentication/services/TokenServices'
import { FastifyRequest } from 'fastify'

/**
 * Check if user exists
 */
export async function CheckIfUserExist (req: FastifyRequest<WildBody>): Promise<boolean> {
  const authToken = req.cookies['auth-token']

  if (authToken === undefined) {
    return false
  }

  const tokenServices = TokenServices.getInstance()
  const hashedToken = tokenServices.hashToken(authToken)

  return await GetDoesUserExistByToken(hashedToken)
}
