import { config } from '../config/config.js';
import { readJsonFile, writeJsonFileSafe, ensureDir } from '../utils/json-storage.js';
import { fetchProductsFromSupabase } from '../repositories/product.repository.js';
import { reloadCatalog } from './product.service.js';
import { join } from 'path';
import { writeFileSync, appendFileSync } from 'fs';
import cron from 'node-cron';

const DATA_DIR = config.paths.data;
const LOGS_DIR = config.paths.logs;
const PRODUCTOS_PATH = join(DATA_DIR, 'productos.json');
const PREVIOUS_PATH = join(DATA_DIR, 'productos.previous.json');
const SYNC_LOG_PATH = join(LOGS_DIR, 'sync.log');

let syncState = {
  lastAttempt: null,
  lastSuccessful: null,
  lastError: null,
  productCount: 0,
  status: 'idle',
};

export function getSyncStatus() {
  return { ...syncState };
}

function logSync(message) {
  const line = `${new Date().toISOString()} - ${message}\n`;
  try {
    ensureDir(LOGS_DIR);
    appendFileSync(SYNC_LOG_PATH, line, 'utf-8');
  } catch {
    // Si no se puede escribir log (filesystem efímero), continuar
  }
  console.log(`[sync] ${message}`);
}

export async function syncProducts() {
  syncState.status = 'running';
  syncState.lastAttempt = new Date().toISOString();

  try {
    // 1. Consultar Supabase
    const products = await fetchProductsFromSupabase();

    if (!products || products.length === 0) {
      throw new Error('Supabase devolvió 0 productos. Sincronización abortada para preservar catálogo existente.');
    }

    // 2. Construir estructura del JSON
    const catalog = {
      metadata: {
        ultima_actualizacion: new Date().toISOString(),
        ultima_sincronizacion_exitosa: new Date().toISOString(),
        cantidad_productos: products.length,
        fuente: 'ERP_SUPABASE',
        estado: 'ok',
      },
      productos: products,
    };

    // 3. Backup del archivo anterior si existe
    const existing = readJsonFile(PRODUCTOS_PATH);
    if (existing) {
      ensureDir(DATA_DIR);
      writeFileSync(PREVIOUS_PATH, JSON.stringify(existing, null, 2), 'utf-8');
    }

    // 4. Escritura segura (tmp → rename)
    const success = writeJsonFileSafe(PRODUCTOS_PATH, catalog);
    if (!success) {
      throw new Error('Falló la escritura segura del JSON.');
    }

    // 5. Recargar catálogo en memoria
    reloadCatalog();

    // 6. Actualizar estado
    syncState.lastSuccessful = new Date().toISOString();
    syncState.lastError = null;
    syncState.productCount = products.length;
    syncState.status = 'ok';

    logSync(`OK - ${products.length} productos sincronizados`);
    return { success: true, count: products.length };

  } catch (error) {
    syncState.lastError = error.message;
    syncState.status = 'error';
    logSync(`ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

export function initScheduler() {
  // Lunes a viernes a las 18:00 (zona horaria del servidor configurada con TZ=America/Santiago)
  const cronExpr = '0 18 * * 1-5';

  if (!cron.validate(cronExpr)) {
    console.error('[sync] Expresión cron inválida:', cronExpr);
    return;
  }

  cron.schedule(cronExpr, async () => {
    console.log('[sync] Ejecución programada iniciada...');
    await syncProducts();
  }, {
    timezone: config.timezone,
  });

  console.log(`[sync] Scheduler activo: L-V 18:00 ${config.timezone}`);
}
