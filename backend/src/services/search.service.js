import { fuzzyMatch, normalizeQuery, normalizeProductName, spellMatch, levenshtein } from '../utils/normalize.js';

const INTENT_PATTERNS = {
  business_saturday: [
    /sabado/,
    /sabados/,
  ],
  business_address: [
    /donde\s+(estan|estan\s+ubicados|quedan|esta|estan\s+ellos)/,
    /direccion/,
    /ubicacion/,
    /como\s+(llegar|llego|llegamos)/,
    /llegar\s+al\s+local/,
    /como\s+voy/,
    /ruta/,
    /mapa/,
  ],
  business_hours: [
    /horario/,
    /atienden/,
    /abren/,
    /cierran/,
    /que\s+hora/,
    /a\s+que\s+hora/,
    /cuando\s+(abren|cierran|atienden)/,
  ],
  business_phone: [
    /telefono/,
    /celular/,
    /numero\s+de\s+contacto/,
    /como\s+los\s+contacto/,
    /como\s+los\s+llamo/,
  ],
  business_whatsapp: [
    /whatsapp/,
    /watsap/,
    /wsp/,
  ],
  business_social: [
    /redes\s+sociales/,
    /rrss/,
    /instagram/,
    /facebook/,
    /tiktok/,
    /siguenos/,
    /siguenos\s+en/,
    /perfil\s+de/,
  ],
  business_pedidos: [
    /pedido/,
    /pedir/,
    /comprar/,
    /compra/,
    /encargar/,
    /hacer\s+un\s+pedido/,
    /como\s+compro/,
    /como\s+pido/,
    /puedo\s+pedir/,
    /quiero\s+comprar/,
  ],
  business_delivery: [
    /delivery/,
    /domicilio/,
    /entrega\s+a\s+domicilio/,
    /reparto/,
    /envio/,
    /llevan\s+a\s+casa/,
    /entregan\s+a\s+domicilio/,
  ],
  business_pago: [
    /pago/,
    /pagar/,
    /tarjeta/,
    /efectivo/,
    /transferencia/,
    /metodo\s+de\s+pago/,
    /medios\s+de\s+pago/,
    /aceptan\s+tarjeta/,
  ],
  business_info: [
    /que\s+(son|venden|hacen)/,
    /quienes\s+son/,
    /que\s+es\s+esto/,
    /informacion/,
    /info/,
    /cuentame\s+(de|sobre)/,
    /hablenme\s+(de|sobre)/,
    /que\s+hay\s+en\s+la\s+tienda/,
  ],
  greeting: [
    /^hola/,
    /^buenas/,
    /^buenos\s+dias/,
    /^buenas\s+tardes/,
    /^buenas\s+noches/,
    /^saludos/,
    /^hey/,
  ],
  farewell: [
    /gracias/,
    /muchas\s+gracias/,
    /chao/,
    /adios/,
    /hasta\s+luego/,
    /nos\s+vemos/,
    /perfecto\s+gracias/,
  ],
  product_suggestion: [
    /sugiereme/,
    /sugi[ée]reme/,
    /recomiend[ae]me/,
    /recomiend[ae]/,
    /que\s+me\s+recomiendas/,
    /que\s+me\s+sugieres/,
    /que\s+compro/,
    /que\s+llevo/,
    /dame\s+una\s+idea/,
    /muestrame\s+algo/,
    /muestrame\s+productos/,
    /novedades/,
    /destacados/,
    /lo\s+mas\s+vendido/,
    /mas\s+popular/,
    /top\s+productos/,
    /que\s+hay\s+de\s+bueno/,
    /algun\s+producto/,
    /algunos\s+productos/,
  ],
  product_price: [
    /cuanto\s+(cuesta|vale|sale|es)\s+(el|la|los|las)?\s*/,
    /precio\s+(de|del)\s+/,
    /a\s+cuanto\s+/,
  ],
  product_stock: [
    /tienen\s+/,
    /hay\s+/,
    /disponible\s+/,
    /stock\s+/,
    /quedan\s+/,
  ],
  product_general: [
    /que\s+productos\s+tienen/,
    /catalogo/,
    /lista\s+de\s+productos/,
  ],
};

