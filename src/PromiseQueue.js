
/**
 * Class to handler pending promises in a queue
 */
export default class PromiseQueue {

  __pendingPromisesArr
  __queueId
  
  /**
   * Constructor of PromiseQueue with initial array
   * @param {Array} pendingPromisesArr 
   */
  constructor(pendingPromisesArr = []) {
    this.__setQueueId()
    this.__pendingPromisesArr = pendingPromisesArr
  }

  /**
   * method to add new pending promises
   * @param {object} PendingPromise object composed by 
   * function declaration who returns a promise
   * and required arguments to execute the provided function
   */
   add ({fn, args}) {
    this.__pendingPromisesArr.push({
      fn,
      args
    })
  }

  /**
   * to add new pending promises
   * @param {array} pendingPromisesArr 
   */
  addArray (pendingPromisesArr) {
    this.__pendingPromisesArr.concat(pendingPromisesArr)
  }

  /**
   * resolve all pending promises in chunks
   * @param {object} options {
      concurrent?: 10,
      sleepMs?: 0,
      promiseType?: 'allSettled'
    } 
   * @returns {Promise}
   */
  async run ({
    concurrent = 10,
    sleepMs,
    promiseType = 'allSettled'
  } = {}) {

    console.log(`%c+++ run PromiseQueue with id ${this.__queueId} +++`, 'font-weight:bold;')
    const chunks = this.__chunkArr(this.__pendingPromisesArr, concurrent)
    let results = []

    console.log({ 
      promiseType,
      pendingPromisesArr: this.__pendingPromisesArr,
      concurrent,
      chunks,
      sleepMs
    })

    // resolve each chunk of promises
    for (const [index, chunk] of chunks.entries()) {

      let chunkPromises = []
      console.log(` chunk ${index+1} of ${chunks.length} `, { chunk })

      chunk.forEach(PendingPromise => {
        // /** @return Promise<any> */
        // function fn(args) {
        //   return new Promise(...args)
        // }
        chunkPromises.push(PendingPromise._fn(...PendingPromise._args))
      })

      const chunkResults = await Promise[promiseType](chunkPromises)
      results.concat(chunkResults)
      sleepMs && await this.__sleep(sleepMs)
    }

    return Promise.resolve(results)
  }

  __setQueueId () {
    this.__queueId = this.__makeHash()
    console.log(`new PromiseQueue with id ${this.__queueId}`)
  }

  __makeHash () {
    let result = ''
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charactersLength = characters.length
    for (let i = 0; i < 15; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  __chunkArr (array, size) {
    if (!array) return []
    const firstChunk = array.slice(0, size) // create the first chunk of the given array
    if (!firstChunk.length) {
      return array // this is the base case to terminal the recursive
    }
    return [firstChunk].concat(this.__chunkArr(array.slice(size, array.length), size))
  }

  __sleep(ms) {
    console.log(`sleep queue... ${ms} ms`)
    return new Promise(resolve => setTimeout(resolve, ms))
  }

}
