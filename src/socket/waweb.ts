
import { Server } from 'socket.io'
import { Client } from 'whatsapp-web.js'

declare module 'whatsapp-web.js' {
    interface Client {
        initializing?: boolean
    }
}

const store : {
    [key: string]: Client
} = {}

export default function waweb( io : Server ) {
    io.use((socket, next) => {
        socket.on('waweb.qrcode.get', () => {
            socket.emit('waweb.qrcode.res', 'test')
        })
        next()
    })
}
