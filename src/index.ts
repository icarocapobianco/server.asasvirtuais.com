import 'dotenv/config'

import app from './app'
import eoidc from 'express-openid-connect'
import { Client } from 'whatsapp-web.js'

declare module 'whatsapp-web.js' {
    interface Client {
        initializing?: boolean
    }
}

app.use(eoidc.auth({
    authRequired: false,
    auth0Logout: false,
    secret: process.env.AUTH0_SECRET,
    baseURL: 'http://localhost:4000',
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: 'https://asasvirtuais.us.auth0.com'
  }))

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
})

const store : {
    [key: string]: Client
} = {}

app.get('/waweb', eoidc.requiresAuth(), async (req, res) => {

    const id = req.oidc.user?.sub
    if ( ! id )
        throw new Error('Failed to get user id')

    const client = store[id] ?? new Client({})

    if ( ! store[id] ) {
        store[id] = client
        client.initialize()
        res.json(
            await new Promise(
                res => client.on('qr', res)
            )
        )
    } else {
        if ( client.initializing )
            res.json(false)
        else
            res.json(true)
    }
})

app.listen(4000, () => {
    console.log(`listening on port 4000`)
})
