const { defineConfig } = require('@vue/cli-service')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')

const ORDER_SERVICE_URL = (process.env.VUE_APP_ORDER_SERVICE_URL || 'http://localhost:3000/')
const PRODUCT_SERVICE_URL = (process.env.VUE_APP_PRODUCT_SERVICE_URL || 'http://localhost:3002/')
const MAKELINE_SERVICE_URL = (process.env.VUE_APP_MAKELINE_SERVICE_URL || 'http://localhost:3001/')

async function parseResponseBody(response) {
  const rawBody = await response.text()

  if (!rawBody) {
    return null
  }

  try {
    return JSON.parse(rawBody)
  } catch (error) {
    return rawBody
  }
}

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Best Buy Admin Dashboard'
    }
  },
  devServer: {
    port: 8081,
    host: '0.0.0.0',
    allowedHosts: 'all',
    client: false,
    webSocketServer: false,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      devServer.app.use(bodyParser.json())

      devServer.app.get('/health', (_, res) => {
        const version = process.env.APP_VERSION || '0.1.0'
        res.send({ status: 'ok', version })
      })

      devServer.app.get('/orders', (_, res) => {
        fetch(`${ORDER_SERVICE_URL}orders`)
          .then(async response => {
            const data = await parseResponseBody(response)
            res.status(response.status).send(data)
          })
          .catch(error => {
            console.log(error)
            res.status(502).send({ error: 'Unable to fetch orders from order-service' })
          })
      })

      devServer.app.get('/orders/:id', (req, res) => {
        fetch(`${ORDER_SERVICE_URL}orders/${req.params.id}`)
          .then(async response => {
            const data = await parseResponseBody(response)
            res.status(response.status).send(data)
          })
          .catch(error => {
            console.log(error)
            res.status(502).send({ error: 'Unable to fetch order from order-service' })
          })
      })

      devServer.app.get('/makeline/order/fetch', (_, res) => {
        fetch(`${MAKELINE_SERVICE_URL}order/fetch`)
          .then(async response => {
            const data = await parseResponseBody(response)
            res.status(response.status).send(data)
          })
          .catch(error => {
            console.error(error)
            res.status(502).send({ error: 'Unable to fetch orders from makeline-service' })
          })
      })

      devServer.app.get('/makeline/order/:id', (req, res) => {
        fetch(`${MAKELINE_SERVICE_URL}order/${req.params.id}`)
          .then(async response => {
            const data = await parseResponseBody(response)
            res.status(response.status).send(data)
          })
          .catch(error => {
            console.log(error)
            res.status(502).send({ error: 'Unable to fetch order from makeline-service' })
          })
      })

      devServer.app.put('/makeline/order', (req, res) => {
        fetch(`${MAKELINE_SERVICE_URL}order`, {
          method: 'PUT',
          body: JSON.stringify(req.body),
          headers: { 'Content-Type': 'application/json' }
        })
          .then(async response => {
            const responseText = await response.text()
            res.status(response.status).send(responseText)
          })
          .catch(error => {
            console.log(error)
            res.status(502).send({ error: 'Unable to update order in makeline-service' })
          })
      })

      devServer.app.get('/products', (_, res) => {
        fetch(`${PRODUCT_SERVICE_URL}`)
          .then(response => response.json())
          .then(products => {
            res.send(products)
          })
          .catch(error => {
            console.log(error)
            res.status(502).send({ error: 'Unable to fetch products from product-service' })
          })
      })

      devServer.app.get('/product/:id', (req, res) => {
        fetch(`${PRODUCT_SERVICE_URL}${req.params.id}`)
          .then(response => response.json())
          .then(product => {
            res.send(product)
          })
          .catch(error => {
            console.log(error)
            res.status(502).send({ error: 'Unable to fetch product from product-service' })
          })
      })

      devServer.app.post('/product', (req, res) => {
        fetch(`${PRODUCT_SERVICE_URL}`, {
          method: 'POST',
          body: JSON.stringify(req.body),
          headers: { 'Content-Type': 'application/json' }
        })
          .then(response => response.json())
          .then(product => {
            res.send(product)
          })
          .catch(error => {
            console.log(error)
            res.status(502).send({ error: 'Unable to create product in product-service' })
          })
      })

      devServer.app.put('/product', (req, res) => {
        fetch(`${PRODUCT_SERVICE_URL}`, {
          method: 'PUT',
          body: JSON.stringify(req.body),
          headers: { 'Content-Type': 'application/json' }
        })
          .then(response => response.json())
          .then(product => {
            res.send(product)
          })
          .catch(error => {
            console.log(error)
            res.status(502).send({ error: 'Unable to update product in product-service' })
          })
      })

      return middlewares
    }
  }
})
