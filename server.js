import express from 'express'
import logger from 'morgan'
import bodyParser from 'body-parser'
import colors from 'colors'
import mongoClient from 'mongodb'
import assert from 'assert'
import path from 'path'

let app = express()

app.set('port', process.env.PORT || 3000)
app.use(express.static(__dirname + '/build'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// // Mongo connection
// const mongoURL = 'mongodb://localhost/website'
//
// MongoClient.connect(mongoURL, function(err, db) {
//   assert.equal(null, err)
//   console.log("connected to the mongo server")
//
//   db.close
// })

app.get('*', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
});

let server = app.listen(app.get('port'), function () {
  let host = server.address().address
  let port = server.address().port
  let message = 'Express server running at: ' + host + ' on port ' + port

  console.log(message.red.underline)
});
