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

Recibe JSON con:

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

## Notas

- **No necesitas tu contraseña de Hotmail.** Resend usa su propia API key.
- Para enviar desde tu propio dominio (ej. `avisos@losolivos.cl`), verifica el dominio en Resend y cambia `MAIL_FROM`.
- `MAIL_TO` se puede cambiar en cualquier momento en `.env` sin tocar el código.
- Si despliegas el backend en un hosting (Render, Railway, etc.), actualiza `VITE_FORM_ENDPOINT` en el `.env` del frontend.
