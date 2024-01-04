import 'dotenv/config'
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import socketio from './socket'
import expressIndex from './express'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    transports: ['websocket'],
    cors: { origin: '*' }
})

expressIndex(app)
socketio(io)

const port = process.env.PORT

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})
