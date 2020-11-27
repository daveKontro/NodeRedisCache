'use strict'
const fetch = require('node-fetch')


const urls = {
  userNames: 'https://randomuser.me/api/?results=3&nat=us&seed=foobar&inc=name,phone',
  userInfo: 'https://randomuser.me/api/?results=3&nat=us&seed=foobar&inc=name,email,phone,dob',
}

const fetchRawData = async (url, res) => {
  try {
    console.log('fetching data...')

    const response = await fetch(url)
    return await response.json()
  } catch (err) {
    res.status(500)
  }
}

exports.fetchUserNames = res => fetchRawData(urls.userNames, res)

exports.fetchUserInfo = res => fetchRawData(urls.userInfo, res)