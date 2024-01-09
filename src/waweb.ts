import { Socket } from 'socket.io'
import waweb from 'whatsapp-web.js'
import type { Client as WaWebClient } from 'whatsapp-web.js'
import { getResponse } from '@/openai'

const { Client, LocalAuth } = waweb

declare module 'whatsapp-web.js' {
    interface Client {
        initialized: boolean
    }
}

const store : {
    [user_id: string]: WaWebClient
} = {}

function setMessageEvent( user: string, client: WaWebClient ) {
    client.removeAllListeners('message')
    client.on('message', async (message) => {
        console.log(`${user} received a message`)
        if ( message.fromMe )
            return
        if ( message.type !== 'chat' )
            return
        console.log(`${user} received a text message`)
        const response = (await getResponse(user, message.body)).content
        if ( ! response )
            return
        message.reply(response)
    })
}

function initialize( user: string, client: WaWebClient ) {
    client.initialize().then( () => {
        client.initialized = true
        console.log(`${user} initialized`)
        store[user] = client
    })
}

function userOrFalse( socket: Socket ) {
    const user = socket.auth?.user.sub
    if ( ! user )
        return false
    console.log(`${user} connected`)
    return user
}

function existingOrNewClient( user: string ) {
    if ( store[user] ) {
        console.log(`${user} already stored`)
        return store[user]
    } else {
        console.log(`${user} new client`)
    }

    return new Client({
        puppeteer: {
            headless: true,
            args: [
            '--no-sandbox',
            '--no-first-run',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--single-process',
            '--no-zygote',
            ],
        },
    })
}

export default function ( socket: Socket ) {
    console.log('New connection')

    const user = userOrFalse(socket)

    if ( ! user )
        return socket.disconnect()
    
    const client = existingOrNewClient( user )

    client.on('qr', (qr: string) => socket.emit('waweb.qrcode', qr))
    client.on('ready', () => socket.emit('waweb.ready'))
    client.on('disconnected', () => {
        console.log(`${user} disconnected`)
        delete store[user]
        socket.emit('waweb.disconnected')
    })

    socket.on('waweb.on', () => {
        setMessageEvent(user, client)
        console.log(`${user} on`)
    })
    socket.on('waweb.off', () => {
        client.removeAllListeners('message')
        console.log(`${user} off`)
    })
    if ( ! client.initialized ) {
        console.log (`${user} initializing`)
        initialize(user, client)
    } else {
        socket.emit('waweb.ready')
        console.log(`${user} already initialized`)
    }
}
