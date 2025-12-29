import { Hono } from 'hono'
import { insertChat, getHistory } from '../db.js'

const ai = new Hono()

ai.post('/chat', async c => {
  const body = await c.req.json().catch(() => ({}))
  const text = body.text?.trim()

  if (!text) {
    return c.json({ reply: '❌ Pesan kosong' }, 400)
  }

  const session =
    c.req.header('x-session-id') || 'default'

  // simpan USER dulu
  insertChat(session, 'user', text)

  const prompt = `Kamu adalah Kauruko Wuguri.
Tenang, lembut, anggun, menenangkan.`

  const url =
    `https://api.siputzx.my.id/api/ai/gpt3?` +
    `prompt=${encodeURIComponent(prompt)}&` +
    `content=${encodeURIComponent(text)}`

  let reply = null

  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 15000)

    const res = await fetch(url, { signal: controller.signal })
    const data = await res.json()

    reply =
      data?.result ||
      data?.reply ||
      data?.data ||
      null

  } catch (e) {
    console.error('AI ERROR:', e)
  }

  // 🚨 JANGAN SIMPAN KALAU GAGAL
  if (!reply) {
    return c.json({
      character: 'Kauruko Wuguri',
      reply: '🌸 Maaf… Waguri belum bisa menjawab sekarang.'
    })
  }

  // simpan AI cuma kalau valid
  insertChat(session, 'ai', reply)

  return c.json({
    character: 'Kauruko Wuguri',
    reply
  })
})

ai.get('/history/:session', c => {
  return c.json(
    getHistory(c.req.param('session'))
  )
})

export default ai