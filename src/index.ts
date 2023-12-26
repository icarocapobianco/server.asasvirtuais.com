import 'dotenv/config'
import app, { io, server } from './app'
import eoidc from 'express-openid-connect'
import { Client } from 'whatsapp-web.js'

declare module 'whatsapp-web.js' {
    interface Client {
        initializing?: boolean
    }
}

const store : {
    [key: string]: Client
} = {}


app.use(eoidc.auth({
    authRequired: false,
    auth0Logout: false,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    attemptSilentLogin: true
}))

io.on('connection', (socket) => {
    console.log('Socket connected')
})

io.use((socket, next) => {
    socket.on('waweb.qrcode.get', () => {
        socket.emit('waweb.qrcode.res', 'test')
    })
    next()
})

const port = process.env.PORT
server.listen(port, () => {
    console.log(`listening on port ${port}`)
})
