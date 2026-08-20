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

export async function generateResponse(userMessage, context, intent, history = []) {
  const ai = await getProvider();
  const systemPrompt = getSystemPrompt();
  const contextBlock = `Contexto del catálogo:\n${context || 'Sin contexto de productos.'}`;

  const reply = await ai.generateResponse(systemPrompt, userMessage, contextBlock, history);
  return verifyPrices(reply, context);
}
