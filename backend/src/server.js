import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/config.js';
import { chatRouter } from './routes/chat.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { initScheduler } from './services/sync.service.js';
import { loadCatalog } from './services/product.service.js';

const app = express();

// ─── Middleware global ───
app.use(express.json({ limit: '32kb' }));

// ─── CORS ───
app.use(cors({
  origin(origin, cb) {
    if (!origin || config.cors.origins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('No permitido por CORS'));
    }
  },
}));

// ─── Rate limiting global ───
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.' },
});
app.use('/api/', limiter);

// ─── Rutas ───
app.use('/api', healthRouter);
app.use('/api', chatRouter);

// ─── Manejo de errores ───
app.use((err, _req, res, _next) => {
  console.error('[server]', err.message);
  res.status(err.status || 500).json({
    error: err.status === 429
      ? err.message
      : 'Error interno del servidor.',
  });
});

// ─── Keep-alive: ping mutuo cada 5 minutos para evitar sleep en Render ───
const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL || 'https://los-olivos-avisos.onrender.com/health';
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutos

function startKeepAlive() {
  setInterval(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(KEEP_ALIVE_URL, { signal: controller.signal });
      clearTimeout(timeout);
      console.log(`[keep-alive] Ping a ${KEEP_ALIVE_URL}: ${res.status}`);
    } catch (err) {
      console.warn(`[keep-alive] Ping falló: ${err.message}`);
    }
  }, KEEP_ALIVE_INTERVAL);
  console.log(`[keep-alive] Activo: ping cada 5 min a ${KEEP_ALIVE_URL}`);
}

// ─── Inicio ───
async function start() {
  // Cargar catálogo en memoria si existe (no fallar si no hay archivo)
  try {
    await loadCatalog();
  } catch (err) {
    console.warn('[server] loadCatalog falló (no crítico):', err.message);
  }

  // Iniciar scheduler de sincronización (no fallar si no puede escribir logs)
  try {
    initScheduler();
  } catch (err) {
    console.warn('[server] initScheduler falló (no crítico):', err.message);
  }

  app.listen(config.port, () => {
    console.log(`[server] Chatbot backend en http://localhost:${config.port}`);
    console.log(`[server] TZ=${config.timezone} | provider=${config.ai.provider}`);
    startKeepAlive();
  });
}

start().catch((err) => {
  console.error('[server] Error al iniciar:', err);
  process.exit(1);
});
