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
- Sin `style=""` (CSS inline), sin JavaScript inline, sin CSS dentro del HTML.
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
```

El script `deploy-ftp.ps1` sube todos los archivos de `dist/` al hosting
(administrable.cl / Webuzo) por FTP. Credenciales configuradas en el script.

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
- Horario: Lun–Sab 10:00–20:00 hrs
- Se actualiza automáticamente cada minuto
- En móvil muestra versión compacta ("Abierto" / "Cerrado")
- Componente: `src/components/open-status.ts`

### Recetario (`recetas.html`)

- Página con recetas fáciles usando productos del almacén
- Cada receta: título, descripción, porciones, tiempo, ingredientes y pasos
- Ingredientes del almacén enlazados al catálogo de productos
- Componentes: `src/components/recipes.ts`, `src/data/recipes.ts`

### QR en footer (todas las páginas)

- Imagen QR con botón "Scanear" que abre un modal ampliado
- Presente en index, productos, avisos y recetas
- Componente: `src/components/qr-modal.ts`

### Catálogo de productos (`productos.html`)

- Productos cargados desde Supabase (fallback a datos estáticos)
- Filtros por categoría, paginación
- Imagen del producto o placeholder `sinimg.jpeg`
- Botón "+ Agregar" alineado al fondo de cada card

### Avisos (`avisos.html`)

- Avisos vigentes con expiración de 30 días
- Reacciones (Me gusta / Me encanta)
- Contador regresivo de vigencia
- Footer con QR y links de interés

## Variables de entorno

Ver `.env.example` como plantilla. Variables importantes:

```bash
VITE_COMPANY_NAME="Comercializadora Los Olivos"
VITE_CONTACT_EMAIL="paulinacontreras@comercializadoralosolivos.cl"
VITE_CONTACT_PHONE="+569 64 19 4547 - +569 30 74 8991"
VITE_CONTACT_ADDRESS="Concordia 408 Local A, Peñaflor, Santiago, Chile"
VITE_CONTACT_HOURS="Lun–Sab 10:00–20:00 hrs"
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
