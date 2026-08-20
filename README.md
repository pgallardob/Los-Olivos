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
| Carrusel hero | Swiper.js v12 (≥ 12.1.2 por seguridad) |
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
├── index.html                 # Estructura semántica (sin lógica ni estilos)
├── productos.html             # Página de catálogo de productos
├── avisos.html                # Página de avisos vigentes (noticias publicadas)
├── src/
│   ├── main.ts                # Punto de entrada index: importa estilos e inicializa módulos
│   ├── products-main.ts       # Punto de entrada productos: navbar + catálogo + footer
│   ├── avisos-main.ts         # Punto de entrada avisos: fetch + render + countdown
│   ├── components/
│   │   ├── navbar.ts          # Navbar responsive + drawer móvil + modal de aviso
│   │   ├── hero.ts            # Carrusel Swiper con paginación horizontal
│   │   ├── cards.ts           # Render de cards desde datos tipados
│   │   ├── catalog.ts         # Catálogo de productos con filtros, paginación e imágenes
│   │   ├── chatbot.ts         # Widget de chatbot flotante (conecta con backend Gemini)
│   │   └── footer.ts          # Footer: contacto, redes, links de interés, mapa modal
│   ├── data/
│   │   └── products.ts        # Productos y categorías estáticas del catálogo
│   ├── services/
│   │   └── api.ts             # Datos tipados (simula API; fácil de conectar a backend)
│   ├── styles/
│   │   ├── theme.css          # Identidad visual (paleta oliva/grafito/metálico)
│   │   └── chatbot.css        # Estilos del widget de chatbot
│   └── utils/
│       ├── animations.ts      # AutoAnimate en contenedores dinámicos
│       └── tooltips.ts        # Tippy.js
├── backend/                   # Backend Express del chatbot (Gemini IA + Supabase sync)
│   ├── src/
│   │   ├── config/config.js          # Carga de variables de entorno
│   │   ├── controllers/
│   │   │   └── chat.controller.js    # Lógica del endpoint /chat
│   │   ├── repositories/
│   │   │   └── product.repository.js # Consultas a Supabase
│   │   ├── routes/
│   │   │   ├── chat.routes.js        # Ruta POST /chat + validación
│   │   │   └── health.routes.js      # Rutas GET /health, /sync/status
│   │   ├── scripts/
│   │   │   └── run-sync.js           # Script de sync manual
│   │   ├── services/
│   │   │   ├── ai/                   # Abstracción de IA (Gemini + prompt anti-alucinación)
│   │   │   ├── business.service.js   # Lee negocio.json
│   │   │   ├── product.service.js    # Catálogo en memoria
│   │   │   ├── search.service.js     # Búsqueda local + detección de intención + typo tolerance
│   │   │   └── sync.service.js       # Sincronización + scheduler cron
│   │   ├── utils/
│   │   │   ├── json-storage.js       # Escritura segura de JSON
│   │   │   └── normalize.js          # Normalización + Levenshtein + spell match
│   │   └── server.js                 # Entry point Express
│   ├── data/
│   │   ├── negocio.json              # Info del negocio (manual)
│   │   └── productos.json            # Cache de productos (auto-generado por sync)
│   └── .env.example
├── server/                    # Backend Express para avisos + email (Resend API)
│   ├── server.js
│   ├── avisos.json            # Persistencia de avisos (con expiración 30 días)
│   ├── package.json
│   └── .env                   # RESEND_API_KEY, MAIL_TO, MAIL_FROM
├── public/
│   ├── assets/sinimg.jpeg     # Imagen por defecto para cards sin imagen (copiado a dist/)
│   ├── robots.txt             # SEO: directivas para crawlers
│   └── sitemap.xml            # SEO: sitemap con las 3 páginas
├── assets/                    # Logo, imágenes de ofertas, hero, sinimg.jpeg, logos de links
├── docs/                      # Plan de trabajo, plan de negocios, arquitectura, guía de estilo
├── .env / .env.example        # Variables de entorno
├── package.json
├── tsconfig.json
└── vite.config.ts             # Multi-page (index + productos + avisos)
```

## Comandos

```bash
pnpm install       # instalar dependencias
pnpm dev           # servidor de desarrollo (http://localhost:5173)
pnpm build         # typecheck + build de producción (dist/)
pnpm preview       # previsualizar el build
pnpm typecheck     # solo verificación de tipos
```

> **Nota:** Usar `pnpm` (no `npm`). El proyecto usa pnpm como gestor de paquetes.

## Contenido y configuración

Todo dato de negocio (nombre, contacto, redes, formulario) está centralizado en `.env`
(usar `.env.example` como plantilla) y `src/services/api.ts`.

### Variables de entorno importantes

```bash
# Identidad
VITE_COMPANY_NAME="Comercializadora Los Olivos"
VITE_COMPANY_TAGLINE="Comercializadora Los Olivos E.I.R.L."

# Contacto
VITE_CONTACT_EMAIL="contacto@ejemplo.com"
VITE_CONTACT_PHONE="+569 64 19 4547 - +569 30 74 8991"
VITE_CONTACT_ADDRESS="Concordia 408 Local A, Peñaflor, Santiago, Chile"
VITE_CONTACT_HOURS="Lun–Sab 10:00–20:00 hrs"

# Redes sociales (Síguenos)
VITE_SOCIAL_INSTAGRAM="https://www.instagram.com/comercializadora_los_olivos_?igsh=..."
VITE_SOCIAL_TIKTOK=""
VITE_SOCIAL_WHATSAPP="https://wa.me/56964194547"
VITE_SOCIAL_FACEBOOK=""

