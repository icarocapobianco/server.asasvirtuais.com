import http from 'http'
import express from 'express'
import { Server } from 'socket.io'

const isDev = process.env.NODE_ENV === 'development'
const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    transports: ['websocket'],
    cors: { origin: '*' }
})

export {
    io,
    server,
    app,
    isDev
}

export default app