export function detectIntent(message) {
  const lower = message.toLowerCase().trim();

  // Detectar intención de negocio
  for (const [key, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        if (key.startsWith('business_saturday')) {
          return { type: 'business', key: 'saturday' };
        }
        if (key.startsWith('business_address')) {
          return { type: 'business', key: 'address' };
        }
        if (key.startsWith('business_hours')) {
          return { type: 'business', key: 'hours' };
        }
        if (key.startsWith('business_phone')) {
          return { type: 'business', key: 'phone' };
        }
        if (key.startsWith('business_whatsapp')) {
          return { type: 'business', key: 'whatsapp' };
        }
        if (key.startsWith('business_social')) {
          return { type: 'business', key: 'social' };
        }
        if (key.startsWith('business_pedidos')) {
          return { type: 'business', key: 'pedidos' };
        }
        if (key.startsWith('business_delivery')) {
          return { type: 'business', key: 'delivery' };
        }
        if (key.startsWith('business_pago')) {
          return { type: 'business', key: 'pago' };
        }
        if (key.startsWith('business_info')) {
          return { type: 'business', key: 'info' };
        }
        if (key.startsWith('greeting')) {
          return { type: 'greeting' };
        }
        if (key.startsWith('farewell')) {
          return { type: 'farewell' };
        }
        if (key.startsWith('product_suggestion')) {
          return { type: 'product', subtype: 'suggestion' };
        }
        if (key.startsWith('product_price')) {
          return { type: 'product', subtype: 'price' };
        }
        if (key.startsWith('product_stock')) {
          return { type: 'product', subtype: 'stock' };
        }
        if (key.startsWith('product_general')) {
          return { type: 'product', subtype: 'general' };
        }
      }
    }
  }

  // Si no se detecta patrón específico, asumir pregunta general sobre productos
  return { type: 'general' };
}

