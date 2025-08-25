const HF_API_URL = "https://router.huggingface.co/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function streamHuggingFace(
  messages: ChatMessage[],
  model = "openai/gpt-oss-120b:groq",
) {
  const response = await fetch(`${HF_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
    },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") {
        return full;
      }
      try {
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content;
        if (content) {
          full += content;
        }
      } catch {
        // ignore malformed JSON lines
      }
    }
  }

  return full;
}
