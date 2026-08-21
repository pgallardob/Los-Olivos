# Checklist de Despliegue — Comercializadora Los Olivos

## Estado del proyecto: ⏳ Despliegue en progreso — pendiente propagación de dominio

---

## Arquitectura de despliegue

| Componente | Plataforma | Costo |
|---|---|---|
| **Frontend** (HTML/CSS/JS estático) | administrable.cl (Webuzo) | $5.990/año |
| **Backend Chatbot** (Node.js + Gemini) | Render.com free | $0 |
| **Backend Avisos** (Node.js + Resend) | Render.com free | $0 |
| **Base de datos + imágenes** | Supabase free | $0 |

---

## 1. Pasos antes de subir (PRE-DEPLOY)

### 1.1 Crear tabla `avisos` en Supabase
1. Entrar a https://supabase.com/dashboard → proyecto `kkeidfhyiybbngbvqjxt`
2. Ir a **SQL Editor**
3. Pegar y ejecutar el contenido de `docs/supabase-avisos.sql`
4. Verificar que la tabla `avisos` se creó en **Table Editor**

### 1.2 Configurar variables del frontend (`.env`)
| Variable | Cambiar a |
|---|---|
| `VITE_CONTACT_EMAIL` | `contacto@comercializadoralosolivos.cl` (o tu email real) |
| `VITE_FORM_ENDPOINT` | `https://los-olivos-avisos.onrender.com/api/aviso` |
| `VITE_CHATBOT_API_URL` | `https://los-olivos-chatbot.onrender.com/api` |
| `VITE_AVISOS_API_URL` | `https://los-olivos-avisos.onrender.com` |
| `VITE_SOCIAL_TIKTOK` | Agregar si tienes cuenta |
| `VITE_SOCIAL_FACEBOOK` | Agregar si tienes cuenta |

> **Nota**: Las URLs de Render son ejemplos. Render asignará la URL final al crear el servicio. Ajustar después.

### 1.3 Hacer build del frontend
```bash
npx vite build
```
- El resultado en `dist/` es lo que se sube a administrable.cl

---

## 2. Desplegar backends en Render.com

### 2.1 Crear cuenta en Render
1. Ir a https://render.com → Sign up (con GitHub o email)
2. Confirmar cuenta

### 2.2 Desplegar Backend Chatbot
1. **New** → **Web Service** → conectar repo de GitHub (o usar `render.yaml`)
2. Configurar:
   - **Name**: `los-olivos-chatbot`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Free
3. Variables de entorno:
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = `https://kkeidfhyiybbngbvqjxt.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key)
   - `GEMINI_API_KEY` = (tu API key de Gemini)
   - `AI_PROVIDER` = `gemini`
   - `AI_MODEL` = `gemini-2.0-flash`
   - `TZ` = `America/Santiago`
   - `CORS_ALLOWED_ORIGINS` = `https://comercializadoralosolivos.cl`
4. **Deploy** — Render asignará una URL como `https://los-olivos-chatbot.onrender.com`

### 2.3 Desplegar Backend Avisos
1. **New** → **Web Service** → conectar repo de GitHub (o usar `render.yaml`)
2. Configurar:
   - **Name**: `los-olivos-avisos`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
3. Variables de entorno:
   - `NODE_ENV` = `production`
   - `CLIENT_ORIGIN` = `https://comercializadoralosolivos.cl`
   - `RESEND_API_KEY` = (tu API key de Resend)
   - `MAIL_FROM` = `Los Olivos <onboarding@resend.dev>`
   - `MAIL_TO` = `pgallardob@hotmail.com`
   - `SUPABASE_URL` = `https://kkeidfhyiybbngbvqjxt.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key)
4. **Deploy** — Render asignará una URL como `https://los-olivos-avisos.onrender.com`

### 2.4 Actualizar URLs del frontend
Después de que Render asigne las URLs finales:
1. Actualizar `.env` con las URLs reales de Render
2. Rehacer `npx vite build`
3. Re-subir `dist/` a administrable.cl

---

## 3. Subir frontend a administrable.cl

