# Comercializadora Los Olivos — Landing Page

Landing page empresarial para **Comercializadora Los Olivos E.I.R.L.**, con estética
futurista/premium. Construida con HTML5 semántico, TypeScript modular y librerías
ligeras. Sin frameworks pesados.

## Stack

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 semántico |
| Lógica | TypeScript (módulos ES) |
| Estilos base | Pico CSS |
| UI compleja | Shoelace (Web Components) |
| Carrusel hero | Swiper.js v12 |
| Microinteracciones | AutoAnimate |
| Modales / feedback | SweetAlert2 |
| Tooltips | Tippy.js |
| Iconografía | Lucide |
| Bundler / dev server | Vite |
| Chatbot backend | Express + Gemini IA + Supabase sync |
| Avisos backend | Express + Resend API (email) |

## Reglas de arquitectura

- Sin React / Vue / Angular / Tailwind.
- Sin `style=""` (CSS inline), sin CSS dentro del HTML. Excepción mínima: script inline de 2 líneas en `<head>` para `scrollRestoration` (debe ejecutarse antes que cualquier otro JS).
- Estructura, presentación y lógica completamente separadas.
- Módulos TypeScript independientes con responsabilidad única.
- CSS mínimo: Pico CSS cubre la base; `src/styles/theme.css` solo aporta la identidad visual.
- Mobile-first y HTML semántico.

## Estructura

```
/
├── index.html                 # Landing page principal
├── productos.html             # Catálogo de productos + carrito WhatsApp
├── avisos.html                # Avisos vigentes con reacciones
├── recetas.html               # Recetario con ingredientes enlazados a productos
├── src/
│   ├── main.ts                # Entry point index: navbar + hero + cards + footer + QR modal
│   ├── products-main.ts       # Entry point productos: navbar + catálogo + carrito + footer + QR
│   ├── avisos-main.ts         # Entry point avisos: fetch + render + countdown + footer + QR
│   ├── recipes-main.ts        # Entry point recetas: navbar + recetas + footer + QR
│   ├── components/
│   │   ├── navbar.ts          # Navbar responsive + drawer móvil + modal de aviso
│   │   ├── hero.ts            # Carrusel Swiper con paginación horizontal
│   │   ├── cards.ts           # Render de cards desde datos tipados
│   │   ├── catalog.ts         # Catálogo con filtros, paginación, imágenes y botón "Agregar"
│   │   ├── cart.ts            # Carrito de pedidos por WhatsApp (FAB + panel lateral)
│   │   ├── open-status.ts     # Badge "Abierto ahora" / "Cerrado" en navbar (tiempo real)
│   │   ├── recipes.ts         # Render de cards de recetas con ingredientes enlazados
│   │   ├── qr-modal.ts        # Modal del QR del footer (reutilizable en todas las páginas)
│   │   ├── chatbot.ts         # Widget de chatbot flotante (conecta con backend Gemini)
│   │   └── footer.ts          # Footer: contacto, redes, links de interés, horario
│   ├── data/
│   │   ├── products.ts        # Productos y categorías estáticas (fallback)
│   │   └── recipes.ts         # Recetas estáticas con ingredientes
│   ├── services/
│   │   ├── api.ts             # Datos tipados del negocio
│   │   └── supabase-client.ts # Cliente Supabase para productos
│   ├── styles/
│   │   ├── theme.css          # Identidad visual (paleta oliva/grafito/metálico)
│   │   └── chatbot.css        # Estilos del widget de chatbot
│   └── utils/
│       ├── animations.ts      # AutoAnimate en contenedores dinámicos
│       └── tooltips.ts        # Tippy.js
├── backend/                   # Backend Express del chatbot (Gemini IA + Supabase sync)
├── server/                    # Backend Express para avisos + email (Resend API)
├── public/                    # .htaccess, robots.txt, sitemap.xml, sinimg.jpeg, QR
├── assets/                    # Logo, QR, sinimg.jpeg
├── docs/                      # Documentación del proyecto
├── deploy-ftp.ps1             # Script de deploy FTP a producción
├── deploy-check.ps1           # Script de verificación post-deploy
├── cleanup-ftp.ps1            # Limpieza de assets viejos en el servidor (ejecutar tras cada deploy)
├── .env / .env.example        # Variables de entorno
├── package.json
├── tsconfig.json
└── vite.config.ts             # Multi-page (index + productos + avisos + recetas)
```

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # typecheck + build de producción (dist/)
npm run preview    # previsualizar el build
npm run typecheck  # solo verificación de tipos
```

## Deploy a producción

### Deploy FTP automático

```bash
npm run build
powershell -ExecutionPolicy Bypass -File deploy-ftp.ps1
powershell -ExecutionPolicy Bypass -File cleanup-ftp.ps1
```

El script `deploy-ftp.ps1` sube todos los archivos de `dist/` al hosting
(administrable.cl / Webuzo) por FTP. Credenciales configuradas en el script.

### Limpieza post-deploy (OBLIGATORIA)

**El plan de hosting tiene una cuota de disco de ~40 MB (compartida web + correo).**
Cada build genera ~25 archivos con hashes nuevos; los bundles viejos quedan en el
servidor y llenan la cuota (ocurrió el 23-sep-2026: error FTP 552 y el sitio quedó
sin poder actualizarse). `cleanup-ftp.ps1` borra de `public_html/assets/` todo
archivo que no esté en el `dist/` local actual — ejecutar SIEMPRE después de
cada deploy. La papelera `.trash` del hosting también cuenta para la cuota.

### Verificación post-deploy

```bash
powershell -ExecutionPolicy Bypass -File deploy-check.ps1
```

## Features

### Carrito de pedidos por WhatsApp (`productos.html`)

- Botón "+ Agregar" en cada tarjeta de producto
- Botón flotante (FAB) con contador de items
- Panel lateral con lista de productos, cantidades y total
- Envío del pedido por WhatsApp al número del negocio (56964194547)
- Componente: `src/components/cart.ts`

### Banner "Abierto ahora" (navbar, todas las páginas)

- Indicador verde ("Abierto ahora") o rojo ("Cerrado ahora") según horario
- Horario: Lun–Sab 10:00–19:00 hrs
- Se actualiza automáticamente cada minuto
- En móvil muestra versión compacta ("Abierto" / "Cerrado")
- Componente: `src/components/open-status.ts`

### Recetario (`recetas.html`)

- Página con recetas fáciles usando productos del almacén
- 36 recetas en 4 categorías: Almuerzo, Desayuno, Once/Cena, Postre (9 cada una)
- Cada receta: título, descripción, porciones, tiempo, ingredientes y pasos
- Ingredientes del almacén enlazados al catálogo de productos
- Select de filtrado por categoría
- Paginación: 3 cards por página con botones Anterior/Siguiente
- Scroll automático al título al cambiar de página o categoría
- Componentes: `src/components/recipes.ts`, `src/data/recipes.ts`

### Scroll al recargar página (todas las páginas)

- Script inline en `<head>`: `history.scrollRestoration = 'manual'` se ejecuta antes que el navegador restaure scroll
- Listener `pageshow` hace `scrollTo(0, 0)` después de que el navegador termina la restauración
- `main.ts` elimina hash `#inicio` de la URL y hace scroll al top tras `bootstrap()`
- Navbar intercepta clicks en "Inicio" desde cualquier página (`#inicio`, `/index.html#inicio`, `/#inicio`)

