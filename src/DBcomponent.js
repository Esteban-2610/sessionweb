import pg from 'pg'
import fs from 'fs'

const config = JSON.parse(fs.readFileSync('../config.json'))

class DBComponent {

    constructor() {

        this.pool = new pg.Pool({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            port: config.database.port,
            max: config.database.max,
            idleTimeoutMillis: config.database.idleTimeoutMillis,
            connectionTimeoutMillis: config.database.connectionTimeoutMillis
        })
    }

    async execute(query, params = []) {

        const client = await this.pool.connect()

        try {
            const result = await client.query(query, params)
            return result.rows
        }
        finally {
            client.release()
        }
  }
}

export default DBComponent