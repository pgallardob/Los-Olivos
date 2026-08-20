# Plan de Trabajo — Landing Futurista

## Objetivo

Entregar una landing page empresarial premium, mantenible y de alto rendimiento,
lista para recibir contenido real (logo, imágenes, datos de negocio).

## Fases

### Fase 1 — Fundaciones (✅ completada en scaffolding inicial)
- [x] Estructura de carpetas y configuración (Vite, TypeScript, .env).
- [x] Documentación base (README, planes, arquitectura, guía de estilo).
- [x] Assets placeholder (logo, hero, cards).

### Fase 2 — Implementación UI (✅ base entregada)
- [x] `index.html` semántico (header/nav, main, sections, footer).
- [x] Tema visual (paleta oliva/grafito/metálico sobre Pico CSS).
- [x] Navbar responsive con drawer móvil (Shoelace).
- [x] Hero con carrusel Swiper (desplazamiento a la izquierda, paginación horizontal, CTA).
- [x] Sección de cards con datos tipados.
- [x] Footer empresarial completo con iconos Lucide.
- [x] Microinteracciones: AutoAnimate, Tippy.js, SweetAlert2.
- [x] Rediseño visual v2: acento neón lima, fondo con grilla tech y glows,
      títulos con gradiente, cards estilo HUD (ver GUIA_DE_ESTILO.md).
- [x] Seguridad: Swiper actualizado a v12 (parche de prototype pollution, GHSA-hmx5-qpq5-p643).

### Fase 3 — Contenido real (parcialmente completado)
- [x] Nombre, dirección, teléfono y horario en `.env`.
- [x] Redes sociales en `.env` (Instagram y WhatsApp configurados).
- [x] Links de interés con logos personalizados (`laosita.jpeg`, `efi.jpg`, `los_olivos.jpg`).
- [x] Imágenes reales de ofertas (`assets/oferta*.jpeg`).
- [x] Dirección clickeable con modal de mapa (Google Maps embebido).
- [ ] Logo definitivo (reemplazar `assets/logoolivos.jpeg`).
- [ ] Imágenes reales de hero (optimizadas JPEG/WebP).
- [ ] Textos definitivos de hero, cards y secciones.

### Fase 4 — Integraciones (parcialmente completado)
- [x] Formulario de aviso en modal con envío a backend Express.
- [x] Backend Express con persistencia en JSON + expiración de 30 días.
- [x] Página de avisos vigentes (`/avisos.html`) con countdown.
- [x] Prevención de FOUC al navegar entre páginas.
- [ ] Conectar `services/api.ts` a un backend/CMS real.
- [ ] Analítica (respetuosa con privacidad) y medición de conversión.

### Fase 5 — Calidad y lanzamiento (parcialmente completado)
- [ ] Auditoría Lighthouse (objetivo: ≥90 en Performance, A11y, Best Practices, SEO).
- [ ] Pruebas cross-browser y en dispositivos reales (móvil/tablet/desktop).
- [x] Accesibilidad: navegación por teclado, contraste AAA, ARIA labels en navbar/secciones/footer.
- [x] SEO: metadatos description/keywords/author, Open Graph, Twitter Cards, theme-color en las 3 páginas.
- [x] SEO: robots.txt y sitemap.xml creados en public/ (incluidos en build).
- [ ] Despliegue (Netlify / Vercel / Cloudflare Pages / hosting estático).
- [ ] Dominio + HTTPS.

### Fase 6 — Preparación del frontend para producción (✅ completada)
- [x] Reemplazar todos los `localhost` en `.env` por las URLs reales de los backends en producción.
- [x] Verificar que `VITE_CHATBOT_API_URL`, `VITE_AVISOS_API_URL` y `VITE_FORM_ENDPOINT` apunten a los backends correctos.
- [x] Mover email hardcoded (`pgallardob@hotmail.com`) en `navbar.ts` a una variable de entorno `VITE_FALLBACK_EMAIL`.
- [x] Ejecutar `pnpm run build` y verificar que `dist/` se genere sin errores.
- [x] Verificar que las 3 páginas (index, productos, avisos) funcionen desde el build de producción (`pnpm preview`).
- [x] Copiar `sinimg.jpeg` a `public/assets/` para que Vite lo incluya en el build.
- [x] Actualizar CORS del backend de avisos para soportar múltiples orígenes (comma-separated).

