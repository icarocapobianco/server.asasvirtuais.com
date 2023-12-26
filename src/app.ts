import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import { auth0Middleware } from 'auth0-socketio'

const isDev = process.env.NODE_ENV === 'development'
const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    transports: ['websocket'],
    cors: { origin: '*' }
})

const withAuthentication = auth0Middleware('asasvirtuais.us.auth0.com')

io.use(withAuthentication)

export {
    io,
    server,
    app,
    isDev
}

export default app

