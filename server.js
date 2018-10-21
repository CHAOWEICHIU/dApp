const express = require('express')
const bodyParser = require('body-parser')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express()

  server.use(bodyParser.json())

  // Server-side

  server.get('/game/:id', (req, res) => {
    return app.render(req, res, '/game', req.params)
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  /* eslint-disable no-console */
  server.listen(3000, (err) => {
    if (err) throw err
    console.log('Server ready on http://localhost:3000');
  })
})
