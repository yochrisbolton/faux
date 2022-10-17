import RouterServer from 'core/RouterServer'
import { MongoDriver } from 'core/database/Mongo/MongoDriver'
import { logger } from 'core/utils/logger'
import * as cronJobs from 'core/jobs.index'
import { RedisDriver } from 'core/database/Redis/RedisDriver'

// Connect to MongoDB Database
MongoDriver.getInstance().connect().then(() => {
  const startTime: Date = new Date()
  logger.log('info', `Successfull startup at ${startTime}`)

  // Start our server
  const server: RouterServer = new RouterServer()
  void server.start(3000)

  // Start our redis connection
  void RedisDriver.getInstance().connect()

  // init all our cron jobs
  for (const name of Object.keys(cronJobs)) {
    const job = (cronJobs as any)[name]
    if (typeof job === 'object') {
      job.start()
    }
  }
}).catch(error => {
  logger.log('error', 'Error durring startup', error)
})
