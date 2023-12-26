import { Server } from 'socket.io'
import { auth0Middleware } from 'auth0-socketio'

export default function socketAuth(io: Server) {

    const withAuthentication = auth0Middleware('asasvirtuais.us.auth0.com')

    io.use(withAuthentication)

}
