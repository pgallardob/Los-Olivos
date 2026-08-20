# Chatbot Backend — Comercializadora Los Olivos

Backend Node.js/Express que sincroniza productos desde Supabase (ERP) y atiende consultas del chatbot usando Gemini IA.

## Arquitectura

```
ERP (Supabase) → sync.service → productos.json → product.service (memoria)
                                                      ↓
Chatbot Web → /api/chat → search.service (búsqueda local) → ai.service (Gemini) → respuesta
```

### Separación de responsabilidades

- **ERP (Supabase):** fuente original de productos, precios y stock
- **Sync process:** descarga datos del ERP → `productos.json` (cache local)
- **Express API:** lee `productos.json`, busca productos localmente, envía contexto a Gemini
- **Gemini:** interpreta la pregunta y redacta la respuesta usando SOLO el contexto enviado
- **Frontend:** widget que comunica con `/api/chat`, sin conocer API keys ni Supabase

## Instalación

```bash
cd backend
pnpm install --ignore-workspace
cp .env.example .env  # completar credenciales
```

## Variables de entorno (.env)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default: 3002) |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo backend) |
| `GEMINI_API_KEY` | API key de Google Gemini |
| `AI_PROVIDER` | `gemini` (default) o `openai` (futuro) |
| `AI_MODEL` | Modelo de Gemini (default: `gemini-3.6-flash`) |
| `TZ` | Zona horaria (default: `America/Santiago`) |
| `CORS_ALLOWED_ORIGINS` | URLs permitidas, separadas por coma |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting (default: 60000) |
| `RATE_LIMIT_MAX` | Máximo de requests por ventana (default: 15) |
| `MAX_MESSAGE_LENGTH` | Máximo de caracteres por mensaje (default: 500) |

## Uso

```bash
# Iniciar servidor
npm start

# Desarrollo (auto-reload)
npm run dev

# Sincronización manual ERP → JSON
npm run sync
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor |
| `GET` | `/api/sync/status` | Estado de la última sincronización |
| `POST` | `/api/chat` | Enviar mensaje al chatbot |

### POST /api/chat

```json
// Request
{ "message": "cuanto cuesta el arroz?" }

// Response
{ "reply": "¡Hola! Tenemos Arroz El Monarca G2 1kg a $1.050..." }
```

## Sincronización

- **Automática:** Lunes a viernes a las 18:00 (America/Santiago) vía node-cron
- **Manual:** `npm run sync`
- **Seguridad:** escritura atómica (tmp → rename), backup `productos.previous.json`
- **Filtro:** solo productos con `estado = true` y `deleted_at IS NULL`

## Estructura

```
backend/
├── src/
│   ├── config/config.js          # Carga de variables de entorno
│   ├── controllers/
│   │   └── chat.controller.js    # Lógica del endpoint /chat
│   ├── repositories/
│   │   └── product.repository.js # Consultas a Supabase
│   ├── routes/
│   │   ├── chat.routes.js        # Ruta POST /chat + validación
│   │   └── health.routes.js      # Rutas GET /health, /sync/status
│   ├── scripts/
│   │   └── run-sync.js           # Script de sync manual
│   ├── services/
│   │   ├── ai/
│   │   │   ├── ai.service.js     # Abstracción de proveedor de IA
│   │   │   ├── gemini.provider.js # Implementación Gemini
│   │   │   ├── openai.provider.js # Stub para futuro
│   │   │   └── prompt.js         # Prompt centralizado anti-alucinación
│   │   ├── business.service.js   # Lee negocio.json
│   │   ├── product.service.js    # Catálogo en memoria
│   │   ├── search.service.js     # Búsqueda local + detección de intención
│   │   └── sync.service.js       # Sincronización + scheduler
│   ├── utils/
│   │   ├── json-storage.js       # Escritura segura de JSON
│   │   └── normalize.js          # Normalización de texto
│   └── server.js                 # Entry point Express
├── data/
│   ├── negocio.json              # Info del negocio (manual)
│   └── productos.json            # Cache de productos (auto-generado)
├── .env.example
├── .gitignore
└── package.json
```

## Seguridad

- API keys solo en `.env` (nunca en el frontend)
- CORS restringido a orígenes configurados
- Rate limiting: 15 requests/minuto por IP
- Validación de entrada: mensaje obligatorio, máximo 500 caracteres
- Solo lecturas (`SELECT`) a Supabase — nunca modifica el ERP

## Features del chatbot

### Búsqueda de productos (`search.service.js`)

El motor de búsqueda local implementa un sistema de scoring multicapa:

1. **Match exacto (100 pts)**: nombre del producto = query normalizado
2. **Match por inclusión (80 pts)**: query contenido en el nombre
3. **Fuzzy match (60 pts)**: todas las palabras del query en el nombre
4. **Match por categoría (50 pts)**: query coincide con categoría
5. **Match por marca (45 pts)**: query coincide con marca
6. **Match parcial (30+ pts)**: al menos una palabra significativa coincide
7. **Match por similitud ortográfica (hasta 25 pts)**: Levenshtein distance

### Tolerancia ortográfica (`normalize.js`)

- **`levenshtein(a, b)`**: calcula distancia de edición entre dos palabras
- **`spellMatch(query, target)`**: retorna `true` si la distancia es ≤ 1/3 del largo
- **Match por substring**: compara el query contra partes de palabras más largas (ej: "cafee" encuentra "cafe" dentro de "nescafe")
- Ejemplos: "huebo"→"huevo", "arros"→"arroz", "choclate"→"chocolate"

### Case-sensitive scoring

- Bonus de +20 pts si el match exacto coincide también en mayúsculas/minúsculas
- Bonus de +15 pts si la inclusión coincide con case exacto
- Bonus de +10 pts si todas las palabras del fuzzy match preservan el case

### Detección de intención (`detectIntent`)

| Intención | Patrones |
|---|---|
| Saludo | hola, buenas, buenos días, saludos |
| Despedida | gracias, chao, adios, hasta luego |
| Negocio | horarios, ubicación, teléfono, WhatsApp, redes, pedidos, delivery, pagos |
| Producto (precio) | cuanto cuesta, precio de, a cuanto |
| Producto (stock) | tienen, hay disponible, stock |
| Producto (sugerencia) | sugiereme, recomiendame, que compro, novedades |
| Producto (general) | catálogo, lista de productos |

### Respuestas directas sin IA

- **Saludos y despedidas**: respondidos directamente sin llamar a Gemini
- **Info del negocio**: horarios, ubicación, teléfono, WhatsApp, redes, delivery, pagos
- **Sugerencias**: "sugiereme algo" → 5 productos aleatorios con stock
- **Consultas genéricas**: si una palabra tiene 4+ resultados, pide aclaración con ejemplos reales

### Fallback

Si Gemini falla o no responde, el backend muestra los productos encontrados localmente
con precio y stock, o información de contacto del negocio.