### Fase 7 — Despliegue del backend del chatbot (pendiente de contratación de hosting)
- [ ] Contratar hosting en administrable.cl.
- [ ] Configurar variables de entorno en el hosting: `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `TZ`, `CORS_ALLOWED_ORIGINS`, `RATE_LIMIT_*`, `MAX_MESSAGE_LENGTH`.
- [ ] Desplegar y verificar que `GET /api/health` responda `{"status":"ok"}`.
- [ ] Ejecutar sincronización manual (`npm run sync`) para poblar `productos.json` desde Supabase.
- [ ] Verificar que `POST /api/chat` responde correctamente (probar con mensaje de prueba).
- [ ] Confirmar que el cron de sincronización automática (L-V 18:00) esté activo.

### Fase 8 — Despliegue del backend de avisos (pendiente de contratación de hosting)
- [ ] Contratar hosting en administrable.cl.
- [ ] Configurar variables de entorno: `PORT`, `CLIENT_ORIGIN` (URL del frontend en producción), `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO`.
- [ ] Verificar dominio de Resend: si se usa `onboarding@resend.dev`, dejarlo. Si se tiene dominio propio, verificarlo en Resend y cambiar `MAIL_FROM`.
- [ ] Desplegar y verificar que `GET /api/avisos` responda con un array JSON.
- [ ] Verificar que `POST /api/aviso` guarda un aviso de prueba y envía email.
- [ ] Confirmar que `avisos.json` persiste entre reinicios (volumen o almacenamiento persistente en el hosting).

### Fase 9 — Despliegue del frontend
- [ ] Elegir hosting estático (Netlify / Vercel / Cloudflare Pages) para el contenido de `dist/`.
- [ ] Configurar variables de entorno del frontend en el hosting con las URLs reales de los backends (Fases 7 y 8).
- [ ] Configurar redirecciones SPA si es necesario (para que `/productos.html` y `/avisos.html` funcionen).
- [ ] Desplegar y verificar:
  - Página index carga correctamente (hero, cards, footer, chatbot).
  - Página `/productos.html` muestra catálogo con imágenes (incluyendo `sinimg.jpeg` en cards sin imagen).
  - Página `/avisos.html` muestra los avisos vigentes desde el backend de producción.
  - Chatbot responde desde el backend de producción.
  - Formulario de aviso envía al backend de producción.
- [ ] Verificar que no hay errores en la consola del navegador.

### Fase 10 — Dominio, HTTPS y lanzamiento
- [ ] Comprar/apuntar dominio (ej: `losolivos.cl`) al hosting del frontend.
- [ ] Configurar DNS (A record o CNAME según el hosting).
- [ ] Verificar HTTPS automático (la mayoría de hostings lo proveen con Let's Encrypt).
- [ ] Actualizar `CORS_ALLOWED_ORIGINS` en el backend del chatbot con el dominio real.
- [ ] Actualizar `CLIENT_ORIGIN` en el backend de avisos con el dominio real.
- [ ] Prueba end-to-end final desde el dominio real:
  - Navegar las 3 páginas.
  - Enviar un mensaje al chatbot.
  - Enviar un aviso desde el modal.
  - Verificar que los avisos aparecen en `/avisos.html`.
  - Verificar que el email llega a `MAIL_TO`.
- [ ] Marcar Fase 3 (logo, hero, textos) como completada si corresponde.
- [ ] Lanzamiento oficial.

## Criterios de aceptación

1. Cero CSS/JS inline; módulos TS con responsabilidad única.
2. Funciona perfectamente en móvil, tablet y desktop (mobile-first).
3. Bundle pequeño: solo dependencias necesarias, imágenes lazy-load.
4. Todo contenido placeholder claramente marcado y centralizado.
5. `pnpm run build` pasa sin errores de tipos.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Imágenes reales pesadas degradan performance | Pipeline de optimización (WebP/AVIF, srcset, lazy) |
| Crecimiento desordenado del CSS | Regla: solo tokens/identidad en `theme.css`, Pico para el resto |
| Cambio de contenido frecuente | Datos centralizados en `api.ts` + `.env`, listos para CMS |
