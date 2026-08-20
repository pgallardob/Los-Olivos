// OpenAI Provider — preparado para implementación futura.
// No se activa mientras AI_PROVIDER=gemini.

export class OpenAIProvider {
  constructor() {
    throw new Error('OpenAIProvider no implementado aún. Usar AI_PROVIDER=gemini.');
  }

  async generateResponse() {
    throw new Error('No implementado.');
  }

  getModel() {
    return 'not-implemented';
  }

  getProviderName() {
    return 'openai';
  }
}
