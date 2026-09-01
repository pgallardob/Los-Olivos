# Sistema de Avisos con Imagen + Preparación para Facebook

Guía de operación y estado del sistema (septiembre 2026).

## Estado de la implementación

- [x] Fase 1 — SQL en Supabase: tablas `aviso_images`, `aviso_facebook` y bucket `aviso-images` (proyecto nuevo)
- [x] Fase 2 — Backend: imágenes opcionales en `POST /api/aviso` (multer + Storage) y `image_url` en `GET /api/avisos`
- [x] Fase 3 — Texto para Facebook generado automáticamente y registrado como `pendiente` al publicar cada aviso
- [x] Fase 4 — Panel de administración privado en `/admin` (desplegado y verificado en Render)
- [x] Fase 5 — Frontend: input de imagen en el modal de aviso y render de imágenes en las cards
- [ ] Fase 6 — **PENDIENTE/BLOQUEADA**: subir la carpeta `dist/` al hosting (ver incidente abajo)
- [x] Fase 7 — Esta guía

## ⚠️ Incidente de hosting (1-sep-2026) — en resolución

1. El script de deploy FTP intentó subir con las credenciales del email de bienvenida (usuario `yftqrecu`) y el servidor las rechazó (error 530) desde el primer intento — funcionaban en despliegues anteriores.
2. Los reintentos automáticos del script dispararon el firewall del hosting: la IP `186.189.106.174` quedó bloqueada (puertos 21/80/443/2003). El sitio público sigue funcionando para el resto del mundo (verificado).
3. Se envió correo a **soporte@administrable.cl** solicitando: desbloquear la IP + verificar/restablecer la contraseña FTP.
4. `deploy-ftp.ps1` fue reescrito: host por IP (136.243.227.82, según email de bienvenida), **sin reintentos**, prueba única de login antes de subir y detención total ante error 530.
5. `deploy-check.ps1` (nuevo): verifica en un comando si el baneo sigue activo y si las credenciales FTP ya funcionan — **usarlo antes de cualquier intento de deploy**.
6. `dist-update.zip` (1,25 MB) quedó listo en la raíz del proyecto como alternativa para subir por File Manager del panel Webuzo.
7. `ADMIN_PASSWORD` ya está configurada en Render (panel operativo).

## URL del panel

https://los-olivos-avisos.onrender.com/admin

Protegido por contraseña única (`ADMIN_PASSWORD`, variable de entorno en Render). No requiere cuentas ni Supabase en el navegador.

## Configuración única pendiente

1. **Contraseña del panel**: Render → servicio `los-olivos-avisos` → Environment → agregar `ADMIN_PASSWORD` con la contraseña elegida → Save (reinicia el servicio). Sin esta variable, nadie puede entrar al panel.
2. **Subir el frontend**: desde el panel de 001webhospedaje (File Manager o FTP), reemplazar el contenido de `public_html` con los archivos de `dist/`.

## Flujo de trabajo diario (administrador)

1. Un vecino publica un aviso en la web (con o sin imagen, máximo 5MB).
2. Llega email de notificación a `pgallardob@hotmail.com` y el aviso aparece en `/avisos.html` por 30 días.
3. Entras al panel → pestaña **Pendientes**.
4. Revisas la tarjeta generada (imagen + texto superpuestos, formato 1200x630) y los datos del aviso.
5. Acciones disponibles:
   - **⧉ Copiar texto**: deja en el portapapeles el texto listo con contacto, dirección y hashtags.
   - **↓ Descargar imagen**: genera la tarjeta PNG para adjuntar en Facebook.
   - **Abrir grupo de Facebook**: abre directamente el grupo (URL configurable).
   - **✓ Marcar como publicado**: una vez publicado manualmente en el grupo.
   - **✗ Rechazar**: con observaciones opcionales (queda registrado el motivo).
6. En Facebook: pegas el texto + subes la imagen descargada. El sistema **nunca publica automáticamente**.

## Reglas de negocio implementadas

- Imagen opcional: JPG, PNG, WebP o GIF, máximo 5MB (validado en cliente y servidor).
- Aviso sin imagen → tarjeta con fondo de marca generado por el panel.
- Texto Facebook: aviso + contacto + dirección + horario + Instagram + hashtags.
- Estados: `pendiente` → `publicado` / `rechazado` (reversible a pendiente).
- Avisos expiran a los 30 días (dejan de mostrarse en la web; el registro Facebook se conserva).
- Avisos anteriores a este sistema se muestran con chip "Sin registro Facebook".

## Arquitectura de datos

- `avisos` (proyecto antiguo `kkeidfhyiybbngbvqjxt`): no se tocó su estructura; solo se agregó lectura del `id` al insertar.
- `aviso_images`, `aviso_facebook`, bucket `aviso-images` (proyecto nuevo `hfzfzaatljykdjuhneya`): imágenes y preparación Facebook.
- El bucket es público por diseño: las imágenes deben cargarse sin clave desde la página de avisos.
- Storage path: `{aviso_id}/{timestamp}.{ext}` — cada aviso tiene su propia carpeta.

## Operación

- **Cambiar contraseña del panel**: Render → Environment → `ADMIN_PASSWORD` → Save.
- **Cambiar grupo de Facebook**: Render → Environment → `FB_GROUP_URL` → Save. Valor actual: `https://www.facebook.com/share/g/1HLN9w3p3s/`.
- **Subir cambios del backend**: push a `main` en GitHub (Render despliega automáticamente).
- **Subir cambios del frontend**: `npm run build` en la raíz + subir `dist/` al hosting.
