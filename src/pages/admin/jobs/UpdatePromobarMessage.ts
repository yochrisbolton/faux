import { CronJob } from 'cron'
import { logger } from 'core/utils/logger'
import { GetPromobarMessage } from '../models/GET/GetPromobarMesasge'
import RouterServer from 'core/RouterServer'

/**
 * Update the promobar message from the DB
 */
export const UpdatePromobarMessage = new CronJob('*/5 * * * *', function () {
  logger.log('info', 'Updating promobar message')
  GetPromobarMessage().then(message => {
    RouterServer.getInstance().app.locals.promobarMessage = message
  }).catch(_e => {
    // ignore error
  })
})
