import { Socket } from 'socket.io'
import waweb from 'whatsapp-web.js'
import type { Client as WaWebClient } from 'whatsapp-web.js'
import { getResponse } from '@/openai'

const { Client, LocalAuth } = waweb

declare module 'whatsapp-web.js' {
    interface Client {
        initializing?: boolean
    }
}

const store : {
    [key: string]: WaWebClient
} = {}

export default function ( socket: Socket ) {
    const user = socket.auth?.user?.sub
    console.log(`${user} connected`)
    if ( ! user )
        return socket.disconnect()
    let client = store[user]
    if ( client ) {
        console.log(`${user} already ready`)
        socket.emit('ready')
    } else {
        client = new Client({
            authStrategy: new LocalAuth({ clientId: user.split('|')[1] }),
            puppeteer: {
              headless: true,
              args: [
                "--no-sandbox",
                "--no-first-run",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
                "--single-process",
                "--no-zygote",
              ],
            },
        })
        client.initialize().then( () => {
            console.log(`${user} ready`)
            store[user] = client
        } )
    }
    client.on('qr', (qr: string) => socket.emit('qr', qr))
    client.on('ready', () => socket.emit('ready'))
    client.on('disconnected', () => {
        delete store[user]
        socket.emit('disconnected')
    })
    client.on('message', async (message) => {
        console.log(`${user} received a message`)
        if ( message.type !== 'chat' )
            return
        if ( message.fromMe )
            return
        console.log(`${user} received a text message`)
        const response = (await getResponse(user, message.body)).content
        if ( ! response )
            return
        message.reply(response)
    })

}