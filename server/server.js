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
import multer from 'multer';

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

const REACTIONS_SUPABASE_URL = process.env.REACTIONS_SUPABASE_URL || '';
const REACTIONS_SUPABASE_KEY = process.env.REACTIONS_SUPABASE_SERVICE_ROLE_KEY || '';

const reactionsDb = REACTIONS_SUPABASE_URL && REACTIONS_SUPABASE_KEY
  ? createClient(REACTIONS_SUPABASE_URL, REACTIONS_SUPABASE_KEY)
  : null;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, parts: 20, fields: 10 },
});

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

    const avisos = data || [];

    if (reactionsDb) {
      const [reactionsRes, imagesRes] = await Promise.all([
        reactionsDb.from('aviso_reactions').select('aviso_id, likes, loves'),
        reactionsDb.from('aviso_images').select('aviso_id, storage_path'),
      ]);

      const reactionsMap = {};
      for (const r of (reactionsRes.data || [])) {
        reactionsMap[r.aviso_id] = { likes: r.likes || 0, loves: r.loves || 0 };
      }

      const imagesMap = {};
      for (const img of (imagesRes.data || [])) {
        imagesMap[img.aviso_id] =
          `${REACTIONS_SUPABASE_URL}/storage/v1/object/public/aviso-images/${img.storage_path}`;
      }

      for (const aviso of avisos) {
        const r = reactionsMap[aviso.id] || { likes: 0, loves: 0 };
        aviso.likes = r.likes;
        aviso.loves = r.loves;
        aviso.image_url = imagesMap[aviso.id] || null;
      }
    } else {
      for (const aviso of avisos) {
        aviso.likes = aviso.likes || 0;
        aviso.loves = aviso.loves || 0;
        aviso.image_url = null;
      }
    }

    return res.json(avisos);
  } catch (err) {
    console.error('[avisos] Error inesperado GET:', err);
    return res.json([]);
  }
});

// ─── Texto automático para publicación en Facebook ───
function buildFacebookText({ name, phone, comment }) {
  return [
    '📢 AVISO VECINAL — Comercializadora Los Olivos',
    '',
    String(comment).trim(),
    '',
    `👤 Contacto: ${name}`,
    `📞 Fono: ${phone}`,
    '',
    '📍 Te esperamos en Concordia 408, Local A, Peñaflor',
    '🕐 Lun a Sáb, 10:00–20:00 hrs',
    '👉 Síguenos: instagram.com/comercializadora_los_olivos_',
    '',
    '#Peñaflor #AvisosVecinales #Comunidad #LosOlivos',
  ].join('\n');
}

app.post('/api/aviso', upload.single('image'), async (req, res) => {
  try {
    const { name, phone, email, comment } = req.body;

    if (!name || !phone || !email || !comment) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const image = req.file || null;
    if (image) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.mimetype)) {
        return res.status(400).json({ error: 'Imagen no permitida: usa JPG, PNG, WebP o GIF' });
      }
      if (image.size > MAX_IMAGE_BYTES) {
        return res.status(400).json({ error: 'La imagen supera el máximo de 5MB' });
      }
    }

    if (RESEND_API_KEY) {
      const imageNote = image ? '\n\n[El aviso incluye una imagen adjunta]' : '';
      const { error: emailError } = await resend.emails.send({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: email,
        subject: 'Nuevo aviso - Comercializadora Los Olivos',
        text: `Nombre: ${name}\nTeléfono: ${phone}\nEmail: ${email}\n\nAviso:\n${comment}${imageNote}`,
        html: `
          <h2>Nuevo aviso recibido</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Aviso:</strong></p>
          <p>${comment.replace(/\n/g, '<br>')}</p>
          ${image ? '<p><em>(Incluye imagen adjunta, visible en la página de avisos)</em></p>' : ''}
        `,
      });

      if (emailError) {
        console.error('Error de Resend:', emailError);
      }
    }

    if (!supabase) {
      return res.status(200).json({ ok: true, message: 'Aviso enviado correctamente' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);

    const { data: inserted, error: dbError } = await supabase
      .from('avisos')
      .insert({
        name,
        phone,
        email,
        comment,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[avisos] Error Supabase INSERT:', dbError.message);
      return res.status(500).json({ error: 'No se pudo guardar el aviso' });
    }

    const avisoId = inserted?.id ?? null;

    let imagePath = null;

    if (image && avisoId && reactionsDb) {
      const ext = image.mimetype === 'image/jpeg' ? 'jpg' : image.mimetype.split('/')[1];
      const storagePath = `${avisoId}/${Date.now()}.${ext}`;

      const { error: upError } = await reactionsDb.storage
        .from('aviso-images')
        .upload(storagePath, image.buffer, { contentType: image.mimetype, upsert: true });

      if (upError) {
        console.error('[avisos] Error subida imagen:', upError.message);
      } else {
        imagePath = storagePath;

        const { error: imgError } = await reactionsDb
          .from('aviso_images')
          .insert({ aviso_id: avisoId, storage_path: storagePath, mime_type: image.mimetype });

        if (imgError) {
          console.error('[avisos] Error registro imagen:', imgError.message);
        }
      }
    }

    // ─── Preparación automática para Facebook (queda pendiente de moderación) ───
    if (avisoId && reactionsDb) {
      const textoFacebook = buildFacebookText({ name, phone, comment });

      const { error: fbError } = await reactionsDb
        .from('aviso_facebook')
        .insert({
          aviso_id: avisoId,
          estado: 'pendiente',
          texto_facebook: textoFacebook,
          imagen_path: imagePath,
        });

      if (fbError) {
        console.error('[avisos] Error registro Facebook:', fbError.message);
      }
    }

    return res.status(200).json({ ok: true, id: avisoId, message: 'Aviso enviado correctamente' });
  } catch (error) {
    console.error('Error al procesar aviso:', error);
    return res.status(500).json({ error: 'No se pudo enviar el aviso' });
  }
});