### QR en footer (todas las páginas)

- Imagen QR con botón "Escanear" que abre un modal ampliado
- Presente en index, productos, avisos y recetas
- Componente: `src/components/qr-modal.ts`

### Catálogo de productos (`productos.html`)

- Productos cargados desde Supabase (fallback a datos estáticos)
- Filtros por categoría, paginación
- **Buscador con autocompletado**: dropdown de sugerencias al escribir (mínimo 2 caracteres)
- **Búsqueda por prefijo de palabra**: escribir "vien" encuentra "vienesas"; "pan" encuentra "pan de molde" pero no "rupanco" (usa `\b` boundary inicial, no final)
- Imagen del producto o placeholder `sinimg.jpeg`
- Botón "+ Agregar" alineado al fondo de cada card
- Modal informativo al ingresar desde navbar: retiro en tienda 2 hrs, pago en efectivo o Redcompra

### Automatización de imágenes (`scripts/auto-images.mjs`)

Script que busca productos sin imagen en Supabase, descarga una imagen real de
Google Custom Search, la optimiza a WebP 500×500 con sharp, la sube a Supabase
Storage y actualiza `imagen_url` en la base de datos.

**Requisitos:**
- `GOOGLE_API_KEY` y `GOOGLE_CX` en `backend/.env` (Google Custom Search API)
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `backend/.env`
- Bucket `productos` creado en Supabase Storage

**Uso:**
```bash
node scripts/auto-images.mjs --dry-run          # listar productos sin imagen
node scripts/auto-images.mjs --limit 3          # procesar solo 3
node scripts/auto-images.mjs --product "Coca"   # filtrar por nombre
node scripts/auto-images.mjs                    # procesar todos
```

Para obtener las credenciales de Google:
1. https://console.cloud.google.com → habilitar Custom Search API → crear API key
2. https://cse.google.com → crear Custom Search Engine → copiar CX
3. Agregar a `backend/.env`:
   ```
   GOOGLE_API_KEY=tu-key
   GOOGLE_CX=tu-cx
   ```

### Avisos (`avisos.html`)

- Avisos vigentes con expiración de 30 días
- Reacciones (Me gusta / Me encanta)
- Contador regresivo de vigencia
- Footer con QR y links de interés
- Formulario protegido contra envíos duplicados: el botón "Enviar" se deshabilita
  mientras viaja la petición y un flag interno bloquea envíos simultáneos
  (23-sep-2026: clics repetidos con el backend dormido crearon 4 avisos duplicados)
- Mensaje "No hay avisos vigentes publicados." cuando la lista está vacía

### Chatbot (widget flotante, todas las páginas)

