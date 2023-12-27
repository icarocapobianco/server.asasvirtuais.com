import { Express } from 'express'
import eoidc from 'express-openid-connect'

export default function expressIndex( app: Express ) {

    app.use(eoidc.auth({
        authRequired: false,
        auth0Logout: false,
        secret: process.env.AUTH0_SECRET,
        baseURL: process.env.AUTH0_BASE_URL,
        clientID: process.env.AUTH0_CLIENT_ID,
        issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
        attemptSilentLogin: true
    }))

}
