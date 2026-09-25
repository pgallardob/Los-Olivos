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

## Moderación y visibilidad

- La tabla `avisos` guarda el contenido público; `aviso_facebook` (proyecto Supabase de reacciones) guarda el estado de moderación
- `rechazado` oculta el aviso de la web; `volver a pendiente` lo restaura

## Pruebas locales

```bash
# Diagnostico de Resend con la config de .env (envia un email de prueba)
node probe-resend.local.mjs

# Diagnostico apuntando a otro destinatario
node probe-resend.local.mjs destino@ejemplo.cl
```

## Notas

- **No necesitas tu contraseña de Hotmail.** Resend usa su propia API key.
- **`onboarding@resend.dev` solo entrega al email dueño de la cuenta Resend.** Para que lleguen los emails a otros destinatarios (incluido el email de rechazo a los anunciantes) debes **verificar tu dominio en Resend** y usarlo en `MAIL_FROM` (ej. `avisos@comercializadoralosolivos.cl`).
- `MAIL_TO` se puede cambiar en cualquier momento en `.env` sin tocar el código.
- Si despliegas el backend en un hosting (Render, Railway, etc.), actualiza `VITE_FORM_ENDPOINT` en el `.env` del frontend.
- El formulario del frontend muestra una **vista previa** del aviso antes de enviarlo (`src/components/navbar.ts`).
