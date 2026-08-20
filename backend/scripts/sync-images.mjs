/**
 * sync-images.mjs
 *
 * Proceso idempotente de sincronización de imágenes de productos.
 * Busca productos sin imagen_url en Supabase, descarga una imagen real,
 * la optimiza a WebP 500x500, la sube a Supabase Storage y actualiza la BD.
 *
 * Uso:
 *   node backend/scripts/sync-images.mjs              # Procesa todos los pendientes
 *   node backend/scripts/sync-images.mjs --limit 10   # Procesa máximo 10
 *   node backend/scripts/sync-images.mjs --dry-run    # Solo muestra qué procesaría
 *
 * Seguro de re-ejecutar: no reprocesa productos que ya tienen imagen_url.
 */

import sharp from 'sharp';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = join(__dirname, '..');

dotenv.config({ path: join(backendRoot, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_KEY; // Usar service key para todo

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const LOG_DIR = join(backendRoot, 'logs');

// Parse args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0; // 0 = sin límite

const serviceHeaders = {
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey': SERVICE_KEY,
};

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function logToFile(message) {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  const logFile = join(LOG_DIR, `sync-images-${timestamp().split('T')[0]}.log`);
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
}

async function getProductsWithoutImage() {
  let url = `${SUPABASE_URL}/rest/v1/productos?select=id,nombre,precio&imagen_url=is.null&order=nombre`;
  if (LIMIT > 0) url += `&limit=${LIMIT}`;

  const res = await fetch(url, { headers: serviceHeaders });
  if (!res.ok) throw new Error(`Error obteniendo productos: ${res.status}`);
  return await res.json();
}

async function searchImageUrls(productName, maxResults = 8) {
  const query = encodeURIComponent(`${productName} producto`);
  const url = `https://www.bing.com/images/search?q=${query}&qft=+filterui:photo-photo`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'es-CL,es;q=0.9' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const mediaUrlRegex = /mediaurl=(https?[^&"]+)/gi;
    const matches = [...html.matchAll(mediaUrlRegex)];
    return matches
      .map(m => decodeURIComponent(m[1]))
      .filter(u => u.startsWith('http'))
      .filter(u => !u.includes('bing.com') && !u.includes('bing.net'))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, maxResults);
  } catch { return []; }
}

async function downloadImage(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept': 'image/*,*/*' },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) continue;
      try {
        const meta = await sharp(buf).metadata();
        if (meta.width < 50 || meta.height < 50) continue;
        return { buf, format: meta.format, width: meta.width, height: meta.height };
      } catch { continue; }
    } catch { continue; }
  }
  return null;
}

async function optimizeImage(buffer) {
  return await sharp(buffer)
    .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 80 })
    .toBuffer();
}

async function uploadToStorage(fileName, buffer) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/productos/${fileName}`, {
    method: 'PUT',
    headers: { ...serviceHeaders, 'Content-Type': 'image/webp' },
    body: buffer,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Upload FAIL: ${res.status} ${t}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/productos/${fileName}`;
}

async function updateImageUrl(productId, imageUrl) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${productId}`, {
    method: 'PATCH',
    headers: { ...serviceHeaders, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify({ imagen_url: imageUrl }),
  });
  return res.ok;
}

async function run() {
  console.log('=== Sincronización de imágenes de productos ===');
  console.log(`Modo: ${dryRun ? 'DRY-RUN (no modifica nada)' : 'PRODUCCIÓN'}`);
  console.log(`Límite: ${LIMIT > 0 ? LIMIT : 'sin límite'}`);
  console.log('');

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env');
    process.exit(1);
  }

  // 1. Obtener productos sin imagen
  const products = await getProductsWithoutImage();
  console.log(`Productos sin imagen: ${products.length}\n`);

  if (products.length === 0) {
    console.log('No hay productos pendientes. Todo al día.');
    return;
  }

  if (dryRun) {
    for (const p of products) {
      console.log(`  [DRY-RUN] ${p.nombre} ($${p.precio})`);
    }
    return;
  }

  let success = 0, failed = 0, pending = 0;
  const pendingList = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const msg = `[${i + 1}/${products.length}] ${product.nombre}`;
    console.log(msg);
    logToFile(msg);

    const urls = await searchImageUrls(product.nombre);
    if (urls.length === 0) {
      console.log('  pendiente_revision (sin resultados)');
      logToFile('  pendiente_revision (sin resultados)');
      pending++; pendingList.push(product.nombre); continue;
    }

    const downloaded = await downloadImage(urls);
    if (!downloaded) {
      console.log('  pendiente_revision (descarga fallida)');
      logToFile('  pendiente_revision (descarga fallida)');
      pending++; pendingList.push(product.nombre); continue;
    }

    const optimized = await optimizeImage(downloaded.buf);
    const fileName = `${slugify(product.nombre)}.webp`;
    try {
      const publicUrl = await uploadToStorage(fileName, optimized);
      const ok = await updateImageUrl(product.id, publicUrl);
      if (ok) {
        const okMsg = `  OK (${optimized.length} bytes) → ${fileName}`;
        console.log(okMsg); logToFile(okMsg);
        success++;
      } else {
        const errMsg = '  error (DB update fallido)';
        console.log(errMsg); logToFile(errMsg);
        failed++;
      }
    } catch (e) {
      const errMsg = `  error (${e.message})`;
      console.log(errMsg); logToFile(errMsg);
      failed++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  const summary = `\n=== RESUMEN ===\nProcesados: ${products.length} | OK: ${success} | Pendientes: ${pending} | Errores: ${failed}`;
  console.log(summary); logToFile(summary);

  if (pendingList.length > 0) {
    console.log('\nProductos pendientes de revisión manual:');
    pendingList.forEach(p => { console.log(`  - ${p}`); logToFile(`  - ${p}`); });
  }
}

run().catch(e => {
  console.error('Error fatal:', e.message);
  logToFile(`Error fatal: ${e.message}`);
  process.exit(1);
});
