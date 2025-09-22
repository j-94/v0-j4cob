"use client"
import { useState } from "react"

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [log, setLog] = useState("")

  async function send() {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    })
    const reader = res.body?.getReader()
    if (!reader) return
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setLog(t => t + decoder.decode(value))
    }
  }

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={send}>Send</button>
      <pre>{log}</pre>
    </div>
  )
}
