/**
 * ============================================================
 * Auto-Images — Automatización de imágenes de productos
 * ============================================================
 *
 * Busca productos en Supabase sin imagen (imagen_url IS NULL),
 * busca una imagen real en Google Custom Search API,
 * la optimiza a WebP 500×500 con sharp,
 * la sube a Supabase Storage (bucket "productos"),
 * y actualiza imagen_url en la tabla.
 *
 * REQUISITOS:
 *   - Google Custom Search API key (GOOGLE_API_KEY)
 *   - Custom Search Engine ID (GOOGLE_CX)
 *   - Supabase service role key (en backend/.env)
 *
 * Obtener API key:
 *   1. https://console.cloud.google.com → crear proyecto → habilitar Custom Search API
 *   2. Crear API key en "APIs & Services > Credentials"
 *   3. https://cse.google.com → crear Custom Search Engine → habilitar "Search entire web"
 *   4. Copiar el "Search engine ID" (CX)
 *
 * USO:
 *   node scripts/auto-images.mjs --dry-run          # solo listar productos sin imagen
 *   node scripts/auto-images.mjs --limit 3          # procesar solo 3 productos
 *   node scripts/auto-images.mjs                    # procesar todos
 *   node scripts/auto-images.mjs --product "Coca"   # procesar productos que contengan "Coca"
 *   node scripts/auto-images.mjs --fix --product "malla mini frac"  # re-procesar producto con imagen incorrecta
 *
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import https from 'node:https';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Cargar variables de entorno desde backend/.env manualmente
function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      let value = trimmed.substring(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {}
}

loadEnv(join(projectRoot, 'backend', '.env'));
loadEnv(join(projectRoot, '.env'));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const GOOGLE_CX = process.env.GOOGLE_CX || '';

const BUCKET = 'productos';
const IMAGE_SIZE = 500;
const IMAGE_QUALITY = 80;
const DELAY_MS = 2000;
const MAX_RESULTS = 3;
const MIN_IMAGE_BYTES = 5000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// Parsear argumentos
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fixMode = args.includes('--fix');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 0;
const productIdx = args.indexOf('--product');
const productFilter = productIdx >= 0 ? args[productIdx + 1] : '';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Descarga una imagen desde una URL y retorna el Buffer.
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Seguir redirect
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < MIN_IMAGE_BYTES) {
          reject(new Error(`Imagen muy pequeña: ${buf.length} bytes`));
          return;
        }
        if (buf.length > MAX_IMAGE_BYTES) {
          reject(new Error(`Imagen muy grande: ${buf.length} bytes`));
          return;
        }
        resolve(buf);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

/**
 * Busca imágenes en Google Custom Search API.
 * Retorna array de URLs de imágenes candidatas.
 */
