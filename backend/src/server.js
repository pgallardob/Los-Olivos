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

// ─── Inicio ───
async function start() {
  // Cargar catálogo en memoria si existe
  await loadCatalog();

  // Iniciar scheduler de sincronización
  initScheduler();

  app.listen(config.port, () => {
    console.log(`[server] Chatbot backend en http://localhost:${config.port}`);
    console.log(`[server] TZ=${config.timezone} | provider=${config.ai.provider}`);
  });
}

start().catch((err) => {
  console.error('[server] Error al iniciar:', err);
  process.exit(1);
});
