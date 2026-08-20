import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/config.js';

export class GeminiProvider {
  constructor() {
    if (!config.ai.apiKey) {
      throw new Error('GEMINI_API_KEY no configurada en .env');
    }
    this.ai = new GoogleGenAI({ apiKey: config.ai.apiKey });
    this.model = config.ai.model;
  }

  async generateResponse(systemPrompt, userMessage, contextBlock, history = []) {
    const contents = [];

    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: `${contextBlock}\n\nPregunta del cliente: ${userMessage}` }],
    });

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini no devolvió texto.');
    }

    return text.trim();
  }

  getModel() {
    return this.model;
  }

  getProviderName() {
    return 'gemini';
  }
}
