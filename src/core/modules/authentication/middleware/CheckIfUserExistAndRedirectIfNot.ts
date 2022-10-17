import { GetUserIdByToken } from 'core/modules/authentication/models/user/GET/GetUserIdByToken'
import { TokenServices } from 'core/modules/authentication/services/TokenServices'
import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Check if user exists and redirect if not
 *
 * @param redirect redirect to this page if not found
 * @returns
 */
export function CheckIfUserExistAndRedirectIfNot (redirect: string, req: FastifyRequest<WildBody>, res: FastifyReply): any {
  const authToken = req.cookies['auth-token']
  if (authToken !== undefined) {
    const tokenServices = TokenServices.getInstance()
    const hashedToken = tokenServices.hashToken(authToken)

    /**
     * if a user has a token, lets see if its valid
     * for any users currently who have tokens
     *
     * yes: go to dashboard
     * no: go to register page
     */

    GetUserIdByToken(hashedToken).catch((_e: any) => {
      return res.redirect(redirect)
    })
  } else {
    return res.redirect(redirect)
  }
}
