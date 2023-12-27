import { Server } from 'socket.io'
import { auth0Middleware } from 'auth0-socketio'
import { Client } from 'whatsapp-web.js'

declare module 'whatsapp-web.js' {
    interface Client {
        initializing?: boolean
    }
}

const store : {
    [key: string]: Client
} = {}

export default function( io : Server ) {
    const withAuthentication = auth0Middleware('asasvirtuais.us.auth0.com')
    io
    .of('/waweb')
    .use(withAuthentication)
    .on('connection', async (socket) => {
        const user = socket.auth?.user?.sub
        console.log(`${user} connected`)
        if ( ! user )
            return socket.disconnect()
        let client = store[user]
        if ( client ) {
            console.log(`${user} already ready`)
            socket.emit('ready')
        } else {
            client = new Client({})
            client.initialize().then( () => {
                console.log(`${user} ready`)
                store[user] = client
            } )
        }
        client.on('qr', qr => socket.emit('qr', qr))
        client.on('ready', () => socket.emit('ready'))
        client.on('disconnected', () => {
            delete store[user]
            socket.emit('disconnected')
        })
        client.on('message', message => {
            console.log(`${user} received message: ${message.body}`)
            console.log(message)
            if ( message.fromMe ) {
                console.log('Message from user')
                message.reply('This message is just an example, and doesn\'t use AI')
            }
        })

    })
}

