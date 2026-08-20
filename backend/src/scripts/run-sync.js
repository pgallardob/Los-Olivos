import { syncProducts } from '../services/sync.service.js';

async function run() {
  console.log('[sync] Iniciando sincronización manual...');
  const result = await syncProducts();

  if (result.success) {
    console.log(`[sync] Sincronización exitosa. ${result.count} productos.`);
    process.exit(0);
  } else {
    console.error(`[sync] Sincronización fallida: ${result.error}`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('[sync] Error fatal:', err);
  process.exit(1);
});
