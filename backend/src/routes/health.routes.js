import { Router } from 'express';
import { getSyncStatus } from '../services/sync.service.js';
import { getClient } from '../repositories/product.repository.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const results = {};
  // Timeout: si Supabase tarda (ej: arranque del deploy), responder rapido igual
  // (evita que el health check de Render marque el deploy como fallido)
  const withTimeout = (query) =>
    Promise.race([query, new Promise((resolve) => setTimeout(() => resolve({ error: 'timeout' }), 2000))]);
  const client = getClient();
  if (client) {
    try {
      const { error } = await withTimeout(client.from('productos').select('id').limit(1));
      results.productos = error ? 'ERROR' : 'OK';
    } catch { results.productos = 'ERROR'; }
  }
  console.log(`[health] Supabase keepalive: ${JSON.stringify(results)}`);
  res.json({ status: 'ok', timestamp: new Date().toISOString(), supabase: results });
});

healthRouter.get('/sync/status', (_req, res) => {
  res.json(getSyncStatus());
});