export function searchProducts(message, productos) {
  // Extraer términos de búsqueda: quitar palabras comunes
  const stopWords = [
    'cuanto', 'cuesta', 'vale', 'sale', 'precio', 'de', 'del', 'el', 'la', 'los', 'las',
    'tienen', 'hay', 'disponible', 'stock', 'quedan', 'un', 'una', 'por', 'favor',
    'hola', 'buenas', 'tardes', 'dias', 'noches', 'quiero', 'saber', 'necesito',
    'al', 'productos', 'producto', 'que', 'categoria', 'marca', 'alguno', 'alguna',
    'algunos', 'algunas', 'ver', 'lista', 'catalogo',
  ];

  const words = normalizeQuery(message)
    .split(' ')
    .filter((w) => w.length > 1 && !stopWords.includes(w));

  if (words.length === 0) return [];

  const query = words.join(' ');
  const originalQuery = message.trim();
  const originalWords = originalQuery.split(' ').filter((w) => w.length > 1);

  // Buscar coincidencias
  const matches = productos
    .map((p) => {
      const pName = normalizeProductName(p.nombre);
      const pSku = normalizeProductName(p.sku || '');
      const pCat = normalizeProductName(p.categoria || '');
      const pMarca = normalizeProductName(p.marca || '');
      const pOriginalName = p.nombre || '';
      const pOriginalSku = p.sku || '';
      let score = 0;

      // Match exacto por nombre (case-insensitive)
      if (pName === query) {
        score = 100;
        // Bonus si coincide exactamente en mayúsculas/minúsculas
        if (pOriginalName === originalQuery) score += 20;
      }
      // Match por inclusión en nombre (case-insensitive)
      else if (pName.includes(query)) {
        score = 80;
        // Bonus si el query original está contenido con case exacto
        if (pOriginalName.includes(originalQuery)) score += 15;
      }
      // Match por todas las palabras en nombre
      else if (fuzzyMatch(query, p.nombre)) {
        score = 60;
        // Bonus si todas las palabras originales están en el nombre con case
        const caseMatchCount = originalWords.filter((w) =>
          pOriginalName.includes(w)
        ).length;
        if (caseMatchCount === originalWords.length) score += 10;
      }
      // Match por categoría
      else if (pCat && pCat.length > 2 && (pCat === query || pCat.includes(query) || (query.length > 2 && query.includes(pCat)))) {
        score = 50;
      }
      // Match por marca
      else if (pMarca && pMarca.length > 2 && (pMarca === query || pMarca.includes(query) || (query.length > 2 && query.includes(pMarca)))) {
        score = 45;
      }
      // Match parcial: al menos una palabra significativa
      else {
        const matchCount = words.filter((w) =>
          w.length > 2 && (pName.includes(w) || pSku.includes(w) || pCat.includes(w) || pMarca.includes(w))
        ).length;
        if (matchCount > 0) {
          score = 30 + matchCount * 5;
        }
      }

      // Match por similitud ortográfica (tolerancia a errores de tipeo)
      if (score === 0 && words.length > 0) {
        const targetWords = pName.split(' ').filter((w) => w.length > 2);
        let bestSpellScore = 0;
        for (const qw of words) {
          if (qw.length < 3) continue;
          for (const tw of targetWords) {
            // Match directo palabra vs palabra
            if (spellMatch(qw, tw)) {
              const dist = levenshtein(qw, tw);
              const maxLen = Math.max(qw.length, tw.length);
              const similarity = 1 - dist / maxLen;
              const spellScore = Math.round(similarity * 25);
              if (spellScore > bestSpellScore) bestSpellScore = spellScore;
            }
            // Match del query contra substrings del target (ej: 'cafee' vs 'cafe' dentro de 'nescafe')
            if (tw.length > qw.length) {
              const subLen = qw.length;
              for (let i = 0; i <= tw.length - subLen; i++) {
                const sub = tw.substring(i, i + subLen);
                if (spellMatch(qw, sub)) {
                  const dist = levenshtein(qw, sub);
                  const similarity = 1 - dist / qw.length;
                  const spellScore = Math.round(similarity * 20);
                  if (spellScore > bestSpellScore) bestSpellScore = spellScore;
                }
              }
            }
          }
        }
        if (bestSpellScore > 0) score = bestSpellScore;
      }

      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // Retornar top 5
  let topMatches = matches.slice(0, 5).map((r) => r.product);

  // Fallback: si no hay resultados, reintentar sin palabras que parecen tamaños/medidas
  if (topMatches.length === 0 && words.length > 1) {
    const sizePattern = /^(\d+(?:\.\d+)?)(cc|ml|lts?|lt|l|gr|g|kg|kgs?|onz|oz)$/i;
    const significantWords = words.filter((w) => !sizePattern.test(w) && !/^\d+(?:\.\d+)?$/.test(w));
    if (significantWords.length > 0 && significantWords.length < words.length) {
      const relaxedQuery = significantWords.join(' ');
      const relaxedMatches = productos
        .map((p) => {
          const pName = normalizeProductName(p.nombre);
          let score = 0;
          if (pName === relaxedQuery) score = 100;
          else if (pName.includes(relaxedQuery)) score = 80;
          else if (fuzzyMatch(relaxedQuery, p.nombre)) score = 60;
          else {
            const matchCount = significantWords.filter((w) =>
              w.length > 2 && pName.includes(w)
            ).length;
            if (matchCount > 0) score = 30 + matchCount * 5;
          }
          return { product: p, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score);

      topMatches = relaxedMatches.slice(0, 5).map((r) => r.product);
    }
  }

  return topMatches;
}

export function buildContext(results, intent) {
  if (!results || results.length === 0) {
    return 'No se encontró el producto solicitado en el catálogo. No inventes precio ni disponibilidad.';
  }

  const lines = results.map((p) => {
    const parts = [`Producto: ${p.nombre}`, `Precio: $${p.precio}`];

    if (intent.subtype === 'stock' || intent.subtype === 'price') {
      parts.push(`Stock disponible: ${p.stock > 0 ? 'sí' : 'no'} (${p.stock} unidades)`);
    }

    if (p.categoria) parts.push(`Categoría: ${p.categoria}`);
    if (p.marca) parts.push(`Marca: ${p.marca}`);

    return parts.join(', ');
  });

  return `Productos encontrados:\n${lines.join('\n')}`;
}
