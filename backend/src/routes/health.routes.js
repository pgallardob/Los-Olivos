import { Router } from 'express';
import { getSyncStatus } from '../services/sync.service.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

healthRouter.get('/sync/status', (_req, res) => {
  res.json(getSyncStatus());
});