1. Entrar al panel de administrable.cl (Webuzo — https://server.001webhospedaje.com:2003)
2. **File Manager** → `public_html`
3. Subir todo el contenido de `dist/` (arrastrar los archivos, NO la carpeta dist completa)
4. Asegurar que `index.html`, `productos.html`, `avisos.html`, `robots.txt`, `sitemap.xml` y la carpeta `assets/` estén directamente en `public_html`
5. **Borrar la carpeta `dist`** si se subió accidentalmente dentro de `public_html` (los archivos ya están sueltos)

---

## 4. Cuenta de correo

### Después de contratar hosting:
1. **Crear cuenta de correo** en administrable.cl (ej: `contacto@comercializadoralosolivos.cl`)
2. **Verificar dominio en Resend** para enviar emails desde `contacto@comercializadoralosolivos.cl`
   - Entrar a https://resend.com/domains
   - Agregar dominio `comercializadoralosolivos.cl`
   - Agregar los registros DNS que Resend indique (SPF, DKIM, DMARC) en administrable.cl → **Editor de zona DNS**
   - Esperar verificación (puede tardar hasta 48 hrs)
3. **Actualizar `MAIL_FROM`** en Render (variable de entorno del servicio avisos)
4. **Actualizar `VITE_CONTACT_EMAIL`** en `.env` → rehacer build → re-subir

### Mientras se verifica el dominio en Resend:
- El sistema usa `onboarding@resend.dev` como remitente (funciona, pero llega menos profesional)
- Los avisos igual llegan a `MAIL_TO`

---

## 5. Cosas a verificar/ajustar

### Antes del primer build de producción:
- [x] **Tabla `avisos`** creada en Supabase (ejecutar `docs/supabase-avisos.sql`)
- [x] **`VITE_CONTACT_EMAIL`**: cambiado a `contacto@comercializadoralosolivos.cl`
- [ ] **`VITE_SOCIAL_TIKTOK`**: está vacío, agregar si tienes cuenta
- [ ] **`VITE_SOCIAL_FACEBOOK`**: está vacío, agregar si tienes cuenta
- [ ] **`VITE_SOCIAL_LINKS_*`**: todos vacíos, agregar si tienes

### Después de desplegar backends en Render:
- [x] **Probar health check chatbot**: `https://los-olivos-chatbot.onrender.com/api/health` ✅
- [x] **Probar health check avisos**: `https://los-olivos-avisos.onrender.com/health` ✅
- [x] **Actualizar URLs de Render en `.env`** del frontend ✅
- [x] **Rehacer build** (`npx vite build`) ✅

### Después de subir a administrable.cl:
- [x] **Archivos subidos** a `public_html` ✅
- [x] **Dominio agregado** en panel de administrable.cl ✅
- [x] **Nameservers cambiados** en nic.cl → `ns1.001webhospedaje.com` / `ns2.001webhospedaje.com` ✅
- [ ] **Propagación del dominio** (esperar 2-24 hrs) ⏳
- [ ] **Probar que el sitio carga** en `https://comercializadoralosolivos.cl`
- [ ] **Probar el catálogo** en `/productos.html` (deben cargar los productos con imágenes desde Supabase)
- [ ] **Probar el chatbot** (botón flotante abajo a la derecha)
- [ ] **Probar el formulario de aviso** (botón "Envianos tu aviso" en navbar)
- [ ] **Probar la página de avisos** en `/avisos.html`
- [ ] **Verificar que las imágenes carguen** (desde Supabase Storage)
- [ ] **Verificar el menú móvil** (redimensionar pantalla y probar hamburguesa)
- [ ] **Probar en móvil real**

### SEO (después de que el sitio esté online):
- [ ] **Google Search Console**: agregar propiedad `comercializadoralosolivos.cl`
- [ ] **Enviar sitemap**: `https://comercializadoralosolivos.cl/sitemap.xml`
- [ ] **Google My Business**: reclamar/crear ficha del negocio para Google Maps

---

## 6. Notas técnicas

- **Render free tier**: 750 horas/mes. Los servicios se "duermen" tras 15 min de inactividad. Al recibir una petición, despiertan en ~30 segundos. Esto es normal en el plan gratis.
- **Spin-down**: la primera petición después de inactividad tarda ~30s. Las siguientes son rápidas.
- **Supabase**: base de datos y storage de imágenes. Ya configurado, no requiere cambios.
- **Dominio en metas**: configurado como `comercializadoralosolivos.cl` en canonical, og:url, sitemap, robots.txt y JSON-LD.
- **Build**: ejecutar `npx vite build` después de cambiar `.env`.
- **render.yaml**: archivo de configuración para desplegar ambos backends de una sola vez en Render.
- **Hosting**: administrable.cl usa panel Webuzo (no cPanel). URL del panel: `https://server.001webhospedaje.com:2003`
- **FTP**: Host `server.001webhospedaje.com:21`, usuario `yftqrecu` (credenciales en email de bienvenida)
- **Nameservers**: `ns1.001webhospedaje.com` / `ns2.001webhospedaje.com` (136.243.227.82)

---

## 8. Pendientes para mañana

1. **Verificar propagación del dominio**: abrir `https://comercializadoralosolivos.cl` — si no carga, esperar más
2. **Actualizar CORS en Render** cuando el dominio funcione:
   - Chatbot → Environment → `CORS_ALLOWED_ORIGINS` = `https://comercializadoralosolivos.cl`
   - Avisos → Environment → `CLIENT_ORIGIN` = `https://comercializadoralosolivos.cl`
3. **Verificar SSL**: el panel emite certificado Let's Encrypt automáticamente
4. **Probar funcionalidades**: chatbot, formulario de avisos, catálogo de productos
5. **Verificar dominio en Resend**: para enviar emails desde `contacto@comercializadoralosolivos.cl`
6. **Limpiar archivos temporales**: borrar `ftp-script.txt`, `upload-ftp.ps1`, `upload-all-ftp.ps1`, `dist-los-olivos.zip`

---

## 7. Estructura del proyecto (limpio)

```
landing-futurista/
├── .env                    ← configurar antes de build
├── render.yaml             ← config de Render.com (ambos backends)
├── index.html              ← página principal
├── productos.html          ← catálogo
├── avisos.html             ← avisos
├── assets/                 ← imágenes del sitio
├── public/                 ← robots.txt, sitemap.xml, sinimg.jpeg
├── src/                    ← código fuente TypeScript
├── dist/                   ← BUILD para subir (generado por vite build)
├── backend/                ← chatbot IA → desplegar en Render.com
├── server/                 ← avisos backend → desplegar en Render.com
├── docs/                   ← documentación + SQL + checklist
├── package.json
├── vite.config.ts
└── tsconfig.json
```
