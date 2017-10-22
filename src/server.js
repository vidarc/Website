import express from 'express'
import logger from 'morgan'
import bodyParser from 'body-parser'
import colors from 'colors'
import mongodb from 'mongodb'
import path from 'path'
import compression from 'compression'
import fs from 'fs'
import handlebars from 'handlebars'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, matchPath } from 'react-router-dom'
import App from './components/App'

dotenv.config()

const server = express()

server.set('port', process.env.PORT || 3000)
server.use(compression())
server.use(express.static(path.resolve(`${__dirname}/`), { index: false }))
server.use(logger('dev'))
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

let db
const mongoClient = mongodb.MongoClient
mongoClient.connect('mongodb://localhost:27017/website', (err, database) => {
  if (err) {
    console.log('unable to connect to the database')
  } else {
    db = database
  }
})

/** **********************************************
* My api for the Met Museum Public Domain art   *
* database. Work around using their APIs and a  *
* database running on MongoDB                   *
*********************************************** */
// Get the image I can use based on the image ID
// Returns a JSON object with a image url I can use
function getImage(id) {
  const url = `https://metmuseum.org/api/Collection/additionalImages?crdId=${id}`

  return fetch(url)
    .then(response => response.json())
    .then(response => response.results[0].imageUrl)
    .catch(err => console.log(err))
}

server.get('/art/image/:id', (req, res) => {
  getImage(req.params.id).then(response => res.send(response))
})

// Return 15 randomized public domain images from my copy of their database
server.get('/art/images', (req, res) => {
  db
    .collection('art_images')
    .aggregate([
      { $match: { 'Is Public Domain': 'True' } },
      { $sample: { size: 15 } },
      {
        $project: {
          object_id: '$Object ID',
          department: '$Department',
          title: '$Title',
          artist: '$Artist Display Name',
          artist_bio: '$Artist Display Bio',
          date: '$Object Date',
          medium: '$Medium',
        },
      },
    ])
    .toArray((err, result) => {
      result.map(art => Object.assign(art, { image_url: getImage(art.object_id).then(response => response) }))
      res.json(result)
    })
})

// Return 15 randomized public domain images based upon art department
server.get('/art/images/:department', (req, res) => {
  db
    .collection('art_images')
    .aggregate([
      { $match: { 'Is Public Domain': 'True', Department: req.params.department } },
      { $dample: { size: 15 } },
      {
        $project: {
          object_id: '$Object ID',
          department: '$Department',
          title: '$Title',
          artist: '$Artist Display Name',
          artist_bio: '$Artist Display Bio',
          date: '$Object Date',
          medium: '$Medium',
        },
      },
    ])
    .toArray((err, result) => {
      res.json(result)
    })
})

/** **********************************************
* api for the contact form                      *
* verify recaptcha then email it off            *
*********************************************** */
server.post('/email', (req, res) => {
  fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: JSON.stringify({
      secret: process.env.REACT_APP_RECAPTCHA_SECRET,
      response: req.body.response,
    }),
  })
    .then(response => response.json())
    .then(jsonResponse => console.log(jsonResponse.success))
    .catch(error => console.log(error))

  res.json({
    success: 'true',
  })
})

/** **********************************************
* Server routing using React Router server side *
* rendering.                                    *
*********************************************** */
const routes = ['', '/about', '/admin', '/blog', '/contact', '/login', '/projects', '/projects/art', '/resume']

server.get('*', (req, res) => {
  const match = routes.reduce((acc, route) => matchPath(req.url, route, { exact: true }) || acc, null)

  if (!match) {
    res.send('page not found')
    return
  }

  fs.readFile(path.resolve(__dirname, 'index.html'), 'utf8', (err, htmlData) => {
    const reactApp = renderToString(<StaticRouter context={{}} location={req.url}>
      <App />
                                    </StaticRouter>)
    const context = { body: reactApp }
    const template = handlebars.compile(htmlData)
    res.send(template(context))
  })
})

const serverConfig = server.listen(server.get('port'), () => {
  const { host, port } = serverConfig.address()
  const message = `Express server running at: ${host} on port ${port}`

  console.log(message.red.underline)
})
