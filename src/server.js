import express from 'express'
import session from 'express-session'
import fs from 'fs'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import DBComponent from './DBcomponent.js'
import Session from './session.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Serve static files (index.html, styles.css) from parent directory
app.use(express.static(path.join(__dirname, '..')))

// CORS
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:5501', 'http://localhost:5501'],
    credentials: true
}))

const config = JSON.parse(fs.readFileSync('../config.json'))
const queries = JSON.parse(fs.readFileSync('../sentences.json'))

const db = new DBComponent()
const sessionManager = new Session()

app.use(express.json())

// SESSION
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}))

// LOGIN
app.post('/login', async (request, response) => {

    try {

        const { correo, password } = request.body

        const users = await db.execute(
            queries.login,
            [correo, password]
        )

        if (users.length === 0) {

            return response.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            })
        }

        sessionManager.createSession(request, users[0])

        response.json({
            success: true,
            message: `Bienvenido de nuevo ${users[0].username}`
        })
    }
    catch (error) {

        response.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// PROFILE
app.get('/profile', (request, response) => {

    if (!sessionManager.sessionExist(request.session)) {

        return response.status(401).json({
            success: false,
            message: 'Sesión no válida'
        })
    }

    response.json({
        success: true,
        user: sessionManager.getUser(request.session)
    })
})

// LOGOUT
app.post('/logout', (request, response) => {

    sessionManager.destroySession(request)

    response.json({
        success: true,
        message: 'Sesión cerrada'
    })
})

app.listen(config.server.port, () => {

    console.log(`Server running on port ${config.server.port}`)
})