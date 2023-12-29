import { Server } from 'socket.io'
import { auth0Middleware } from 'auth0-socketio'
import waweb from '@/waweb'


export default function( io : Server ) {
    const withAuthentication = auth0Middleware('asasvirtuais.us.auth0.com')
    io
    .of('/waweb')
    .use(withAuthentication)
    .on('connection', waweb)
}

