import { config } from '../../config/config.js';
import { getSystemPrompt } from './prompt.js';

let provider = null;

async function getProvider() {
  if (provider) return provider;

  if (config.ai.provider === 'gemini') {
    const { GeminiProvider } = await import('./gemini.provider.js');
    provider = new GeminiProvider();
  } else {
    throw new Error(`Proveedor de IA no soportado: ${config.ai.provider}`);
  }

  return provider;
}

/**
 * Post-procesa la respuesta de la IA para corregir precios truncados.
 * Extrae los precios reales del contexto y verifica que los precios
 * mencionados en la respuesta coincidan.
 */
function verifyPrices(reply, context) {
  if (!context || !reply) return reply;

  // Extraer pares producto → precio del contexto
  const contextPrices = new Map();
  const contextLines = context.split('\n');
  for (const line of contextLines) {
    const match = line.match(/Producto:\s*(.+?),\s*Precio:\s*\$(\d+)/i);
    if (match) {
      const [, name, price] = match;
      contextPrices.set(parseInt(price, 10), name.trim());
    }
  }

  if (contextPrices.size === 0) return reply;

  // Para cada precio del contexto, verificar si la respuesta lo truncó
  let corrected = reply;
  for (const [realPrice, productName] of contextPrices) {
    const realPriceStr = String(realPrice);
    // Si el precio real tiene 3+ dígitos, buscar versiones truncadas
    if (realPriceStr.length >= 3) {
      const truncatedPrice = realPriceStr.slice(0, -1);
      const truncatedPattern = new RegExp(`\\$${truncatedPrice}\\b(?!\\d)`, 'g');

      // Verificar si el precio real ya está correctamente en la respuesta
      const hasRealPrice = new RegExp(`\\$${realPriceStr}($|\\s|\\.|,)`).test(corrected) ||
                           new RegExp(`\\$${realPrice.toLocaleString('es-CL')}`).test(corrected);

      if (!hasRealPrice && truncatedPattern.test(corrected)) {
        const formattedPrice = realPrice.toLocaleString('es-CL');
        corrected = corrected.replace(truncatedPattern, `$${formattedPrice}`);
      }
    }
  }

  return corrected;
}

const AI_TIMEOUT_FIRST_MS = 15_000;
const AI_TIMEOUT_RETRY_MS = 10_000;

// Corta la llamada si la IA no responde: sin esto, un cuelgue de la API deja al
// cliente esperando una respuesta que nunca llega (fetch sin timeout por defecto).
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`La IA no respondió en ${Math.round(ms / 1000)}s`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function generateResponse(userMessage, context, intent, history = []) {
  const ai = await getProvider();
  const systemPrompt = getSystemPrompt();
  const contextBlock = `Contexto del catálogo:\n${context || 'Sin contexto de productos.'}`;

  let reply;
  try {
    reply = await withTimeout(ai.generateResponse(systemPrompt, userMessage, contextBlock, history), AI_TIMEOUT_FIRST_MS);
  } catch (firstError) {
    // Reintento único tras pausa breve (la API falla intermitentemente por límite de tasa)
    console.error('[ai] reintento tras error:', firstError.message);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    reply = await withTimeout(ai.generateResponse(systemPrompt, userMessage, contextBlock, history), AI_TIMEOUT_RETRY_MS);
  }
  return verifyPrices(reply, context);
}
