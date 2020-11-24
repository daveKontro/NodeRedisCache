'use strict'
const { promisify } = require('util')
const express = require('express')
const fetch = require('node-fetch')
const redis = require('redis')
const { userNames } = require('./urls')

const app = express()

// NOTE: uses redis SETNX command to
// cache simple key value pair...
// get name by phone number

// env vars
const PORT = process.env.PORT || 3000
const REDIS_PORT = process.env.REDIS_PORT || 6379

// redis (asynchronous)
const client = redis.createClient(REDIS_PORT)
const clientGetAsync = promisify(client.get).bind(client)
const clientSetnxAsync = promisify(client.setnx).bind(client)
const clientExpireAsync = promisify(client.expire).bind(client)

// common
const setResponse = name => `<div><h2>${name}</h2></div>`

// middleware
const getUsers = async (req, res, next) => {
  const { phone } = req.params

  const fetchRawData = async url => {
    try {
      console.log('fetching data...')

      const response = await fetch(url)
      return await response.json()
    } catch (err) {
      res.status(500)
    }
  }

  const parseRawData = (phone, rawData) => {
    const user = rawData.results.filter(user => user.phone === phone)[0]
    const name = `${user.name.title}. ${user.name.first} ${user.name.last}`
    return name
  } 

  const storeData = async name => {
    try {
      await clientSetnxAsync(phone, name)
      await clientExpireAsync(phone, (60 * 60))
      res.send(setResponse(name))
    } catch(err) {
      res.status(500)
    }
  }

  const rawData = await fetchRawData(userNames)
  const name = parseRawData(phone, rawData)
  await storeData(name)
}

const cache = async (req, res, next) => {
  const { phone } = req.params

  try {
    const name = await clientGetAsync(phone)

    if (name !== null) {
      console.log('retrieved from cache...')
      res.send(setResponse(name))
    } else {
      next()
    }
  } catch(err) {
    res.status(500)
  }
}

// crud
app.get('/', (req, res) => (
  res.send('<h2>let\'s test NodeRedisCache server</h2>')
))

app.get('/users/:phone', cache, getUsers)

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`)
})


// usage:
//
// 1) start redis-server
// 2) start NodeRedisCache server.js: npm run dev
// 3) open DevTools Network tab, watch Finish in footer
// 4) open following url then refresh several times
//   - http://localhost:3000/users/(320)-428-3969
//   - http://localhost:3000/users/(057)-889-6313
