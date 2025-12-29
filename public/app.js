import { Hono } from 'hono'
import ai from './routes/ai.js'
import { initDB } from './db.js'

const app = new Hono()

let dbReady = false

// Lazy init DB (AMAN di serverless)
app.use('*', async (c, next) => {
  if (!dbReady) {
    await initDB()
    dbReady = true
  }
  await next()
})

// API routes
app.route('/api', ai)

export default app