// ─── Reacciones (me gusta / me encanta) por aviso ───
app.post('/api/avisos/:id/react', async (req, res) => {
  try {
    const avisoId = parseInt(req.params.id, 10);
    const { type, action } = req.body;

    if (
      Number.isNaN(avisoId) ||
      !['like', 'love'].includes(type) ||
      !['add', 'remove'].includes(action)
    ) {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    if (!reactionsDb) {
      return res.status(503).json({ error: 'Base de datos de reacciones no configurada' });
    }

    const column = type === 'like' ? 'likes' : 'loves';
    const delta = action === 'add' ? 1 : -1;

    const { data: existing } = await reactionsDb
      .from('aviso_reactions')
      .select('aviso_id, likes, loves')
      .eq('aviso_id', avisoId)
      .maybeSingle();

    if (!existing) {
      const { data: inserted, error: insertError } = await reactionsDb
        .from('aviso_reactions')
        .insert({
          aviso_id: avisoId,
          likes: type === 'like' ? 1 : 0,
          loves: type === 'love' ? 1 : 0,
        })
        .select()
        .single();

      if (insertError) {
        const newValue = Math.max(delta, 0);
        const { data: updated, error: updateError } = await reactionsDb
          .from('aviso_reactions')
          .update({
            likes: type === 'like' ? newValue : 0,
            loves: type === 'love' ? newValue : 0,
          })
          .eq('aviso_id', avisoId)
          .select()
          .single();

        if (updateError) {
          console.error('[avisos] Error update reacción:', updateError.message);
          return res.status(500).json({ error: updateError.message });
        }

        return res.json({ id: avisoId, likes: updated.likes || 0, loves: updated.loves || 0 });
      }

      return res.json({ id: avisoId, likes: inserted.likes || 0, loves: inserted.loves || 0 });
    }

    const currentValue = existing[column] || 0;
    const newValue = Math.max(currentValue + delta, 0);

    const { data: updated, error: updateError } = await reactionsDb
      .from('aviso_reactions')
      .update({ [column]: newValue })
      .eq('aviso_id', avisoId)
      .select()
      .single();

    if (updateError) {
      console.error('[avisos] Error update reacción:', updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({ id: avisoId, likes: updated.likes || 0, loves: updated.loves || 0 });
  } catch (err) {
    console.error('[avisos] Error inesperado en react:', err);
    return res.status(500).json({ error: 'No se pudo actualizar la reacción' });
  }
});

// ─── Manejo de errores de subida y parsing (multer / body-parser) ───
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'La imagen supera el máximo de 5MB'
      : 'Error al procesar el formulario';
    return res.status(400).json({ error: message });
  }
  if (err) {
    console.error('[server] Error en petición:', err.message);
    return res.status(400).json({ error: err.message || 'Petición inválida' });
  }
  return res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Keep-alive: ping mutuo cada 5 minutos para evitar sleep en Render ───
const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL || 'https://los-olivos-chatbot.onrender.com/api/health';
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

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
  console.log(`Supabase (avisos): ${supabase ? 'conectado' : 'no configurado'}`);
  console.log(`Supabase (reacciones): ${reactionsDb ? 'conectado' : 'no configurado'}`);
  startKeepAlive();
});
