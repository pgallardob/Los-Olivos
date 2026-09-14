import { Router } from 'express';
import { getSyncStatus } from '../services/sync.service.js';
import { getClient } from '../repositories/product.repository.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const results = {};
  const client = getClient();
  if (client) {
    try {
      const { error } = await client.from('productos').select('id').limit(1);
      results.productos = error ? 'ERROR' : 'OK';
    } catch { results.productos = 'ERROR'; }
  }
  console.log(`[health] Supabase keepalive: ${JSON.stringify(results)}`);
  res.json({ status: 'ok', timestamp: new Date().toISOString(), supabase: results });
});

healthRouter.get('/sync/status', (_req, res) => {
  res.json(getSyncStatus());
});
