# Sistema de Avisos con Imagen + Preparación para Facebook

Guía de operación y estado del sistema (septiembre 2026).

## Estado de la implementación

- [x] Fase 1 — SQL en Supabase: tablas `aviso_images`, `aviso_facebook` y bucket `aviso-images` (proyecto nuevo)
- [x] Fase 2 — Backend: imágenes opcionales en `POST /api/aviso` (multer + Storage) y `image_url` en `GET /api/avisos`
- [x] Fase 3 — Texto para Facebook generado automáticamente y registrado como `pendiente` al publicar cada aviso
- [x] Fase 4 — Panel de administración privado en `/admin` (desplegado y verificado en Render)
- [x] Fase 5 — Frontend: input de imagen en el modal de aviso y render de imágenes en las cards
- [x] Fase 6 — Frontend desplegado al hosting vía File Manager de Webuzo (zip), verificado en producción
- [x] Fase 7 — Esta guía

## 📋 Pendientes para la próxima sesión

1. ~~Subir el NUEVO `dist-update.zip`~~ **HECHO 2-sep 12:15**: subido por File Manager y **verificado en producción** — `avisos.html` sirve `avisos-ZiAUOyE3.js` (HTTP 200, 5.668 bytes, idéntico al local), `index.html` y `productos.html` con bundles nuevos. El layout imagen-izquierda/texto-derecha está vivo; se verá con imágenes cuando llegue un aviso con foto (los 5 actuales son solo texto).
2. ~~Eliminar el aviso DEMO~~ **HECHO 2-sep**: eliminado de `avisos` + `aviso_images` + `aviso_facebook` + objeto en bucket (carpeta 11 vacía, 7 avisos visibles).
3. **Contraseña FTP inválida** (error 530) — verificado 2-sep: sigue rechazada. **Correo de seguimiento enviado 2-sep 12:05** (restablecer contraseña FTP usuario `yftqrecu` + desbloquear IP si está en lfd + confirmar host). Cuando llegue: actualizar `deploy-ftp.ps1` → `deploy-check.ps1` → deploy FTP operativo. Método vigente de deploy: **Webuzo File Manager + zip**.
4. ~~Eliminar avisos de prueba 12 y 13~~ **HECHO 2-sep**: eliminados por completo (`avisos` + `aviso_images` + `aviso_facebook` + `aviso_reactions` + 2 objetos del bucket). Quedan 5 avisos reales (ids 1–5), verificado en la API pública.
5. ~~Verificación end-to-end final~~ **HECHO 2-sep 15:46**: confirmado por el cliente con una publicación de prueba con imagen (id 15) recorriendo todo el circuito — modal con imagen → email → web con miniatura → panel → botón "Preparar publicación (1 clic)" → publicar en el grupo → marcar publicado. La prueba fue eliminada por completo después (bucket + `aviso_facebook` + `aviso_images` + `aviso_reactions` + fila `avisos`). Estado final: 5 avisos reales (ids 1–5, solo texto).
6. ~~Subir `dist-update.zip` v3~~ **HECHO 2-sep 13:10**: subido y **confirmado por el cliente** — layout imagen-izquierda/texto-derecha OK en producción, `.htaccess` anti-cache activo, botones del panel ajustados vía Render.
7. ~~Subir `dist-update.zip` v4~~ **SUPERSEDO por v5**: se detectó 2-sep 13:40 que v3/v4 nunca llegaron al servidor (producción seguía en la subida de las 12:14; el usuario subía un zip antiguo descargado). **HECHO 2-sep 14:02 con `dist-update-v5.zip`** (nombre distintivo para evitar confusiones; bundle `avisos-CiQrEVFo.js`, CSS `chunk-rkPJhU_T.css`): ancho 38% + alto a la mitad (aspect 3:2, máx. 190px). **Verificado en servidor**: regla presente en el CSS servido, HTML referenciando v5, y `Cache-Control: no-cache, must-revalidate` activo (el `.htaccess` funciona — los futuros deploys se verán con un simple F5). ~~Pendiente: confirmación visual del cliente~~ **CONFIRMADO 2-sep 14:06** → ~~eliminar aviso de prueba id 14~~ **HECHO 2-sep 16:19** (commit `6478b5c`, script con SDK: bucket `14/1788365990236.jpg` + `aviso_facebook` + `aviso_images` + `aviso_reactions` + fila `avisos`; verificado: 5 avisos, id 14 ausente).
8. **Flujo de publicación al grupo Facebook**: añadido botón **"🚀 Preparar publicación (1 clic)"** en el panel (commit `6478b5c`, desplegado vía Render): abre el grupo `FB_GROUP_URL` + copia el texto + descarga la imagen 1200×630 en simultáneo. Publicación automática en grupos NO existe (Meta cerró la Groups API en abril 2024 — ninguna app/herramienta puede postear en grupos, solo en Páginas), por lo que este flujo asistido de ~60 seg es el método definitivo. **CONFIRMADO en uso real 2-sep 15:46** por el cliente. Además `Cache-Control: no-cache` en `/admin` (commit `513901d`) para que el panel siempre cargue fresco.

## ⚠️ Incidente de hosting (1-sep-2026) — en resolución

1. El script de deploy FTP intentó subir con las credenciales del email de bienvenida (usuario `yftqrecu`) y el servidor las rechazó (error 530) desde el primer intento — funcionaban en despliegues anteriores.
2. Los reintentos automáticos del script dispararon el firewall del hosting: la IP `186.189.106.174` quedó bloqueada (puertos 21/80/443/2003). El sitio público sigue funcionando para el resto del mundo (verificado).
3. Se envió correo a **soporte@administrable.cl** solicitando: desbloquear la IP + verificar/restablecer la contraseña FTP.
4. **1-sep 16:07**: el soporte levantó el bloqueo (lfd: 10 logins FTP fallidos/hora). La contraseña FTP sigue rechazada (530) — pendiente restablecer con el soporte.
5. **1-sep 16:23**: `dist/` (versión fase 5) subido por **File Manager de Webuzo** (`dist-update.zip` → extraer en `public_html`) — verificado en producción: render de imágenes + input de imagen en modal + estilos.
6. **1-sep 16:45**: ajuste de layout solicitado por el cliente (imagen demasiado grande) → reescrito a miniatura izquierda (38%, 3:4) + texto derecha (commit `4e75048`). **El zip con este cambio aún no se sube** — es el pendiente 1.
7. `deploy-ftp.ps1` reescrito: host por IP (136.243.227.82), **sin reintentos**, prueba única de login y detención total ante 530. `deploy-check.ps1` nuevo: estado de baneo + login en un comando.
8. `ADMIN_PASSWORD` configurada en Render — panel verificado por el cliente (login OK, tarjeta DEMO con imagen, botones funcionando).

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
- **Borrar objetos del bucket**: usar el SDK de Supabase (`supabase.storage.from('aviso-images').remove([...])`); los endpoints REST directos (`POST /object/{bucket}`, `POST /object/delete`) devuelven 404 en este proyecto.