# Links de interés (logos personalizados en api.ts, no usa estas vars)
VITE_SOCIAL_LINKS_INSTAGRAM=""
VITE_SOCIAL_LINKS_TIKTOK=""
VITE_SOCIAL_LINKS_WHATSAPP=""
VITE_SOCIAL_LINKS_FACEBOOK=""

# Backend de avisos (POST — formulario)
VITE_FORM_ENDPOINT="http://localhost:3001/api/aviso"

# Backend de avisos (GET — lista de avisos)
VITE_AVISOS_API_URL="http://localhost:3001"

# Backend del chatbot
VITE_CHATBOT_API_URL="http://localhost:3002/api"

# Email fallback (si no hay VITE_FORM_ENDPOINT)
VITE_FALLBACK_EMAIL="pgallardob@hotmail.com"
```

Para lanzar a producción:

1. Completar `.env` con las URLs reales de los backends.
2. Sustituir `assets/logoolivos.jpeg` por el logo real.
3. Sustituir `assets/oferta*.jpeg` por imágenes reales (optimizadas, WebP/JPEG).
4. Ajustar textos en `src/services/api.ts` si es necesario.
5. Ejecutar `pnpm run build`.
6. Desplegar el contenido de `dist/` en un hosting estático.

## Catálogo de productos

La página `/productos.html` muestra un catálogo estático con productos agrupados por
categorías (abarrotes, aseo, hogar, alimentos, bebidas). Los productos se definen en
`src/data/products.ts` con nombre, marca y categoría.

### Carga de imágenes

1. Si el producto tiene campo `imagen`, se usa esa URL.
2. Si no tiene imagen, se muestra `assets/sinimg.jpeg` como placeholder.

## Chatbot (backend)

El backend Express en `backend/` sincroniza productos desde Supabase (ERP) y atiende
las consultas del chatbot usando Gemini IA. El widget flotante aparece en todas las páginas.

### Features del chatbot

- **Búsqueda local con scoring**: match exacto, por inclusión, fuzzy, categoría, marca
- **Tolerancia ortográfica**: Levenshtein distance para encontrar productos con errores de tipeo (ej: "huebo" → "huevo")
- **Case-sensitive scoring**: bonus cuando el case del query coincide exactamente con el producto
- **Detección de intención**: saludo, despedida, negocio (horarios, ubicación, delivery, pagos), producto, sugerencia
- **Sugerencias de productos**: responde a "sugiereme algo" con productos aleatorios del catálogo
- **Aclaración para consultas genéricas**: si una palabra tiene 4+ resultados, pide especificar tipo/marca
- **Respuestas directas sin IA**: saludos, despedidas e info del negocio se responden sin llamar a Gemini
- **Fallback con productos**: si Gemini falla, muestra los productos encontrados localmente
- **Prompt anti-alucinación**: Gemini solo usa el contexto enviado, nunca inventa precios ni stock

```bash
cd backend
pnpm install --ignore-workspace
cp .env.example .env  # completar credenciales
pnpm dev          # Backend en http://localhost:3002
```

Ver [`backend/README.md`](backend/README.md) para detalles completos.

## Backend (avisos)

El servidor Express en `server/` maneja el formulario de avisos del modal "Envianos tu aviso".
Persiste los avisos en `server/avisos.json` con expiración de 30 días y envía notificaciones
por email usando la API de Resend. Requiere `RESEND_API_KEY` en `server/.env`.
CORS soporta múltiples orígenes separados por coma en `CLIENT_ORIGIN`.

```bash
cd server
pnpm install
pnpm dev          # Backend en http://localhost:3001
```

### Endpoints

- `GET /api/avisos` — lista avisos no expirados (prune automático).
- `POST /api/aviso` — recibe `{ name, phone, email, comment }`, guarda con `expiresAt` (30 días).

## Página de avisos (`/avisos.html`)

Muestra los avisos vigentes publicados por los usuarios. Cada aviso incluye nombre,
correo, mensaje, fecha de publicación y contador regresivo de vigencia (30 días).
Los avisos expirados se eliminan automáticamente del backend y del frontend.

## Prevención de FOUC

Cada página incluye CSS crítico inline en `<head>` (fondo oscuro + `body { visibility: hidden }`)
y los entry points TS agregan la clase `styles-ready` al body después de cargar los estilos,
evitando el flash de contenido sin estilos al navegar entre páginas.

## SEO

Las 3 páginas incluyen metadatos optimizados:

- **Meta description** específica por página
- **Open Graph** (type, site_name, title, description, locale es_CL, image)
- **Twitter Cards** (summary_large_image en index, summary en productos/avisos)
- **theme-color** (#0b0e0c)
- **robots.txt** y **sitemap.xml** en `public/` (incluidos automáticamente en `dist/`)

## Documentación

- [Plan de trabajo](docs/PLAN_DE_TRABAJO.md)
- [Plan de negocios](docs/PLAN_DE_NEGOCIOS.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Guía de estilo visual](docs/GUIA_DE_ESTILO.md)
- [Plan del catálogo](docs/PLAN_CATALOGO.md)
- [Plan del chatbot](docs/planchatbot.md)
- [Plan de implementación](docs/plandeimplementacion.md)
- [Auditoría ERP](docs/ERP_AUDIT.md)
