# Backend — Comercializadora Los Olivos

Servidor Express que recibe los avisos del formulario y los envía por email usando **Resend API**.

## Requisitos

- Node.js 18+
- Una cuenta en [Resend](https://resend.com) (gratis, 3000 emails/mes)

## Instalación

```bash
cd server
pnpm install
```

## Configuración

1. Crear cuenta en [resend.com](https://resend.com)
2. Ir a **API Keys** y crear una nueva API key
3. Copiar `.env.example` a `.env` (ya creado)
4. Reemplazar `RESEND_API_KEY` con tu API key (empieza con `re_`)
5. `MAIL_TO` — email donde llegan los avisos (puedes cambiarlo cuando quieras)
6. `MAIL_FROM` — mientras no verifiques tu propio dominio en Resend, usa `onboarding@resend.dev` que es el remitente de prueba

## Uso

```bash
# Modo desarrollo (auto-reload)
pnpm dev

# Producción
pnpm start
```

El servidor corre en `http://localhost:3001`.

## Endpoint

### POST `/api/aviso`

Recibe JSON (o multipart con `image`) con:

```json
{
  "name": "Juan Pérez",
  "phone": "+569 1234 5678",
  "email": "juan@example.com",
  "comment": "Texto del aviso a publicar"
}
```

Responde:

- `200` — `{ ok: true, message: "Aviso enviado correctamente" }`
- `400` — `{ error: "Faltan campos obligatorios" }`
- `500` — `{ error: "No se pudo enviar el aviso" }`

Acción: guarda el aviso en Supabase (vigencia 30 días), envía email de notificación a `MAIL_TO` y prepara la tarjeta de Facebook (pendiente de moderación).

### GET `/api/avisos`

Lista pública: avisos vigentes (no expirados) **excluyendo los rechazados en moderación** (los que tienen `aviso_facebook.estado = 'rechazado'`).

### POST `/api/avisos/:id/react`

Reacciones públicas (like / love): suma o resta 1 del contador e inserta/elimina el registro en `aviso_reactions`.

### POST `/api/admin/login`

Valida la contraseña del panel (header `x-admin-password` o body `{ "password": "..." }`). Responde `200` o `401`.

### GET `/api/admin/avisos` (requiere `x-admin-password`)

Lista todos los avisos con su estado de moderación (`pendiente` / `publicado` / `rechazado`), observaciones y datos del anunciante.

### GET `/api/admin/avisos/:id/image` (requiere `x-admin-password`)

Descarga la imagen del aviso desde Supabase Storage. La usa el panel admin para dibujar la tarjeta de Facebook sobre el canvas.

### PATCH `/api/admin/avisos/:id/facebook` (requiere `x-admin-password`)

Actualiza el estado de moderación (`pendiente` / `publicado` / `rechazado`).

Al rechazar, además:

- Se envía **automáticamente un email al anunciante** con el motivo (`observaciones`)
- El aviso **desaparece de la página pública** (ver GET arriba)
- La respuesta incluye `email_sent` y `email_fail_reason` para el panel admin

## Panel admin (`/admin`)

- Moderación de avisos con estados pendiente / publicado / rechazado
- El motivo del rechazo es **obligatorio** y se envía por email al anunciante
- Generación de tarjeta y texto para publicar en el grupo de Facebook
- La imagen del aviso se dibuja **completa y centrada (contain, sin recortes)** sobre el fondo de marca del canvas 1200×630

## Moderación y visibilidad

- La tabla `avisos` guarda el contenido público; `aviso_facebook` (proyecto Supabase de reacciones) guarda el estado de moderación
- `rechazado` oculta el aviso de la web; `volver a pendiente` lo restaura

## CORS

- Producción: solo los orígenes de `CLIENT_ORIGIN` (con y sin `www`)
- Desarrollo: se acepta **cualquier** origen `localhost` / `127.0.0.1` en cualquier puerto (vite 5173, preview del IDE con proxy, etc.)

## Imágenes en la web

- La imagen del aviso se muestra en la card pública con **alto fijo (170px) y `object-fit: contain`**: completa, centrada y sin recortes, sobre un fondo oscuro que disimula los espacios
- La vista previa del formulario replica exactamente la card publicada (máx. 220px)

## Pruebas locales

```bash
# Diagnostico de Resend con la config de .env (envia un email de prueba)
node probe-resend.local.mjs

# Diagnostico apuntando a otro destinatario
node probe-resend.local.mjs destino@ejemplo.cl
```

> **CUIDADO:** el servidor local usa la MISMA base de datos de producción (Supabase)
> salvo que cambies `SUPABASE_URL` y las keys en `.env`. Cada aviso creado en pruebas
> locales aparece en la web real y genera emails. Borra los avisos de prueba
> (tabla `avisos` + `aviso_images` / `aviso_facebook` / `aviso_reactions` en el
> proyecto de reacciones) cuando termines.

## Notas

- **No necesitas tu contraseña de Hotmail.** Resend usa su propia API key.
- **`onboarding@resend.dev` solo entrega al email dueño de la cuenta Resend.** Para que lleguen los emails a otros destinatarios (incluido el email de rechazo a los anunciantes) debes **verificar tu dominio en Resend** y usarlo en `MAIL_FROM` (ej. `avisos@comercializadoralosolivos.cl`).
- `MAIL_TO` se puede cambiar en cualquier momento en `.env` sin tocar el código.
- Si despliegas el backend en un hosting (Render, Railway, etc.), actualiza `VITE_FORM_ENDPOINT` en el `.env` del frontend.
- El formulario del frontend muestra una **vista previa** del aviso antes de enviarlo (`src/components/navbar.ts`): réplica exacta de la card publicada, con botones "← Seguir editando" (conserva los datos y la imagen) y "Enviar ahora". Cerrar con Esc o ✗ también vuelve al formulario sin perder nada.
