/**
 * Backend — Comercializadora Los Olivos
 * Recibe los avisos del formulario y los envía por email usando Resend API.
 * Almacena los avisos en Supabase (filesystem efímero en Render).
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
const MAIL_TO = process.env.MAIL_TO || 'pgallardob@hotmail.com';
const MAIL_FROM = process.env.MAIL_FROM || 'Los Olivos <onboarding@resend.dev>';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const resend = new Resend(RESEND_API_KEY);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/avisos', async (_req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[avisos] Error Supabase GET:', error.message);
      return res.json([]);
    }

    return res.json(data || []);
  } catch (err) {
    console.error('[avisos] Error inesperado GET:', err);
    return res.json([]);
  }
});

app.post('/api/aviso', async (req, res) => {
  try {
    const { name, phone, email, comment } = req.body;

    if (!name || !phone || !email || !comment) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (RESEND_API_KEY) {
      const { error: emailError } = await resend.emails.send({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: email,
        subject: 'Nuevo aviso - Comercializadora Los Olivos',
        text: `Nombre: ${name}\nTeléfono: ${phone}\nEmail: ${email}\n\nAviso:\n${comment}`,
        html: `
          <h2>Nuevo aviso recibido</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Aviso:</strong></p>
          <p>${comment.replace(/\n/g, '<br>')}</p>
        `,
      });

      if (emailError) {
        console.error('Error de Resend:', emailError);
      }
    }

    if (supabase) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);

      const { error: dbError } = await supabase
        .from('avisos')
        .insert({
          name,
          phone,
          email,
          comment,
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        });

      if (dbError) {
        console.error('[avisos] Error Supabase INSERT:', dbError.message);
      }
    }

    return res.status(200).json({ ok: true, message: 'Aviso enviado correctamente' });
  } catch (error) {
    console.error('Error al procesar aviso:', error);
    return res.status(500).json({ error: 'No se pudo enviar el aviso' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
  console.log(`Supabase: ${supabase ? 'conectado' : 'no configurado'}`);
});
