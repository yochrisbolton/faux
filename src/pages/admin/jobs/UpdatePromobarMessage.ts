import { CronJob } from 'cron'
import { logger } from 'core/utils/logger'
import { GetPromobarMessage } from '../models/GET/GetPromobarMesasge'
import RouterServer from 'core/RouterServer'

/**
 * Check resume tokens everyday and remove expired
 */
export const UpdatePromobarMessage = new CronJob('*/5 * * * *', function () {
  logger.log('info', 'Updating promobar message')
  GetPromobarMessage().then(message => {
    RouterServer.getInstance().app.locals.promobarMessage = message
  }).catch(_e => {
    // ignore error
  })
})
