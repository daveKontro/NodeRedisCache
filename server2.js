'use strict'
const { promisify } = require('util')
const express = require('express')
const fetch = require('node-fetch')
const redis = require('redis')
const { userInfo } = require('./urls')

const app = express()

// NOTE: uses redis HSETNX command to 
// cache hash field value pairs...
// get user information by phone number

// env vars
const PORT = process.env.PORT || 3000
const REDIS_PORT = process.env.REDIS_PORT || 6379

// redis (asynchronous)
const client = redis.createClient(REDIS_PORT)
const clientHgetallAsync = promisify(client.hgetall).bind(client)
const clientHsetnxAsync = promisify(client.hsetnx).bind(client)
const clientExpireAsync = promisify(client.expire).bind(client)

// common
const formatHashKey = phone => `phone:${phone}`

const setResponse = user => (
  '<div>' +
    `<h2><u>${user.name}</u></h2>` +
    `<h3>email: ${user.email}</h3>` +
    `<h3>phone: ${user.phone}</h3>` +
    `<h3>dob: ${user.dob}</h3>` +
  '</div>'
)

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
    const email = user.email
    const dob = new Date(user.dob.date)
    return { name, phone, email, dob }
  } 

  const storeData = async user => {
    const hashKey = formatHashKey(user.phone)
    
    try {
      // FYI per redis docs HMSET is considered deprecated
      Object.entries(user).map(async ([field, value]) => (
        await clientHsetnxAsync(hashKey, [field, value])
      ))
      await clientExpireAsync(hashKey, (60 * 60))
      res.send(setResponse(user))
    } catch(err) {
      res.status(500)
    }
  }

  const rawData = await fetchRawData(userInfo)
  const user = parseRawData(phone, rawData)
  await storeData(user)
}

const cache = async (req, res, next) => {
  const { phone } = req.params

  try {
    const hashKey = formatHashKey(phone)
    const user = await clientHgetallAsync(hashKey)

    if (user !== null) {
      console.log('retrieved from cache...')
      res.send(setResponse(user))
    } else {
      next()
    }
  } catch(err) {
    res.status(500)
  }
}

// crud
app.get('/', (req, res) => (
  res.send('<h2>let\'s test NodeRedisCache server2</h2>')
))

app.get('/users/:phone', cache, getUsers)

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`)
})


// usage:
//
// 1) start redis-server
// 2) start NodeRedisCache server2.js: npm run dev2
// 3) open DevTools Network tab, watch Finish in footer
// 4) open following url then refresh several times
//   - http://localhost:3000/users/(320)-428-3969
//   - http://localhost:3000/users/(057)-889-6313
