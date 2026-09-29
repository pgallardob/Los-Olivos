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
├── test-catalog.local.mjs        # Harness: catálogo completo encontrable (regresión)
├── test-chat.local.mjs           # Batería de queries vía HTTP (requiere servidor)
├── test-search-cases.local.mjs   # Regresión dirigida: diminutivos, contaminación, frustración (sin servidor)
├── probe-scores.local.mjs       # Búsqueda directa sin servidor (depuración)
├── .env.example
├── .gitignore
└── package.json
```

## Pruebas locales

```bash
# Regresión del catálogo: 353/353 productos encontrables
node test-catalog.local.mjs

# Regresión dirigida de búsqueda (sin servidor): diminutivos, contaminación, frustración
node test-search-cases.local.mjs

# Batería de queries contra el servidor local (puerto 3002)
node test-chat.local.mjs "me comi un pancito" "busco papitas" "quien eres tu"

# Búsqueda directa sin servidor (muestra los 5 matches de searchProducts)
node probe-scores.local.mjs "busco endenate" "sereal"
```

Casos de regresión clave que deben seguir funcionando:

- "me comi un pancito" → panes (no "gansito", "piña", "paño amarillo" ni "vienesas la española")
- "papita" → papas/pap (no panes)
- "paño" / "pano" → paño amarillo encontrable por su nombre
- "no me estas ayudando" → respuesta empática (sin re-buscar productos)
- "sereal" → cereales (ruido bajo "acondicionador sedal" tolerado en la lista)
- "busco endenate" → endulzantes (typo pesado con prefijo)
- "kiero un cafe" → cafés (k-ortografía)
- "quien eres tu" → sin productos (ruido "eres"~"cereales" bloqueado por umbral)

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
3. **Fuzzy match (60 pts)**: todas las palabras del query en el nombre (incluye bases de diminutivos: "pancito" matchea "pan" en "pan frica")
4. **Match por categoría (50 pts)**: query coincide con categoría
5. **Match por marca (45 pts)**: query coincide con marca
6. **Match parcial (30+ pts)**: al menos una palabra significativa coincide (incluye bases de diminutivos)
7. **Match por similitud ortográfica (hasta 25 pts)**: Levenshtein distance contra la palabra y sus bases de diminutivo

Si el query trae diminutivos, la rama fuzzy exige que la **base** (pancito → pan) matchee
como palabra; eso evita que "pancito"≈"gansito" rankee sobre "pan frica".

### Tolerancia ortográfica (`normalize.js` + `search.service.js`)

- **`levenshtein(a, b)`**: calcula distancia de edición entre dos palabras
- **`spellMatch(query, target)`**: retorna `true` si la distancia es ≤ 1/3 del largo
- **Match por substring**: compara el query contra partes de palabras más largas (ej: "cafee" encuentra "cafe" dentro de "nescafe")
- Ejemplos: "huebo"→"huevo", "arros"→"arroz", "choclate"→"chocolate"

### Escritura estilo WhatsApp

El chatbot está preparado para la ortografía informal de mensajes de texto:

- **Stopwords conversacionales**: "comi", "comia", "yame", "yapu", "xq", "tb", "kiero",
  "dame", "ensename", etc. se descartan antes de buscar productos, así frases como
  "me comi un pancito" buscan solo "pancito"
- **Verbos de intención de producto**: "busco", "quiero/kiero", "necesito" activan la
  búsqueda de productos con tolerancia amplia ("kiero un cafe" → cafés)
- **Diminutivos chilenos**: "cafecito"→"cafe", "papitas"→"papas", "galletitas"→"galleta",
  "pancito"→"pan" (base consonante final con y sin vocal restaurada)
- **Variantes vocálicas con umbral de frecuencia**: la restauración de vocal
  ("pan"→"pana"/"pano", "pap"→"papa"/"papo") solo se prueba si su familia es más
  frecuente en el catálogo que la base. Así "pancito" (pan=6 productos) no arrastra
  "paño amarillo" ni "vienesas la española" (pana/pano=2 productos), pero "papita"
  (papa/papas=4 > pap=3) sí encuentra las papas fritas
- **Match estricto para bases cortas de diminutivos** (≤4 letras): solo aceptan match
  exacto, plural o inclusión ("cafe" dentro de "nescafe"); evita falsos positivos como
  "pana"~"piña", "pana"~"panda" o "pan"~"pap"
- **Typo pesado con prefijo compartido**: palabras de 4+ letras que comparten las 3
  primeras y distan ≤ mitad del largo ("endenate"→"endulzante")
- **Segunda pasada en intención general**: si la búsqueda estricta (umbral 30) no
  encuentra nada, reintenta con umbral 20 para typos leves ("sereal"→"cereal", score 21);
  el ruido bajo sigue bloqueado ("eres"→"cereales" puntúa 10-15)

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
| Producto (stock) | tienen, hay disponible, stock, busco, quiero, kiero, necesito |
| Producto (sugerencia) | sugiereme, recomiendame, que compro, novedades |
| Producto (general) | catálogo, lista de productos |

### Respuestas directas sin IA

- **Saludos y despedidas**: respondidos directamente sin llamar a Gemini
- **Info del negocio**: horarios, ubicación, teléfono, WhatsApp, redes, delivery, pagos
- **Frustración del cliente**: "no me estás ayudando", "por qué me ofreces X si te
  pregunté por Y" → respuesta empática que pide el producto exacto; no re-busca
  (las palabras citadas en la queja contaminarían la búsqueda) ni depende de Gemini
- **Sugerencias**: "sugiereme algo" → 5 productos aleatorios con stock
- **Consultas genéricas**: si una palabra tiene 4+ resultados, pide aclaración con
  ejemplos reales del catálogo (con ñ y tildes: "paño", "española")

### Fallback

Si Gemini falla, se cuelga o no responde, el backend muestra los productos encontrados
localmente con precio y stock, o información de contacto del negocio. Las llamadas a
Gemini tienen timeout de 15s (reintento único de 10s): un cuelgue de la API nunca deja
al cliente esperando una respuesta que no llega.
