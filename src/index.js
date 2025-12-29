import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import ai from './routes/ai.js'
import { initDB } from './db.js'
import chalk from 'chalk'
await initDB()

const app = new Hono()
app.use('/*', serveStatic({ root: './public' }))
app.route('/api', ai)

serve({
  fetch: app.fetch,
  port: 4590
})

console.log(chalk.green(`Web Is Running`));