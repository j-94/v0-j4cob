import OpenAI from "openai"

export class LLMClient {
  constructor(config) {
    this.config = config
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async complete(systemPrompt, userPrompt, options = {}) {
    const response = await this.client.chat.completions.create({
      model: options.model || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: options.max_tokens ?? 400,
      temperature: options.temperature ?? 0.7,
    })

    return response.choices[0].message.content
  }
}
