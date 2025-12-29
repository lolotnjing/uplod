import initSqlJs from 'sql.js'
import fs from 'fs'

const DB_FILE = './chat.db'

let db

export async function initDB() {
  const SQL = await initSqlJs()

  if (fs.existsSync(DB_FILE)) {
    const filebuffer = fs.readFileSync(DB_FILE)
    db = new SQL.Database(filebuffer)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      role TEXT,
      message TEXT,
      created_at TEXT
    )
  `)

  saveDB()
}

export function saveDB() {
  const data = db.export()
  fs.writeFileSync(DB_FILE, Buffer.from(data))
}

export function insertChat(session, role, message) {
  db.run(
    `INSERT INTO chats (session_id, role, message, created_at)
     VALUES (?, ?, ?, datetime('now'))`,
    [session, role, message]
  )
  saveDB()
}

export function getHistory(session) {
  const res = db.exec(
    `SELECT role, message, created_at
     FROM chats
     WHERE session_id = ?
     ORDER BY id ASC`,
    [session]
  )

  if (!res[0]) return []

  const cols = res[0].columns
  return res[0].values.map(v =>
    Object.fromEntries(cols.map((c, i) => [c, v[i]]))
  )
}