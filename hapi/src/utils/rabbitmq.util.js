const amqp = require('amqplib/callback_api')
const { rabbitmqConfig } = require('../config')

let conecction
let channel

const connect = (host = rabbitmqConfig.endpoint) => {
  return new Promise((resolve, reject) => {
    amqp.connect(host, (error, conecction) => {
      if (error) {
        reject(error)
      }

      resolve(conecction)
    })
  })
}

const createChannel = () => {
  return new Promise((resolve, reject) => {
    conecction.createChannel((error, channel) => {
      if (error) {
        reject(error)
      }

      resolve(channel)
    })
  })
}

const assertQueue = (queue, options = {}) => {
  return new Promise((resolve, reject) => {
    channel.assertQueue(queue, { ...options, durable: true }, (error, ok) => {
      if (error) {
        reject(error)
      }

      resolve(ok)
    })
  })
}

const sendToQueue = (content, options = {}) => {
  return new Promise((resolve, reject) => {
    const success = channel.sendToQueue(
      rabbitmqConfig.assetQueue,
      Buffer.from(JSON.stringify(content)),
      {
        ...options,
        persistent: true
      }
    )

    if (!success) {
      reject('something gone wrong')
    }

    resolve(success)
  })
}

const consume = (onMessage, options = {}) => {
  channel.consume(
    rabbitmqConfig.assetQueue,
    async msg => {
      try {
        await onMessage(JSON.parse(msg.content.toString()))
        channel.ack(msg)
      } catch (error) {
        console.log(error.message)
        channel.nack(msg)
      }
    },
    {
      ...options,
      noAck: false
    }
  )
}

const init = async (queue = rabbitmqConfig.assetQueue) => {
  conecction = await connect()
  channel = await createChannel()
  channel.prefetch(1)
  await assertQueue(queue)
  console.log(`🚀 RabbitMQ connected to ${queue}`)
}

module.exports = {
  init,
  connect,
  createChannel,
  assertQueue,
  consume,
  sendToQueue
}
