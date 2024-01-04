import { Socket } from 'socket.io'
import waweb from 'whatsapp-web.js'
import type { Client as WaWebClient } from 'whatsapp-web.js'
import { getResponse } from '@/openai'

const { Client, LocalAuth } = waweb

const store : {
    [user_id: string]: WaWebClient
} = {}

type Settings = {
    replies: 'all' | 'none'
}

export function initialize( user: string, client: WaWebClient ) {
    client.initialize().then( () => {
        console.log(`${user} ready`)
        store[user] = client
    })
}

export default function ( socket: Socket ) {
    const user = socket.auth?.user?.sub
    console.log(`${user} connected`)
    if ( ! user )
        return socket.disconnect()
    let client = store[user]
    if ( client ) {
        console.log(`${user} already ready`)
        socket.emit('waweb.ready')
        initialize(user, client)
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
        initialize(user, client)
        console.log(`${user} initializing`)
    }
    client.on('qr', (qr: string) => socket.emit('waweb.qrcode', qr))
    client.on('ready', () => socket.emit('waweb.ready'))
    client.on('disconnected', () => {
        delete store[user]
        socket.emit('waweb.disconnected')
    })
    socket.on('waweb.settings', (settings: Settings) => {

        if ( settings.replies === 'all' )
            console.log(`${user} set replies to all`)

        client.removeAllListeners('message')

        if ( settings.replies === 'none' ) {
            console.log(`${user} set replies to none`)
            return
        }

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
    })
}
