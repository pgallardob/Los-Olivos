import { getCatalog } from '../services/product.service.js';
import { searchProducts, detectIntent, buildContext } from '../services/search.service.js';
import { generateResponse } from '../services/ai/ai.service.js';
import { getBusinessInfo } from '../services/business.service.js';
import { normalizeQuery, normalizeProductName } from '../utils/normalize.js';

export async function handleChat(req, res) {
  const { message, history } = req.body;
  let productContext = '';
  try {
    const catalog = getCatalog();

    if (!catalog) {
      return res.json({
        reply: 'En este momento no tengo acceso al catálogo de productos. Por favor, intenta más tarde.',
      });
    }

    // 1. Detectar intención
    const intent = detectIntent(message);

    // 2. Saludo o despedida — responder directamente sin IA
    if (intent.type === 'greeting') {
      return res.json({
        reply: '¡Hola! Soy el asistente virtual de Comercializadora Los Olivos. Puedo ayudarte con precios, stock, horarios, ubicación, pedidos y más. ¿Qué necesitas?',
      });
    }
    if (intent.type === 'farewell') {
      return res.json({
        reply: '¡Gracias por consultarnos! Estamos aquí para ayudarte cuando necesites. ¡Hasta pronto! 👋',
      });
    }

    // 3. Si es pregunta de negocio, responder directamente
    if (intent.type === 'business') {
      const info = getBusinessInfo();
      const reply = resolveBusinessQuery(intent.key, info);
      if (reply) {
        return res.json({ reply });
      }
    }

    // 3b. Si es sugerencia de productos, devolver productos destacados del catálogo
    if (intent.type === 'product' && intent.subtype === 'suggestion') {
      const suggestions = getSuggestions(catalog.productos);
      if (suggestions.length > 0) {
        return res.json({ reply: suggestions });
      }
    }

    // 4. Si es consulta de productos o intención general, buscar localmente
    let results = [];
    if (intent.type === 'product' || intent.type === 'general') {
      results = searchProducts(message, catalog.productos);
      productContext = buildContext(results, intent);
      // Agregar contexto del negocio para preguntas generales
      if (intent.type === 'general') {
        const info = getBusinessInfo();
        if (info) {
          productContext += `\n\nContexto del negocio:\n` +
            `Nombre: ${info.nombre}\n` +
            `Dirección: ${info.direccion}\n` +
            `Teléfono: ${info.telefono}\n` +
            `WhatsApp: ${info.whatsapp}\n` +
            `Horarios: Lunes a sábado 10:00-20:00, domingo cerrado\n` +
            `Pedidos: ${info.pedidos || 'Por WhatsApp o en el local'}\n` +
            `Delivery: ${info.delivery || 'Consultar por WhatsApp'}\n` +
            `Pagos: ${info.metodos_pago || 'Efectivo y transferencia'}\n` +
            `Redes: Instagram ${info.redes?.instagram || 'N/A'}, WhatsApp ${info.redes?.whatsapp || 'N/A'}`;
        }
      }
    }

    // 4b. Si la consulta es genérica (una sola palabra con muchos resultados), pedir aclaración
    if (isGenericQuery(message) && results.length >= 4) {
      const variations = extractVariations(message, results);
      const hintStr = variations.length > 0
        ? ` Tenemos por ejemplo: ${variations.join(', ')}.`
        : '';
      return res.json({
        reply: `Encontré varios productos relacionados con "${normalizeQuery(message)}". ¿Buscas algún tipo, marca o formato en particular?${hintStr}`,
      });
    }

    // 5. Enviar a IA con contexto
    const reply = await generateResponse(message, productContext, intent, history || []);

    // 5b. Si hay productos en el contexto pero la IA dice que no encontró,
    //     usar el fallback que lista los productos directamente
    if (productContext && productContext.startsWith('Productos encontrados:')) {
      const saysNotFound = /no\s+(encontr|tenemos|no\s+tenemos)/i.test(reply) &&
                           !/\$\d/.test(reply);
      if (saysNotFound) {
        return res.json({ reply: getFallbackResponse(productContext) });
      }
    }

    res.json({ reply });
  } catch (error) {
    console.error('[chat]', error.message);
    res.json({
      reply: getFallbackResponse(productContext),
    });
  }
}

function resolveBusinessQuery(key, info) {
  if (!info) return null;

  switch (key) {
    case 'address':
      return `Estamos ubicados en ${info.direccion}. 📍 ${info.mapsUrl || ''}`;
    case 'hours':
      return formatHours(info.horarios);
    case 'phone':
      return `Nuestro teléfono es ${info.telefono}.`;
    case 'whatsapp':
      return `Puedes contactarnos por WhatsApp al ${info.whatsapp}.`;
    case 'social':
      return formatSocial(info.redes);
    case 'pedidos':
      return info.pedidos || null;
    case 'delivery':
      return info.delivery || null;
    case 'pago':
      return info.metodos_pago || null;
    case 'info':
      return info.info_general || null;
    case 'saturday':
      return info.horarios?.sabado && info.horarios.sabado !== 'Cerrado'
        ? `Sí, atendemos el sábado de ${info.horarios.sabado}.`
        : 'No atendemos los sábados.';
    default:
      return null;
  }
}

