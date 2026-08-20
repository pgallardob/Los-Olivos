import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = join(__dirname, '..', '..');

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY'];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[config] Variable ${key} no definida. El backend funcionará con funcionalidad limitada.`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  timezone: process.env.TZ || 'America/Santiago',

  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    model: process.env.AI_MODEL || 'gemini-2.0-flash',
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  cors: {
    origins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '15', 10),
  },

  chat: {
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || '500', 10),
  },

  paths: {
    data: join(backendRoot, 'data'),
    backups: join(backendRoot, 'backups'),
    logs: join(backendRoot, 'logs'),
  },
};
