import 'dotenv/config'
import app, { io } from './app'
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
    baseURL: 'http://localhost:4000',
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: 'https://asasvirtuais.us.auth0.com',
    attemptSilentLogin: true
}))

app.get('/', (_req, res) => res.send('ok'))

io.on('connection', (socket) => {
    console.log('Socket connected')
})

io.use((socket) => {
    socket.on('waweb.qrcode.get', () => {
        console.log('waweb')
        socket.emit('waweb.qrcode.res', 'test')
    })
})

app.listen(4000, () => {
    console.log(`listening on port 4000`)
})
