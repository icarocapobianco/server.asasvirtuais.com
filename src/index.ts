import 'dotenv/config'
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import waweb from './socket/waweb'
import expressAuth from './express/auth'
import socketAuth from './socket/auth'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    transports: ['websocket'],
    cors: { origin: '*' }
})

expressAuth(app)
socketAuth(io)
waweb(io)

const port = process.env.PORT

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})