async function searchImages(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    throw new Error('GOOGLE_API_KEY y GOOGLE_CX no configurados. Ver scripts/auto-images.mjs header.');
  }

  const params = new URLSearchParams({
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CX,
    q: query,
    searchType: 'image',
    num: String(MAX_RESULTS),
    imgSize: 'medium',
    safe: 'active',
  });

  const url = `https://www.googleapis.com/customsearch/v1?${params}`;

  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Google API HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
          return;
        }
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(`Google API error: ${json.error.message}`));
            return;
          }
          const items = (json.items || [])
            .filter(item => item.link)
            .map(item => ({
              url: item.link,
              mime: item.mime || '',
              width: item.image?.width || 0,
              height: item.image?.height || 0,
            }));
          resolve(items);
        } catch (e) {
          reject(new Error(`Error parseando respuesta: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Optimiza una imagen con sharp: resize 500×500, convertir a WebP.
 */
async function optimizeImage(buffer) {
  return sharp(buffer)
    .resize(IMAGE_SIZE, IMAGE_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: IMAGE_QUALITY })
    .toBuffer();
}

/**
 * Genera un nombre de archivo seguro desde el nombre del producto.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

/**
 * Sube una imagen a Supabase Storage.
 */
async function uploadToStorage(supabase, path, buffer) {
  const { error } = await supabase
    .storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) throw new Error(`Error subiendo a Storage: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Actualiza imagen_url en la tabla productos.
 */
async function updateImageUrl(supabase, productId, imageUrl) {
  const { error } = await supabase
    .from('productos')
    .update({ imagen_url: imageUrl })
    .eq('id', productId);

  if (error) throw new Error(`Error actualizando BD: ${error.message}`);
}

async function main() {
  console.log('=== Auto-Images — Automatización de imágenes de productos ===\n');

  // Validar credenciales
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERROR: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no configurados.');
    console.error('Verificar backend/.env');
    process.exit(1);
  }

  if (dryRun) {
    console.log('MODO: DRY-RUN (no se modificará nada)\n');
  } else {
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      console.error('ERROR: GOOGLE_API_KEY y GOOGLE_CX no configurados.');
      console.error('');
      console.error('Para obtenerlos:');
      console.error('  1. https://console.cloud.google.com → habilitar Custom Search API → crear API key');
      console.error('  2. https://cse.google.com → crear Custom Search Engine → copiar CX');
      console.error('  3. Agregar a backend/.env:');
      console.error('     GOOGLE_API_KEY=tu-key');
      console.error('     GOOGLE_CX=tu-cx');
      process.exit(1);
    }
    console.log('MODO: PRODUCCIÓN (se modificarán imágenes y BD)\n');
  }

  // Conectar a Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  // Verificar bucket
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error(`ERROR: No se pudo listar buckets de Storage: ${bucketError.message}`);
    process.exit(1);
  }
  const bucketExists = buckets.some(b => b.name === BUCKET);
  if (!bucketExists) {
    console.error(`ERROR: Bucket "${BUCKET}" no existe en Supabase Storage.`);
    console.error('Crear el bucket en el panel de Supabase antes de continuar.');
    process.exit(1);
  }
  console.log(`Bucket "${BUCKET}" OK`);

  // Consultar productos (sin imagen, o todos si --fix)
  let query = supabase
    .from('productos')
    .select('id, nombre, marca_id, imagen_url, categorias!categoria_id ( nombre ), marcas!marca_id ( nombre )')
    .eq('estado', true)
    .is('deleted_at', null)
    .order('nombre');

  if (!fixMode) {
    // Modo normal: solo productos sin imagen
    query = query.is('imagen_url', null);
  }

  if (productFilter) {
    query = query.ilike('nombre', `%${productFilter}%`);
  }

  if (limit > 0) {
    query = query.limit(limit);
  }

  const { data: products, error: queryError } = await query;

  if (queryError) {
    console.error(`ERROR consultando productos: ${queryError.message}`);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log(fixMode
      ? '\nNo se encontraron productos con ese filtro.'
      : '\nNo hay productos sin imagen. Todo al día.');
    process.exit(0);
  }

  console.log(`\n${fixMode ? 'Productos a re-procesar' : 'Productos sin imagen'}: ${products.length}\n`);
  console.log('---'.repeat(20));

  for (const p of products) {
    const marca = p.marcas?.nombre || '';
    const categoria = p.categorias?.nombre || '';
    console.log(`  [${p.id}] ${p.nombre} — Marca: ${marca} — Categoría: ${categoria}`);
  }

  if (dryRun) {
    console.log('\n---'.repeat(20));
    console.log(`DRY-RUN: ${products.length} productos sin imagen. No se modificó nada.`);
    process.exit(0);
  }

  console.log('\n---'.repeat(20));
  console.log(`\nProcesando ${products.length} productos...\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const marca = p.marcas?.nombre || '';
    const searchQuery = `${p.nombre} ${marca} producto`.trim();

    console.log(`\n[${i + 1}/${products.length}] Procesando: ${p.nombre}`);
    console.log(`  Buscando: "${searchQuery}"`);

    try {
      // 1. Buscar imágenes
      const results = await searchImages(searchQuery);

      if (results.length === 0) {
        console.log('  ⚠ No se encontraron imágenes. Saltando.');
        skipped++;
        continue;
      }

      console.log(`  ${results.length} candidatas encontradas`);

      // 2. Probar descargar cada candidata hasta que una funcione
      let imageBuffer = null;
      let usedUrl = '';

      for (const result of results) {
        try {
          console.log(`  Descargando: ${result.url.substring(0, 80)}...`);
          imageBuffer = await downloadImage(result.url);
          usedUrl = result.url;
          break;
        } catch (e) {
          console.log(`  ✗ Falló: ${e.message}`);
        }
      }

      if (!imageBuffer) {
        console.log('  ⚠ No se pudo descargar ninguna imagen. Saltando.');
        skipped++;
        continue;
      }

      console.log(`  ✓ Imagen descargada: ${imageBuffer.length} bytes`);

      // 3. Optimizar con sharp
      const optimized = await optimizeImage(imageBuffer);
      console.log(`  ✓ Optimizada: ${optimized.length} bytes (WebP ${IMAGE_SIZE}×${IMAGE_SIZE})`);

      // 4. Subir a Storage
      const filename = `${slugify(p.nombre)}.webp`;
      const storagePath = filename;
      const publicUrl = await uploadToStorage(supabase, storagePath, optimized);
      console.log(`  ✓ Subida a Storage: ${storagePath}`);
      console.log(`  URL pública: ${publicUrl}`);

      // 5. Actualizar BD
      await updateImageUrl(supabase, p.id, publicUrl);
      console.log(`  ✓ imagen_url actualizada en BD`);

      success++;

      // Rate limiting entre productos
      if (i < products.length - 1) {
        console.log(`  Esperando ${DELAY_MS}ms...`);
        await sleep(DELAY_MS);
      }

    } catch (error) {
      console.error(`  ✗ ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '==='.repeat(30));
  console.log(`RESUMEN:`);
  console.log(`  Procesados: ${products.length}`);
  console.log(`  Exitosos:   ${success}`);
  console.log(`  Fallidos:   ${failed}`);
  console.log(`  Saltados:   ${skipped}`);
  console.log('==='.repeat(30));

  process.exit(0);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
