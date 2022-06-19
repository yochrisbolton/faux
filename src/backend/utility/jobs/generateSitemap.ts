import { CronJob } from 'cron'
import { logger } from 'utility/logger'
import { createWriteStream } from 'fs'
import { SitemapStream } from 'sitemap'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const generateSitemapCron = new CronJob('0 1 * * *', () => {
  logger.log('info', 'Generating sitemap')
  void generateSitemap()
})

async function generateSitemap (): Promise<void> {
  const hostname = process.env.ROOT_ADDRESS ?? 'https://faux.com'
  const sitemap = new SitemapStream({ hostname: hostname })
  const writeStream = createWriteStream(path.join(__dirname, '../dist/public/sitemap.xml'))

  sitemap.pipe(writeStream)

  // loop through your data and add to sitemap here

  sitemap.end()
}
