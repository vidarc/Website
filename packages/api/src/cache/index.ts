import { firestore } from 'firebase-admin'
import { differenceInMinutes } from 'date-fns'
import fetch from 'cross-fetch'
import logger from '../logger'

const DEFAULT_TTL = 5

function escapedRequest(url: string) {
  return url.replace(/:|\//g, '-')
}

function isNotStale(timestamp: Date, ttl: number) {
  return differenceInMinutes(new Date(), timestamp) <= ttl
}

async function setInCache(request: string) {
  const response = await fetch(request)
  const data = await response.json()
  const timestamp = firestore.Timestamp.fromDate(new Date())

  logger.log('putting data into cache', timestamp.toDate(), request)
  firestore()
    .collection('cache')
    .doc(escapedRequest(request))
    .set({ timestamp, data }, { merge: true })

  return data
}

async function requestFromCache(request: string, ttl: number = DEFAULT_TTL) {
  const doc = await firestore().collection('cache').doc(escapedRequest(request)).get()

  if (doc.exists) {
    logger.log('doc exists in cache')
    const { timestamp, data } = doc.data()

    if (isNotStale(timestamp.toDate(), ttl)) {
      return data
    }
    logger.log('but it is stale')
  } else {
    logger.log('doc does not exist in cache')
  }

  return setInCache(request)
}

export default requestFromCache
