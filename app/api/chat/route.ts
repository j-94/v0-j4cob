import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [{ role: "user", content: message }],
    }),
  })
  return new Response(response.body, {
    headers: { "Content-Type": "text/event-stream" },
  })
}