- Widget de chat conectado al backend Gemini (`backend/`)
- Precalentamiento: al cargar la página se hace `fetch` a `/api/health` para
  despertar el backend dormido (Render free duerme tras 15 min de inactividad)
- Si el usuario abre el chat antes de que conecte: mensaje centrado
  "Conectando con el asistente..." y header dinámico "Conectando..." → "En línea"
- Componente: `src/components/chatbot.ts`

## Variables de entorno

Ver `.env.example` como plantilla. Variables importantes:

```bash
VITE_COMPANY_NAME="Comercializadora Los Olivos"
VITE_CONTACT_EMAIL="paulinacontreras@comercializadoralosolivos.cl"
VITE_CONTACT_PHONE="+569 64 19 4547 - +569 30 74 8991"
VITE_CONTACT_ADDRESS="Concordia 408 Local A, Peñaflor, Santiago, Chile"
VITE_CONTACT_HOURS="Lun–Sab 10:00–19:00 hrs"
VITE_SOCIAL_WHATSAPP="https://wa.me/56964194547"
VITE_AVISOS_API_URL="https://los-olivos-avisos.onrender.com"
VITE_CHATBOT_API_URL="https://los-olivos-chatbot.onrender.com/api"
VITE_SUPABASE_URL="..."
VITE_SUPABASE_ANON_KEY="..."
```

## Backends

### Chatbot (`backend/`)

Express + Gemini IA + Supabase sync. Deploy automático en Render.

```bash
cd backend
npm install
cp .env.example .env  # completar credenciales
npm run dev          # http://localhost:3002
```

### Avisos (`server/`)

Express + Resend API (email). Deploy automático en Render.

```bash
cd server
npm install
npm run dev          # http://localhost:3001
```

#### Endpoints

- `GET /api/avisos` — lista avisos no expirados
- `POST /api/aviso` — recibe `{ name, phone, email, comment }`, guarda con expiración 30 días
- `POST /api/avisos/:id/react` — reacciones (like/love, add/remove)
- Panel admin en `/admin` (requiere `ADMIN_PASSWORD`)

## SEO

Las 4 páginas incluyen metadatos optimizados:

- Meta description específica por página
- Open Graph + Twitter Cards
- theme-color (#0b0e0c)
- robots.txt y sitemap.xml en `public/`
- Datos estructurados (BreadcrumbList en avisos)

## Correcciones de ortografía

Se revisaron y corrigieron todos los textos visibles al usuario en `index.html`, `recetas.html`, `productos.html` y `src/services/api.ts`:

- Tildes faltantes: estratégicas, día, pública, Envíanos, metodología, ágil, Néctar
- Errores tipográficos: exelentes → excelentes, nuetros → nuestros, perzonalizada → personalizada, Hambuerguesa → Hamburguesa
- Palabra duplicada: "para para" → "para"
- Mayúsculas: instagram → Instagram
- Horario consistente en 19:00 hrs en `.env`, datos estructurados y fallback de `api.ts`
- "Scanear" → "Escanear" en todos los botones QR

## Pendientes

### Tareas manuales externas

1. **Google My Business**: ficha creada. Si Google solicita verificación por carta,
   el código se ingresa en business.google.com con la cuenta Google del dueño.
2. **Contraseña del panel `/admin`**: `ADMIN_PASSWORD` es un secreto que SOLO existe
   en el dashboard de Render (no es el valor de `server/.env` local). Si se olvida:
   Render → servicio `los-olivos-avisos` → Environment → reemplazar valor → Save
   (redespliega solo, ~2 min).
3. **Hosting**: cuota de disco ~40 MB compartida (web + correo + papelera). Después
   de cada deploy ejecutar `cleanup-ftp.ps1` (ver sección Deploy).

Completadas: dominio de Resend verificado (`MAIL_FROM` ya usa
`paulinacontreras@comercializadoralosolivos.cl`), Google Search Console
(propiedad verificada, sitemap procesado).

### Tareas de desarrollo

4. **Productos sin imagen en Supabase**: el sistema muestra placeholder `sinimg.jpeg` cuando `imagen_url` es null. Automatización con Google Custom Search API pendiente de credenciales (`GOOGLE_API_KEY` y `GOOGLE_CX` en `backend/.env`).
5. **Producto "Malla mini frac x3"**: tiene imagen incorrecta en Supabase (error de dato, no de código).

## Documentación

- [Plan de trabajo](docs/PLAN_DE_TRABAJO.md)
- [Plan de negocios](docs/PLAN_DE_NEGOCIOS.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Guía de estilo visual](docs/GUIA_DE_ESTILO.md)
- [Plan del catálogo](docs/PLAN_CATALOGO.md)
- [Plan del chatbot](docs/planchatbot.md)
- [Plan de implementación](docs/plandeimplementacion.md)
- [Checklist Facebook](docs/CHECKLIST-FACEBOOK.md)
- [Checklist Deploy](docs/CHECKLIST_DEPLOY.md)
- [Plan de imágenes de productos](docs/PLAN_IMAGENES_PRODUCTOS.md)
