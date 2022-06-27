import { MongoHelper } from 'core/MongoHelper'

/**
 * Update the promobar message
 *
 * @param {string} message the message to set
 */
export async function UpdatePromobarMessage (message: string): Promise<void> {
  const mongo = MongoHelper.getDatabase()
  const operationObject = await mongo.collection('info').updateOne({
    type: 'promobar_message'
  }, {
    $set: {
      message: message
    }
  }, {
    upsert: true
  })

  if (operationObject === null || operationObject === undefined) {
    throw new Error('Failed to update (or upsert) promobar message')
  }
}
