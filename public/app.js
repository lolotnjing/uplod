
const sessionId =
  localStorage.getItem("session_id") ||
  crypto.randomUUID()

localStorage.setItem("session_id", sessionId)


const log = document.getElementById("log")
const input = document.getElementById("input")


let chats = [
  [] // satu tab aja biar fokus memory
]

let currentTab = 0


function renderLog() {
  log.innerHTML = ""

  chats[currentTab].forEach(m => {
    const d = document.createElement("div")
    d.className = "msg " + m.role
    d.innerHTML = formatText(m.text)
    log.appendChild(d)
  })

  log.scrollTop = log.scrollHeight
}


async function loadHistory() {
  try {
    const res = await fetch(`/api/history/${sessionId}`)
    const data = await res.json()

    chats[currentTab] = data.map(row => ({
      role: row.role,
      text: row.message
    }))

    renderLog()
  } catch (err) {
    console.log(`❌ gagal load history ${err}`)
  }
}


async function send() {
  const text = input.value.trim()
  if (!text) return

  // simpan user ke UI
  chats[currentTab].push({
    role: "user",
    text
  })
  renderLog()
  input.value = ""

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId // 🔥 PENTING
      },
      body: JSON.stringify({ text })
    })

    const data = await res.json()

    chats[currentTab].push({
      role: "ai",
      text: data.reply || "Waguri sedang diam 🌸"
    })

  } catch {
    chats[currentTab].push({
      role: "ai",
      text: "❌ Gagal konek ke server"
    })
  }

  renderLog()
}

input.addEventListener("keydown", e => {
  if (e.key === "Enter") send()
})


function formatText(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // heading
    .replace(/^### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^## (.*)$/gm, "<h3>$1</h3>")
    .replace(/^# (.*)$/gm, "<h2>$1</h2>")

    // bold
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")

    // list
    .replace(/^- (.*)$/gm, "<div class='list'>• $1</div>")

    // paragraf
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>")
}


loadHistory()


const bgm = document.getElementById("bgm")
const progress = document.getElementById("progress")
const volume = document.getElementById("volume")
const playBtn = document.getElementById("playBtn")

bgm.volume = 0.5
volume.value = 0.5

function togglePlay() {
  if (bgm.paused) {
    bgm.play()
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
  } else {
    bgm.pause()
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
  }
}

bgm.addEventListener("timeupdate", () => {
  if (!isNaN(bgm.duration)) {
    progress.max = bgm.duration
    progress.value = bgm.currentTime
  }
})

progress.addEventListener("input", () => {
  bgm.currentTime = progress.value
})

volume.addEventListener("input", () => {
  bgm.volume = volume.value
})


function prev() {}
function next() {}
function toggleLoop() {
  bgm.loop = !bgm.loop
}
function lockPlayer() {}