function formatHours(horarios) {
  if (!horarios) return 'No tengo información de horarios en este momento.';
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const lines = days.map((d, i) => `${labels[i]}: ${horarios[d] || 'Cerrado'}`);
  return `Nuestro horario de atención es:\n${lines.join('\n')}`;
}

function formatSocial(redes) {
  if (!redes) return 'No tengo información de redes sociales en este momento.';
  const lines = [];
  if (redes.instagram) lines.push(`Instagram: ${redes.instagram}`);
  if (redes.facebook) lines.push(`Facebook: ${redes.facebook}`);
  if (redes.tiktok) lines.push(`TikTok: ${redes.tiktok}`);
  if (redes.whatsapp) lines.push(`WhatsApp: ${redes.whatsapp}`);
  if (lines.length === 0) return 'No tengo información de redes sociales en este momento.';
  return `Puedes seguirnos y contactarnos en nuestras redes sociales:\n${lines.join('\n')}`;
}

function getFallbackResponse(productContext = '') {
  const info = getBusinessInfo();

  // Si hay resultados de productos, mostrarlos formateados
  if (productContext && productContext.startsWith('Productos encontrados:')) {
    // Extraer solo las líneas de productos (antes del contexto del negocio)
    const contextSplit = productContext.split('\n\nContexto del negocio:');
    const productLines = contextSplit[0].replace('Productos encontrados:\n', '').split('\n');
    const formatted = productLines
      .filter(line => line.startsWith('Producto: '))
      .map(line => {
        const nombre = line.match(/Producto: (.+?), Precio:/)?.[1] || line.match(/Producto: (.+)/)?.[1] || '';
        const precioMatch = line.match(/Precio: \$(.+?)(?:,|$)/);
        const precio = precioMatch ? precioMatch[1].trim() : '';
        const stockMatch = line.match(/Stock disponible: (sí|no) \((\d+) unidades\)/);
        const stock = stockMatch ? (stockMatch[1] === 'sí' ? `${stockMatch[2]} unidades` : 'agotado') : '';
        if (!nombre || !precio) return null;
        return stock ? `• ${nombre} — $${precio} (${stock})` : `• ${nombre} — $${precio}`;
      })
      .filter(line => line !== null);
    if (formatted.length > 0) {
      return `Encontré estos productos:\n${formatted.join('\n')}\n\n¿Te ayudo con algo más?`;
    }
  }

  if (!info) {
    return 'En este momento no puedo responder. Por favor, intenta nuevamente en unos minutos.';
  }

  const parts = [];
  parts.push('En este momento tengo problemas para procesar tu consulta, pero puedo ayudarte con lo siguiente:');
  parts.push(`📍 Dirección: ${info.direccion}`);
  parts.push(`🕐 Horario: Lunes a sábado de 10:00 a 20:00, domingo cerrado.`);
  parts.push(`📞 Teléfono: ${info.telefono}`);
  parts.push(`💬 WhatsApp: ${info.whatsapp}`);
  if (info.pedidos) parts.push(`🛒 Pedidos: ${info.pedidos}`);
  parts.push('¿Qué más necesitas saber?');

  return parts.join('\n');
}

function isGenericQuery(message) {
  const normalized = normalizeQuery(message);
  const words = normalized.split(' ').filter(w => w.length > 1);
  return words.length === 1;
}

function getSuggestions(productos) {
  const withStock = productos.filter(p => p.stock > 0);
  const pool = withStock.length >= 5 ? withStock : productos;
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
  const lines = shuffled.map(p => {
    const stock = p.stock > 0 ? ` (${p.stock} unidades)` : ' (agotado)';
    return `• ${p.nombre} — $${p.precio}${stock}`;
  });
  return `¡Claro! Aquí te dejo algunas sugerencias de nuestro catálogo:\n${lines.join('\n')}\n\n¿Te interesa alguno o quieres buscar algo específico?`;
}

function extractVariations(query, results) {
  const normalizedQuery = normalizeQuery(query);
  const variations = new Set();

  for (const p of results) {
    const name = normalizeProductName(p.nombre);
    // Extraer palabras del nombre que no son la query ni stop words
    const words = name.split(' ').filter(w =>
      w.length > 2 &&
      w !== normalizedQuery &&
      !['pack', 'grs', 'gr', 'kg', 'ml', 'cc', 'lt', 'lts', 'x', 'con', 'sin'].includes(w)
    );
    // Tomar las 1-2 palabras más significativas del nombre como variación
    if (words.length > 0) {
      const variation = words.slice(0, 2).join(' ');
      if (variation.length > 3) {
        variations.add(variation);
      }
    }
  }

  return [...variations].slice(0, 5);
}
