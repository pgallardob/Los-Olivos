1.	1. Objetivo general del proyecto
Construir un chatbot integrado en la landing page del almacén que pueda responder preguntas como:
o	"¿Cuánto cuesta el arroz?"
o	"¿Cuánto vale el aceite?"
o	"¿Tienen azúcar?"
o	"¿Tienen arroz disponible?"
o	"¿Cuánto cuesta el producto X?"
o	"¿Dónde están ubicados?"
o	"¿Cuál es el horario?"
o	"¿Atienden el sábado?"
o	"¿Cuál es su teléfono?"
o	"¿Qué productos tienen?"
o	"¿Tienen X producto?"
Y que pueda mantener una conversación natural.
La información del negocio será administrada de manera independiente de la IA.
La información de productos tendrá como fuente original el ERP/Supabase.
________________________________________
2. Arquitectura definitiva
La arquitectura que construiremos será:
                         ┌──────────────────────┐
                         │         ERP          │
                         │                      │
                         │     Productos        │
                         │     Precios          │
                         │     Stock            │
                         └──────────┬───────────┘
                                    │
                                    │ sincronización
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Node.js         │
                         │   proceso de sync    │
                         └──────────┬───────────┘
                                    │
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
             productos.json                   negocio.json
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Node.js         │
                         │       Express        │
                         │                      │
                         │  API del chatbot     │
                         └──────────┬───────────┘
                                    │
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
             búsqueda local                   IA Provider
             de productos                 ┌───────────────┐
                    │                      │    Gemini     │
                    │                      │       ↓       │
                    │                      │ OpenAI futuro │
                    │                      └───────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                              RESPUESTA
                                    │
                                    ▼
                              CHATBOT WEB
                                    │
                                    ▼
                             LANDING PAGE
La idea fundamental es que la IA no consulta Supabase.
La IA tampoco recibe todos los productos.
________________________________________
3. Principio fundamental: separar responsabilidades
Vamos a dividir el sistema en varias responsabilidades.
ERP/Supabase
Será responsable de:
o	Productos
o	Precios
o	Stock
o	Información comercial original
Proceso de sincronización
Será responsable de:
o	Conectarse a Supabase
o	Leer los datos
o	Transformarlos
o	Crear/actualizar productos.json
o	Mantener la información anterior si Supabase/ERP no está disponible
productos.json
Será el catálogo utilizado por el chatbot.
Contendrá una copia de la información necesaria.
negocio.json
Contendrá información que no depende del ERP:
o	Nombre
o	Dirección
o	Horarios
o	Teléfono
o	WhatsApp
o	Redes sociales
o	Preguntas frecuentes
o	Información general
Node.js/Express
Será el cerebro del sistema:
o	Recibir preguntas
o	Analizar la intención
o	Buscar productos
o	Obtener precio
o	Obtener stock
o	Obtener información del negocio
o	Preparar contexto para Gemini
o	Devolver respuesta al navegador
Gemini
Será responsable principalmente de:
o	Comprender lenguaje natural
o	Interpretar preguntas
o	Redactar respuestas
o	Mantener conversaciones naturales
o	Utilizar los datos que Node.js le proporcione
________________________________________
4. ERP como fuente original de información
Esto es importante:
ERP/Supabase
     ↓
FUENTE OFICIAL
El JSON no será la fuente original.
Será una copia/cache.
Por ejemplo:
Supabase:

Arroz 1kg
Precio: $1.590
Stock: 25
se sincroniza a:
productos.json:

Arroz 1kg
Precio: $1.590
Stock: 25
Si posteriormente modificas el precio en el ERP:
ERP
Arroz → $1.690
la siguiente sincronización actualizará:
productos.json
Arroz → $1.690
________________________________________
5. No crearemos otra base de datos
Esto queda establecido como requisito del proyecto.
No utilizaremos:
o	❌ MySQL adicional
o	❌ PostgreSQL adicional
o	❌ MongoDB
o	❌ Firebase
o	❌ Supabase adicional
o	❌ Vector database
El sistema utilizará:
Supabase existente
       +
productos.json
       +
negocio.json
Esto mantiene el proyecto pequeño y fácil de administrar.
________________________________________
6. Acceso del backend a Supabase
Tu ERP actualmente utiliza Supabase.
El nuevo backend también podrá conectarse al mismo proyecto de Supabase para realizar la sincronización.
Utilizaremos:
@supabase/supabase-js
El SDK oficial permite hacer consultas select, filtros y consultas específicas sobre tablas. S Supabase+1
La conexión quedará exclusivamente en el backend.
Nunca pondremos las credenciales sensibles de Supabase en el JavaScript de la landing.
________________________________________
7. Credenciales de Supabase
El backend tendrá variables de entorno:
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
Estas credenciales:
o	No estarán en Git
o	No estarán en el frontend
o	No estarán en HTML
o	No estarán en JavaScript público
o	No se enviarán al navegador
El .env estará incluido en .gitignore.
________________________________________
8. Proceso de sincronización
Este será uno de los componentes principales.
El proceso tendrá aproximadamente esta responsabilidad:
Node.js
   ↓
conectar con Supabase
   ↓
consultar productos
   ↓
obtener nombre
   ↓
obtener precio
   ↓
obtener stock
   ↓
transformar información
   ↓
validar información
   ↓
generar productos.json
________________________________________
9. Frecuencia de sincronización
Has definido:
una vez cada semana, lunes a viernes a las 18:00 hora de Chile
Aquí hay una pequeña precisión: lunes a viernes a las 18:00 significa cinco sincronizaciones semanales.
Por lo tanto, implementaremos:
Lunes     18:00
Martes    18:00
Miércoles 18:00
Jueves    18:00
Viernes   18:00
Hora local:
America/Santiago
No utilizaremos simplemente una hora UTC fija, porque Chile tiene cambios de horario.
El scheduler deberá trabajar explícitamente con la zona horaria de Chile.
________________________________________
10. ¿Por qué sincronizar de lunes a viernes?
Porque probablemente los precios y stock pueden cambiar durante la semana.
El flujo será:
18:00
  ↓
¿ERP disponible?
  │
  ├── Sí
  │    ↓
  │  consultar Supabase
  │    ↓
  │  validar datos
  │    ↓
  │  generar nuevo JSON
  │
  └── No
       ↓
    conservar JSON anterior
________________________________________
11. Si el ERP está apagado
Este requisito será obligatorio.
Supongamos:
Viernes 18:00
Node.js intenta conectarse:
Node.js
   ↓
Supabase
   ↓
❌ no disponible
NO hacemos esto:
productos.json → borrar
Ni:
productos.json → vacío
Ni:
productos.json → reemplazar por []
Haremos:
productos.json anterior
          ↓
       conservar
          ↓
     chatbot sigue
       funcionando
El sistema registrará que la sincronización falló.
________________________________________
12. Guardar información de sincronización
productos.json tendrá metadatos.
Por ejemplo:
{
  "metadata": {
    "ultima_actualizacion": "2026-08-19T18:00:00-04:00",
    "cantidad_productos": 1250,
    "fuente": "ERP_SUPABASE",
    "estado": "ok"
  },
  "productos": []
}
Si falla:
{
  "metadata": {
    "ultima_actualizacion": "2026-08-19T18:00:00-04:00",
    "ultima_sincronizacion_exitosa": "2026-08-18T18:00:00-04:00",
    "cantidad_productos": 1250,
    "fuente": "ERP_SUPABASE",
    "estado": "error"
  },
  "productos": []
}
Lo importante es que los productos anteriores permanecen intactos.
________________________________________
13. Protección contra corrupción del JSON
No queremos que una sincronización incompleta destruya el catálogo.
Por eso no haremos:
abrir productos.json
↓
borrar
↓
empezar a escribir
Si el proceso se cae a mitad de escritura, podríamos terminar con un archivo corrupto.
En su lugar:
Supabase
   ↓
datos completos
   ↓
validación
   ↓
productos.tmp.json
   ↓
validar JSON
   ↓
reemplazar productos.json
Así:
productos.json anterior
        ↓
        │
   sincronización
        │
        ▼
productos.tmp.json
        │
        ▼
      válido
        │
        ▼
productos.json nuevo
Si falla:
productos.json anterior
        ↓
       permanece
________________________________________
14. Copia de seguridad del JSON
También recomiendo mantener al menos una copia anterior:
data/
├── productos.json
├── productos.previous.json
└── negocio.json
De esta manera, si alguna vez una sincronización trae datos incorrectos, podemos recuperar la versión anterior.
Incluso podemos conservar:
backups/
├── productos-2026-08-17.json
├── productos-2026-08-18.json
└── productos-2026-08-19.json
Esto dependerá de cuánto espacio tengas disponible.
________________________________________
15. Importante: dónde se guardará el JSON
Aquí hay una cuestión técnica muy importante.
Si el backend corre en un servidor con almacenamiento persistente:
Node.js server
     ↓
disco persistente
     ↓
productos.json
perfecto.
Pero algunos servicios de hosting utilizan servidores efímeros. En esos casos, el archivo podría desaparecer cuando la aplicación se reinicia o se despliega.
Por eso, en la implementación tendremos que verificar que el hosting elegido tenga filesystem persistente.
No necesitamos una base de datos para esto, pero sí necesitamos un lugar persistente donde guardar los archivos.
Una alternativa, si el hosting no tiene disco persistente, sería utilizar almacenamiento de archivos/object storage, pero no agregaría eso hasta saber dónde vas a alojar Node.js.
________________________________________
16. Estructura del proyecto
La estructura inicial que recomiendo:
chatbot-almacen/
│
├── backend/
│   │
│   ├── src/
│   │   ├── server.js
│   │   │
│   │   ├── routes/
│   │   │   └── chat.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   └── chat.controller.js
│   │   │
│   │   ├── services/
│   │   │   ├── product.service.js
│   │   │   ├── business.service.js
│   │   │   ├── sync.service.js
│   │   │   └── ai/
│   │   │       ├── ai.service.js
│   │   │       ├── gemini.provider.js
│   │   │       └── openai.provider.js
│   │   │
│   │   ├── repositories/
│   │   │   ├── product.repository.js
│   │   │   └── business.repository.js
│   │   │
│   │   ├── utils/
│   │   │   ├── normalize.js
│   │   │   ├── logger.js
│   │   │   └── json-storage.js
│   │   │
│   │   └── config/
│   │       └── config.js
│   │
│   ├── data/
│   │   ├── productos.json
│   │   └── negocio.json
│   │
│   ├── backups/
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── frontend/
    ├── chat.js
    ├── chat.css
    └── ...
________________________________________
17. ¿Por qué separar services, repositories y providers?
Para que el proyecto no termine siendo un único server.js gigante.
Por ejemplo:
server.js
solo inicia Express.
Mientras que:
product.service.js
se ocupa de productos.
sync.service.js
se ocupa de sincronización.
gemini.provider.js
se ocupa de Gemini.
Esto será muy importante para poder cambiar Gemini por OpenAI posteriormente.
________________________________________
18. Arquitectura intercambiable de IA
Este es otro requisito importante.
No queremos construir:
chatbot → Gemini directamente
Queremos:
chatbot
   ↓
AI Service
   ↓
AI Provider
   ↓
Gemini
Y posteriormente:
chatbot
   ↓
AI Service
   ↓
AI Provider
   ↓
OpenAI
________________________________________
19. Interfaz conceptual del proveedor
Definiremos una interfaz común:
AIProvider
   │
   ├── generateResponse()
   ├── getModel()
   └── getProviderName()
Gemini implementará esa interfaz.
Posteriormente OpenAI implementará exactamente la misma.
Así el resto del backend no necesita saber si estamos usando Gemini u OpenAI.
________________________________________
20. Configuración del proveedor
Podremos tener:
AI_PROVIDER=gemini
Entonces:
AI_PROVIDER=gemini
        ↓
GeminiProvider
Posteriormente:
AI_PROVIDER=openai
y:
AI_PROVIDER=openai
        ↓
OpenAIProvider
El resto de la aplicación permanece igual.
________________________________________
21. Gemini
Para Gemini utilizaremos el SDK oficial actual:
@google/genai
Google recomienda este SDK para aplicaciones JavaScript/TypeScript. G Google AI for Developers
La clave estará en:
GEMINI_API_KEY=...
Nunca en el frontend.
La documentación oficial indica que la API necesita una clave para autenticar las solicitudes. G Google AI for Developers
________________________________________
22. Nivel gratuito de Gemini
La primera versión utilizará el nivel gratuito.
Google actualmente ofrece un nivel gratuito para determinados modelos, con tokens de entrada y salida sin costo, pero con límites de frecuencia/uso. G Google AI for Developers
Por eso implementaremos:
o	Control de errores
o	Rate limiting
o	Mensaje de fallback
o	No enviar información innecesaria
o	No enviar todos los productos
o	Control de longitud de conversaciones
o	Separación de datos y generación
Esto ayudará a mantener el consumo bajo.
________________________________________
23. Información del negocio
Crearemos:
data/negocio.json
Por ejemplo:
{
  "nombre": "Nombre del Almacén",
  "direccion": "Dirección",
  "telefono": "XXXXXXXXX",
  "whatsapp": "XXXXXXXXX",
  "horarios": {
    "lunes": "09:00 - 19:00",
    "martes": "09:00 - 19:00",
    "miercoles": "09:00 - 19:00",
    "jueves": "09:00 - 19:00",
    "viernes": "09:00 - 19:00",
    "sabado": "09:00 - 14:00",
    "domingo": "Cerrado"
  }
}
Posteriormente agregaremos los datos reales.
________________________________________
24. Información de productos
El archivo será algo parecido a:
{
  "metadata": {
    "ultima_actualizacion": "...",
    "cantidad_productos": 1000
  },
  "productos": [
    {
      "id": "123",
      "nombre": "Arroz 1 Kg",
      "precio": 1590,
      "stock": 25
    }
  ]
}
No necesariamente utilizaremos exactamente esos nombres; primero veremos cómo están estructuradas tus tablas de Supabase.
________________________________________
25. Sincronización ERP → JSON
El proceso será:
             ┌───────────────┐
             │    Supabase   │
             └───────┬───────┘
                     │
                     ▼
             sync.service.js
                     │
                     ▼
             product.repository
                     │
                     ▼
             obtener productos
                     │
                     ▼
                validar datos
                     │
                     ▼
              transformar datos
                     │
                     ▼
             productos.tmp.json
                     │
                     ▼
                validar JSON
                     │
                     ▼
             productos.json
________________________________________
26. Consulta de Supabase
La consulta será lo más específica posible.
Si solamente necesitamos:
id
nombre
precio
stock
no pediremos:
*
sino únicamente las columnas necesarias.
Supabase permite seleccionar columnas específicas mediante select(). S Supabase
Esto reduce:
o	Datos transferidos
o	Memoria
o	Tiempo
o	Posibles problemas
o	Información innecesaria almacenada
________________________________________
27. Si existen productos deshabilitados
Esto también deberá definirse.
Por ejemplo, si Supabase tiene:
activo = false
podemos excluirlos del JSON.
La regla sería:
ERP
 ↓
producto activo?
 │
 ├── Sí → JSON
 │
 └── No → no incluir
Pero esto dependerá de cómo esté diseñada tu tabla.
________________________________________
28. Stock
El stock sí se guardará en el JSON porque lo necesitas.
Por ejemplo:
{
  "nombre": "Arroz 1kg",
  "precio": 1590,
  "stock": 25
}
Sin embargo, no enviaremos todo el stock a Gemini.
________________________________________
29. Regla fundamental para productos
Supongamos que tienes:
5.000 productos
El usuario pregunta:
¿Cuánto cuesta el arroz?
No haremos:
5.000 productos
     ↓
   Gemini
Haremos:
Pregunta
   ↓
Node.js
   ↓
buscar "arroz"
   ↓
producto encontrado
   ↓
Arroz 1kg
$1.590
Stock 25
   ↓
Gemini
Gemini solamente recibe lo necesario.
________________________________________
30. Búsqueda local de productos
Crearemos un servicio:
product.service.js
Su trabajo será:
buscarProducto("arroz")
y devolver algo como:
{
  "id": "123",
  "nombre": "Arroz 1 Kg",
  "precio": 1590,
  "stock": 25
}
________________________________________
31. Normalización de búsqueda
El cliente podría escribir:
arroz
o:
Arroz
o:
ARROZ
o incluso:
arroz 1 kilo
Necesitamos normalizar.
Por ejemplo:
"ARROZ 1 KILO"
       ↓
"arroz 1 kilo"
También podemos manejar:
o	Mayúsculas/minúsculas
o	Acentos
o	Espacios
o	Variaciones comunes
o	"kg" / "kilo"
o	Errores simples de escritura
________________________________________
32. Preguntas de stock
Si el usuario pregunta:
¿Tienen arroz?
Node.js buscará:
Arroz
y verificará:
stock > 0
Entonces podrá proporcionar a Gemini:
Producto: Arroz 1kg
Precio: $1.590
Stock disponible: sí
Gemini genera la respuesta natural.
________________________________________
33. Si stock = 0
Node.js devolverá:
Producto: Arroz 1kg
Precio: $1.590
Stock disponible: no
Gemini podría responder:
En este momento no tenemos arroz de 1 kg disponible.
La IA no decidirá el stock.
Lo decidirá nuestro backend.
________________________________________
34. Si el producto no existe
Si el cliente pregunta:
¿Cuánto cuesta el alimento para dinosaurios?
y no existe:
buscar()
   ↓
null
No debemos permitir que Gemini invente un precio.
La información enviada a la IA será algo equivalente a:
No se encontró el producto solicitado.
No inventes precio ni disponibilidad.
Y Gemini deberá responder:
No encontré ese producto en nuestro catálogo. Si quieres, puedo ayudarte a buscar otro.
________________________________________
35. Esto evita alucinaciones
Esta será una regla crítica:
Gemini nunca inventa precios, stock, horarios, dirección o información comercial.
Para información factual del almacén:
Fuente real → backend
La IA solo:
interpreta → redacta
________________________________________
36. Flujo de una consulta de precio
Ejemplo:
Cliente:
¿Cuánto cuesta el arroz?
Paso 1
Frontend:
POST /api/chat
Paso 2
Express recibe:
{
  "message": "¿Cuánto cuesta el arroz?"
}
Paso 3
Backend analiza.
Paso 4
Busca en:
productos.json
Paso 5
Encuentra:
Arroz 1kg
$1.590
stock 25
Paso 6
Construye contexto pequeño.
Paso 7
Lo envía a Gemini.
Paso 8
Gemini redacta.
Paso 9
Node.js devuelve:
{
  "reply": "El arroz de 1 kg cuesta $1.590."
}
Paso 10
Frontend muestra la respuesta.
________________________________________
37. Flujo de una pregunta sobre horario
Cliente:
¿Atienden el sábado?
Node.js:
negocio.json
obtiene:
sábado: 09:00 - 14:00
Gemini recibe solamente esa información relevante.
Respuesta:
Sí 😊 El sábado atendemos de 09:00 a 14:00.
________________________________________
38. Flujo de una pregunta general
Cliente:
¿Qué productos venden?
Aquí podemos utilizar la IA para interpretar la intención.
Pero no enviaremos los 5.000 productos a Gemini.
Podemos definir respuestas controladas, categorías o una búsqueda limitada.
Posteriormente podremos mejorar esta parte si vemos que el catálogo lo necesita.
________________________________________
39. Endpoint principal
Nuestro backend tendrá inicialmente:
POST /api/chat
Recibirá:
{
  "message": "¿Cuánto cuesta el arroz?"
}
Y responderá:
{
  "reply": "El arroz de 1 kg cuesta $1.590."
}
________________________________________
40. Endpoint de salud
También tendremos:
GET /api/health
Para comprobar:
Backend funcionando
Por ejemplo:
{
  "status": "ok"
}
________________________________________
41. Endpoint de estado de sincronización
Podremos tener:
GET /api/sync/status
Para uso administrativo.
Por ejemplo:
{
  "status": "ok",
  "lastSuccessfulSync": "2026-08-19T18:00:00-04:00",
  "products": 1250
}
No necesariamente será público.
________________________________________
42. Scheduler
Implementaremos un proceso programado.
Conceptualmente:
Scheduler
    ↓
Lunes-Viernes
18:00 Chile
    ↓
syncProducts()
La sincronización también podrá ejecutarse manualmente durante desarrollo.
Por ejemplo:
npm run sync
Esto será extremadamente útil para probar.
________________________________________
43. Sincronización manual
Tendremos:
npm run sync
que hará:
Node.js
 ↓
Supabase
 ↓
productos
 ↓
JSON
Así no tendremos que esperar a las 18:00 para comprobar si funciona.
________________________________________
44. Primera sincronización
Antes de poner el chatbot en producción:
1. Conectar Supabase
2. Consultar productos
3. Crear productos.json
4. Validarlo
5. Revisar cantidad
6. Revisar algunos productos manualmente
7. Revisar precios
8. Revisar stock
9. Activar chatbot
________________________________________
45. Falla de sincronización
Si ocurre:
Supabase
   ↓
timeout
el proceso hará:
log error
   ↓
NO modificar productos.json
   ↓
registrar fecha del fallo
   ↓
continuar funcionando
________________________________________
46. Falla de Gemini
También debemos pensar en esto.
Si:
Gemini API
   ↓
❌ error
el backend no debe caerse.
Podremos devolver:
En este momento no puedo responder. Por favor intenta nuevamente en unos minutos.
El servidor continúa funcionando.
________________________________________
47. Falla del JSON
Si por alguna razón:
productos.json
está corrupto o no existe, el servidor deberá detectarlo.
No debe iniciar silenciosamente con información vacía.
Debe:
detectar error
↓
registrarlo
↓
avisar
Y podemos utilizar una copia anterior si existe.
________________________________________
48. Fallback del catálogo
Podemos implementar:
productos.json
      ↓
¿válido?
 │
 ├── Sí → usarlo
 │
 └── No
       ↓
productos.previous.json
       ↓
usar copia anterior
Esto aumenta mucho la robustez.
________________________________________
49. Historial de sincronizaciones
No necesitamos una base de datos para esto.
Podemos tener:
logs/
└── sync.log
Por ejemplo:
2026-08-17 18:00 - OK - 1248 productos
2026-08-18 18:00 - OK - 1252 productos
2026-08-19 18:00 - ERROR - Supabase unavailable
________________________________________
50. Logs del chatbot
También podremos registrar errores:
logs/
├── sync.log
├── chatbot.log
└── error.log
No recomiendo guardar automáticamente todas las conversaciones de clientes en archivos sin definir primero una política de privacidad.
Para la primera versión no necesitamos almacenar conversaciones.
________________________________________
51. No necesitamos base de datos para las conversaciones
Inicialmente:
Cliente
 ↓
Chat
 ↓
Backend
 ↓
Gemini
 ↓
Respuesta
Cuando se cierre la página:
conversación termina
No necesitamos persistirla.
Posteriormente, si quieres estadísticas o historial, podemos incorporar almacenamiento.
________________________________________
52. Seguridad del backend
Implementaremos como mínimo:
o	HTTPS en producción
o	API keys solamente en servidor
o	.env
o	.gitignore
o	CORS configurado
o	Rate limiting
o	Validación de requests
o	Límite de longitud de mensajes
o	Manejo de errores
o	No exponer credenciales
o	No exponer Supabase directamente al navegador
________________________________________
53. Rate limiting
Esto es especialmente importante porque Gemini tiene límites en su nivel gratuito.
Por ejemplo:
IP
 ↓
máximo X solicitudes/minuto
Así evitamos que alguien haga:
1000 requests
      ↓
Gemini
y consuma rápidamente el límite gratuito.
El valor exacto lo definiremos durante la implementación.
________________________________________
54. Protección contra abuso
También tendremos:
máximo de caracteres por pregunta
Por ejemplo, no tiene sentido permitir:
100.000 caracteres
en una pregunta.
Esto reduce costos y abuso.
________________________________________
55. Prompt del sistema
Crearemos un prompt centralizado.
No estará repartido por todo el código.
Por ejemplo conceptualmente:
Eres el asistente virtual del almacén.

Debes responder de manera amable, breve y clara.

Nunca inventes:
- precios
- productos
- stock
- horarios
- dirección
- teléfonos

Utiliza únicamente la información proporcionada por el backend.

Si no tienes información suficiente, dilo claramente.
________________________________________
56. Contexto dinámico
A ese prompt le agregaremos solamente la información necesaria.
Ejemplo:
Pregunta:
"¿Cuánto cuesta el arroz?"

Información encontrada:

Producto:
Arroz 1kg

Precio:
1590

Stock:
25
Gemini recibe:
INSTRUCCIONES
+
PREGUNTA
+
DATOS RELEVANTES
No recibe todo productos.json.
________________________________________
57. Separar instrucciones de datos
Esto es importante para seguridad.
La información del producto se tratará como datos, no como instrucciones.
Así evitamos que una cadena extraña dentro de un nombre de producto pueda intentar manipular al modelo.
________________________________________
58. Conversación
El chatbot tendrá contexto de conversación.
Por ejemplo:
Cliente:
¿Cuánto cuesta el arroz?

Bot:
$1.590.

Cliente:
¿Y el aceite?

Bot:
El aceite de 1 litro cuesta $2.490.
El backend tendrá que manejar el historial de manera controlada.
No enviaremos conversaciones infinitas.
________________________________________
59. No guardar historial permanentemente
Inicialmente el historial será temporal.
Mientras la conversación está abierta:
chat
 ↓
historial
 ↓
Gemini
Cuando termina:
historial
 ↓
descartado
Esto mantiene el sistema sencillo.
________________________________________
60. Frontend del chatbot
En la landing agregaremos:
                    ┌─────────────────────┐
                    │  🤖 Asistente       │
                    ├─────────────────────┤
                    │                     │
                    │ Hola 👋             │
                    │ ¿En qué puedo       │
                    │ ayudarte?           │
                    │                     │
                    │      ¿Cuánto cuesta │
                    │      el arroz?      │
                    │                     │
                    │ El arroz cuesta      │
                    │ $1.590.             │
                    │                     │
                    ├─────────────────────┤
                    │ Escribe aquí...  ➤  │
                    └─────────────────────┘
________________________________________
61. Funciones del frontend
El widget tendrá:
o	Botón flotante
o	Abrir/cerrar
o	Mensajes del usuario
o	Mensajes del bot
o	Scroll automático
o	Campo de texto
o	Botón enviar
o	Enter para enviar
o	Indicador de escritura
o	Manejo de errores
o	Diseño responsive
o	Compatible con móvil
o	Compatible con desktop
________________________________________
62. El frontend nunca hablará directamente con Gemini
Esto es fundamental:
❌ Landing → Gemini
Será:
✅ Landing
     ↓
Node.js / Express
     ↓
Gemini
Así la API key queda protegida.
________________________________________
63. La landing tampoco hablará directamente con Supabase
Será:
Landing
   ↓
Node.js
   ↓
productos.json
El navegador nunca necesita saber dónde está Supabase.
________________________________________
64. Ventaja principal de esta arquitectura
Durante el horario en que el ERP está apagado:
ERP
❌ OFF

Supabase
❌ no disponible

productos.json
✅ disponible

Node.js
✅ disponible

Gemini
✅ disponible

Chatbot
✅ funcionando
Esto cumple exactamente tu requisito.
________________________________________
65. Flujo completo de producción
El sistema completo funcionará así:
                 CLIENTE
                    │
                    ▼
               LANDING PAGE
                    │
                    ▼
                CHAT WIDGET
                    │
                    ▼
              POST /api/chat
                    │
                    ▼
              NODE.JS / EXPRESS
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
    negocio.json         productos.json
          │                   │
          │                   ▼
          │              buscar producto
          │                   │
          │            ┌──────┴──────┐
          │            │             │
          │          precio        stock
          │            │             │
          └────────────┴──────┬──────┘
                              │
                              ▼
                        CONTEXTO MÍNIMO
                              │
                              ▼
                         AI SERVICE
                              │
                              ▼
                     GEMINI PROVIDER
                              │
                              ▼
                           GEMINI
                              │
                              ▼
                         RESPUESTA
                              │
                              ▼
                         NODE.JS
                              │
                              ▼
                           CHAT
________________________________________
66. Flujo independiente de sincronización
En paralelo:
              SCHEDULER
                  │
       L-V 18:00 Chile
                  │
                  ▼
              Node.js
                  │
                  ▼
              Supabase
                  │
            ┌─────┴─────┐
            │           │
           OK          ERROR
            │           │
            ▼           ▼
      obtener datos   conservar
            │         JSON anterior
            ▼
      validar datos
            │
            ▼
    productos.tmp.json
            │
            ▼
      validación OK
            │
            ▼
      productos.json
Los dos sistemas son independientes.
________________________________________
67. Qué pasa si el servidor se reinicia
Al iniciar:
Node.js
   ↓
leer productos.json
   ↓
validarlo
   ↓
cargar catálogo en memoria
   ↓
servidor listo
No necesitamos consultar Supabase para arrancar.
Por lo tanto:
ERP apagado
+
servidor reiniciado
=
chatbot funciona
siempre que el JSON persistente esté disponible.
________________________________________
68. Cargar el catálogo en memoria
Para un almacén pequeño esto puede ser muy conveniente.
Al iniciar:
productos.json
     ↓
RAM
Entonces las búsquedas son extremadamente rápidas.
No necesitamos leer el archivo en cada pregunta.
________________________________________
69. Actualización después de sincronización
Cuando llegue una nueva versión:
productos.json
     ↓
validar
     ↓
reemplazar
     ↓
recargar catálogo en memoria
Así el chatbot comienza a utilizar los nuevos precios sin reiniciar el servidor.
________________________________________
70. Evitar enviar todo el catálogo a Gemini
Este requisito será parte de la arquitectura, no simplemente una recomendación.
productos.json
      │
      ▼
product.service
      │
      ▼
búsqueda
      │
      ▼
producto(s) relevante(s)
      │
      ▼
AI Service
      │
      ▼
Gemini
Nunca:
productos.json
      ↓
Gemini
________________________________________
71. Consultas con varios productos
Si alguien pregunta:
¿Cuánto cuestan el arroz, el aceite y el azúcar?
Node.js buscará:
arroz
aceite
azúcar
y enviará únicamente:
Arroz → $1.590
Aceite → $2.490
Azúcar → $1.290
No los otros 1.247 productos.
________________________________________
72. Preguntas que no requieren IA
Incluso podemos hacer que algunas respuestas ni siquiera llamen a Gemini.
Por ejemplo:
"¿Cuál es la dirección?"
Node.js puede devolver directamente:
Estamos ubicados en...
Lo mismo para:
o	Horario
o	Teléfono
o	WhatsApp
o	Dirección
Esto reduce todavía más el consumo de Gemini.
________________________________________
73. Arquitectura híbrida
Por lo tanto, tendremos:
                    PREGUNTA
                       │
                       ▼
                  Node.js
                       │
           ┌───────────┼───────────┐
           │           │           │
           ▼           ▼           ▼
        negocio     producto    pregunta
         simple     exacto      general
           │           │           │
           ▼           ▼           ▼
        respuesta   respuesta    Gemini
        directa     + Gemini        │
                                   ▼
                                respuesta
No todo tiene que pasar por IA.
________________________________________
74. Beneficio económico
Esto es especialmente importante con el nivel gratuito de Gemini.
Si 100 personas preguntan:
¿Cuál es la dirección?
no tiene sentido hacer 100 llamadas a Gemini.
Podemos resolverlo desde:
negocio.json
De la misma forma, una consulta exacta de precio puede obtener los datos desde el JSON y utilizar la IA solo si necesitamos una respuesta conversacional.
________________________________________
75. Posible evolución futura
La arquitectura permitirá agregar:
WhatsApp
     ↓
Node.js
     ↓
mismo Chat Service
o:
Instagram
     ↓
Node.js
     ↓
mismo Chat Service
o:
Landing
     ↓
Node.js
     ↓
mismo Chat Service
Todos podrían utilizar la misma lógica.
________________________________________
76. Posible evolución a OpenAI
Posteriormente:
AI_PROVIDER=gemini
se puede cambiar a:
AI_PROVIDER=openai
y configurar:
OPENAI_API_KEY=...
El resto permanece:
Landing
 ↓
Express
 ↓
AI Service
 ↓
OpenAI Provider
 ↓
OpenAI
No tendremos que cambiar:
o	frontend
o	productos
o	sincronización
o	JSON
o	búsqueda
o	ERP
o	lógica de stock
________________________________________
77. Lo que NO vamos a construir inicialmente
Para mantener el proyecto pequeño y razonable, inicialmente no agregaremos:
o	❌ Base de datos nueva
o	❌ RAG
o	❌ Vector database
o	❌ Embeddings
o	❌ Panel administrativo
o	❌ Sistema de usuarios
o	❌ Login
o	❌ Historial permanente
o	❌ WhatsApp
o	❌ CRM
o	❌ Sistema de pedidos
o	❌ Fine-tuning
o	❌ Agentes complejos
Todo eso puede agregarse posteriormente.
________________________________________
78. Lo que SÍ estará en la primera versión
Backend
o	Node.js
o	Express
o	@google/genai
o	@supabase/supabase-js
o	Variables de entorno
o	Scheduler
o	Rate limiting
o	CORS
o	Logs
o	Manejo de errores
Datos
o	productos.json
o	negocio.json
o	Backup del catálogo
o	Metadatos de sincronización
Sincronización
o	Supabase → Node.js
o	Productos
o	Precio
o	Stock
o	Lunes-viernes 18:00 Chile
o	Ejecución manual
o	Manejo de ERP apagado
o	Conservación del JSON anterior
o	Escritura atómica
IA
o	Gemini
o	Arquitectura intercambiable
o	Prompt centralizado
o	Contexto mínimo
o	Protección contra información inventada
Frontend
o	Widget
o	Chat
o	Responsive
o	Loading
o	Errores
o	Integración con /api/chat
________________________________________
79. Fases de desarrollo
Ahora podemos convertir todo lo anterior en un proyecto ejecutable.
Fase 1 — Levantamiento técnico del ERP
Primero necesitaremos conocer:
153.	Nombre de la tabla de productos.
154.	Columnas.
155.	Columna del nombre.
156.	Columna del precio.
157.	Columna del stock.
158.	Columna que identifica el producto.
159.	Cómo se identifica un producto activo/inactivo.
160.	Si existen categorías.
161.	Si existen variantes.
162.	Si existen productos duplicados.
163.	Tipo de dato del precio.
164.	Tipo de dato del stock.
165.	Cantidad aproximada de productos.
Esta fase es crítica antes de escribir el sincronizador.
________________________________________
80. Fase 2 — Crear proyecto Node.js
Crear:
backend/
Inicializar:
package.json
Instalar dependencias necesarias.
Entre ellas estarán:
express
@google/genai
@supabase/supabase-js
dotenv
cors
y las herramientas necesarias para:
o	scheduler
o	rate limiting
o	validación
o	logging
Las versiones exactas las definiremos al momento de implementar para utilizar versiones actuales y compatibles.
________________________________________
81. Fase 3 — Configuración
Crear:
.env
con:
PORT=3000

SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

GEMINI_API_KEY=...

AI_PROVIDER=gemini

TZ=America/Santiago
Y:
.env.example
sin claves reales.
________________________________________
82. Fase 4 — Conexión con Supabase
Construiremos:
product.repository.js
que será el único componente responsable de consultar Supabase.
Conceptualmente:
product.repository
        ↓
Supabase
        ↓
productos
Así no tendremos consultas a Supabase repartidas por todo el proyecto.
________________________________________
83. Fase 5 — Crear sincronizador
Construiremos:
sync.service.js
Responsabilidades:
170.	Conectar al repositorio.
171.	Obtener productos.
172.	Validar respuesta.
173.	Transformar campos.
174.	Crear metadata.
175.	Generar archivo temporal.
176.	Validar JSON.
177.	Crear backup.
178.	Reemplazar archivo.
179.	Recargar catálogo.
180.	Registrar resultado.
________________________________________
84. Fase 6 — Crear almacenamiento JSON
Construiremos:
json-storage.js
para manejar:
leer
guardar
validar
backup
reemplazar
Así no mezclamos lógica de archivos con lógica de negocio.
________________________________________
85. Fase 7 — Crear búsqueda de productos
Construiremos:
product.service.js
que manejará:
o	búsqueda
o	normalización
o	coincidencias
o	precio
o	stock
o	productos no encontrados
________________________________________
86. Fase 8 — Información del negocio
Crear:
negocio.json
y:
business.service.js
para obtener:
o	dirección
o	horario
o	teléfono
o	WhatsApp
o	información general
________________________________________
87. Fase 9 — Crear abstracción de IA
Crear:
ai/
├── ai.service.js
├── gemini.provider.js
└── openai.provider.js
Inicialmente:
GeminiProvider
será el único activo.
OpenAIProvider podrá quedar preparado para una segunda etapa, o incluso dejarse como estructura inicialmente sin implementación completa.
________________________________________
88. Fase 10 — Prompt
Crear un prompt central.
Tendrá reglas como:
- Eres el asistente del almacén.
- Sé amable.
- Sé breve.
- No inventes información.
- No inventes precios.
- No inventes stock.
- No inventes horarios.
- Usa exclusivamente los datos proporcionados.
- Si no sabes algo, dilo.
Luego agregaremos instrucciones específicas.
________________________________________
89. Fase 11 — API del chatbot
Crear:
POST /api/chat
Flujo:
request
 ↓
validación
 ↓
detectar intención
 ↓
buscar información
 ↓
construir contexto
 ↓
AI Service
 ↓
Gemini
 ↓
respuesta
________________________________________
90. Fase 12 — Seguridad
Agregar:
CORS
Rate limit
Input validation
Límites de tamaño
Manejo de errores
API keys protegidas
________________________________________
91. Fase 13 — Scheduler
Configurar:
Lunes 18:00
Martes 18:00
Miércoles 18:00
Jueves 18:00
Viernes 18:00
con:
America/Santiago
________________________________________
92. Fase 14 — Frontend
Integrar:
chat.js
chat.css
en tu landing.
El frontend solamente conocerá:
/api/chat
No conocerá:
o	Gemini API key
o	Supabase key
o	Supabase URL privada
o	ERP
o	lógica interna
________________________________________
93. Fase 15 — Pruebas
Probaremos al menos:
Productos
¿Cuánto cuesta el arroz?
¿Tienen arroz?
¿Hay aceite?
¿Cuánto cuesta X?
Variaciones
ARROZ
arroz
Arroz
arroz 1 kilo
Información general
¿Dónde están?
¿Cuál es el horario?
¿Atienden el sábado?
Errores
Producto inexistente
Pregunta absurda
Mensaje vacío
Mensaje demasiado largo
________________________________________
94. Pruebas de ERP apagado
Esta prueba será obligatoria.
Primero:
ERP disponible
↓
sincronización
↓
productos.json correcto
Después:
ERP apagado
y ejecutamos:
npm run sync
Debe ocurrir:
❌ sincronización
✅ productos.json anterior
Después:
cliente pregunta:
¿Cuánto cuesta el arroz?
Debe responder correctamente utilizando el JSON anterior.
________________________________________
95. Prueba de recuperación
Luego encendemos nuevamente el ERP:
ERP
 ↓
ON
ejecutamos:
npm run sync
y verificamos:
nuevo precio
 ↓
productos.json actualizado
 ↓
chatbot utiliza nuevo precio
________________________________________
96. Prueba de Gemini apagado
Simularemos:
Gemini
 ↓
❌ error
El backend no debe caerse.
Debe devolver una respuesta controlada.
________________________________________
97. Prueba de JSON corrupto
Simularemos:
productos.json
 ↓
corrupto
El sistema debe:
detectar
 ↓
buscar backup
 ↓
utilizar backup
si existe.
________________________________________
98. Prueba de seguridad
Verificaremos que desde el navegador no pueda obtenerse:
GEMINI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
También verificaremos que nadie pueda llamar libremente a Supabase desde el frontend para obtener el catálogo completo.
________________________________________
99. Prueba de carga básica
Antes de publicar:
varios usuarios
      ↓
chatbot
para verificar:
o	memoria
o	tiempos de respuesta
o	rate limiting
o	errores
o	estabilidad
No necesitamos una infraestructura enorme para el almacén.
________________________________________
100. Publicación
Finalmente:
Landing
   ↓
hosting actual

Backend Node.js
   ↓
hosting compatible

productos.json
   ↓
almacenamiento persistente

Gemini
   ↓
API gratuita
Aquí elegiremos el hosting del backend teniendo muy presente el requisito del JSON persistente.
________________________________________
101. Punto importante sobre el almacenamiento persistente
Este será uno de los primeros puntos que comprobaremos antes de producción.
La aplicación necesita que:
productos.json
sobreviva a:
o	reinicios
o	despliegues
o	actualizaciones
o	crashes
Si el hosting elimina archivos locales al reiniciar, no usaremos ese filesystem como almacenamiento definitivo.
No significa que necesitemos una base de datos: podemos utilizar almacenamiento persistente de archivos si fuera necesario.
________________________________________
102. Resultado final esperado
Al terminar tendremos:
                         ERP
                          │
                          │
                          ▼
                       Supabase
                          │
                          │
                L-V 18:00 Chile
                          │
                          ▼
                    Node.js Sync
                          │
                          ▼
                  productos.json
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
       precio / stock              búsqueda
             │                         │
             └────────────┬────────────┘
                          │
                          ▼
                    AI Service
                          │
                          ▼
                     Gemini API
                          │
                          ▼
                     Express
                          │
                          ▼
                     Chat API
                          │
                          ▼
                    Landing Page
Y el comportamiento será:
ERP encendido
ERP → sincroniza → JSON → chatbot
ERP apagado
ERP ❌
JSON ✅
chatbot ✅
Gemini funcionando
JSON → Gemini → respuesta
Gemini temporalmente caído
Backend → fallback/error controlado
Cambio futuro a OpenAI
Gemini Provider
       ↓
cambiar configuración
       ↓
OpenAI Provider
sin rehacer el chatbot.
________________________________________
103. Orden exacto en que recomiendo que lo construyamos
No empezaría todavía escribiendo todo el código de una vez. El orden correcto será:
1. Analizar estructura real de Supabase
↓
2. Definir exactamente qué productos/precios/stock necesitamos
↓
3. Crear proyecto Node.js/Express
↓
4. Configurar variables de entorno
↓
5. Conectar Node.js → Supabase
↓
6. Crear consulta de productos
↓
7. Crear sincronizador
↓
8. Crear productos.json
↓
9. Implementar backups y escritura segura
↓
10. Implementar scheduler L-V 18:00 Chile
↓
11. Implementar negocio.json
↓
12. Implementar búsqueda local de productos
↓
13. Implementar consulta de stock
↓
14. Implementar abstracción AIProvider
↓
15. Implementar Gemini
↓
16. Crear prompt
↓
17. Crear /api/chat
↓
18. Crear frontend del chatbot
↓
19. Integrarlo en tu landing
↓
20. Probar ERP apagado
↓
21. Probar Gemini apagado
↓
22. Probar fallos de JSON
↓
23. Seguridad
↓
24. Hosting
↓
25. Producción
________________________________________
104. Primer paso que necesitamos hacer ahora
No necesito que modifiques tu ERP.
Antes de escribir el sincronizador, necesito conocer la estructura real de Supabase.
En concreto, necesito que me entregues:
1. Nombre de la tabla de productos

2. Nombre de la columna ID

3. Nombre de la columna del nombre del producto

4. Nombre de la columna del precio

5. Nombre de la columna del stock

6. Si existe una columna para saber si el producto está activo

7. Si existen categorías, dime el nombre de esa columna

8. Aproximadamente cuántos productos tienes

9. Si precio y stock son números o texto

10. Si tienes variantes de un mismo producto
No me envíes claves, contraseñas, service_role_key ni ningún secreto de Supabase.
Con solamente la estructura de la tabla podemos empezar a construir la primera pieza real: Node.js → Supabase → productos.json, incluyendo validación, backups, conservación del JSON cuando el ERP esté apagado y la sincronización automática de lunes a viernes a las 18:00 de Chile.
A partir de ahí iremos construyendo el proyecto por fases, sin saltarnos componentes. SSupabase+1
Plan de trabajo — Chatbot IA para almacén con Gemini, Node.js y sincronización ERP

Plan de trabajo — Chatbot IA para almacén con Gemini, Node.js y sincronización ERP
Objetivo
Construir un chatbot IA integrado en la landing page del almacén utilizando Node.js/Express y Gemini API, manteniendo el ERP/Supabase como fuente oficial de productos, precios y stock.
El chatbot utilizará copias persistentes en JSON para funcionar independientemente del estado del ERP.
Arquitectura
ERP/Supabase → proceso de sincronización Node.js → productos.json → búsqueda local → AI Service → Gemini/OpenAI → Express → chatbot de la landing.
Información fija del negocio → negocio.json.
Requisitos principales
o	Node.js + Express.
o	Gemini API como proveedor inicial.
o	Arquitectura de proveedor de IA intercambiable.
o	Supabase existente como fuente oficial.
o	Sin nueva base de datos.
o	productos.json como copia local persistente.
o	negocio.json para información general.
o	Sincronización lunes a viernes a las 18:00, zona America/Santiago.
o	Si ERP/Supabase no está disponible, conservar la última copia válida.
o	Escritura atómica del JSON.
o	Backup de la copia anterior.
o	Consulta local de productos.
o	No enviar todo el catálogo a Gemini.
o	Enviar solamente los productos relevantes a la IA.
o	Consultar precio y stock desde el catálogo local.
o	API key de Gemini únicamente en backend.
o	Rate limiting, validación y manejo de errores.
o	Frontend desacoplado del proveedor de IA.
Fases
224.	Analizar estructura real de Supabase.
225.	Crear proyecto Node.js/Express.
226.	Configurar variables de entorno.
227.	Conectar backend con Supabase.
228.	Implementar repositorio de productos.
229.	Implementar sincronización ERP → JSON.
230.	Implementar validación y backups.
231.	Implementar scheduler L-V 18:00 Chile.
232.	Crear negocio.json.
233.	Implementar búsqueda local.
234.	Implementar lógica de precio y stock.
235.	Crear abstracción de proveedor de IA.
236.	Implementar Gemini.
237.	Crear prompt y reglas anti-invención.
238.	Crear /api/chat.
239.	Crear widget frontend.
240.	Integrar widget en la landing.
241.	Probar funcionamiento con ERP encendido.
242.	Probar funcionamiento con ERP apagado.
243.	Probar fallos de Gemini.
244.	Probar recuperación de JSON.
245.	Implementar seguridad.
246.	Elegir hosting con almacenamiento persistente.
247.	Realizar pruebas finales.
248.	Publicar en producción.
Regla de funcionamiento
El ERP será la fuente original.
El JSON será una copia/cache persistente.
La IA no tendrá acceso directo al ERP.
La IA no recibirá todo el catálogo.
Node.js determinará qué información es relevante y entregará a la IA únicamente el contexto necesario.
Si el ERP está apagado, el chatbot seguirá utilizando la última copia válida.
Si Gemini falla, el backend continuará funcionando y devolverá un error controlado.
Si posteriormente se cambia Gemini por OpenAI, solamente deberá cambiarse el proveedor de IA manteniendo la misma arquitectura y lógica de negocio.
:::{"fallbackMarkdown":"","reference":{"matched_text":" ","prefix":null,"start_idx":50054,"end_idx":50054,"safe_urls":[],"refs":[],"alt":"","prompt_text":null,"type":"sources_footnote","sources":[{"title":"Gemini API libraries  |  Google AI for Developers","url":"https://ai.google.dev/gemini-api/docs/libraries?utm_source=chatgpt.com","attribution":"Google AI for Developers"},{"title":"JavaScript: select | Supabase Docs","url":"https://supabase.com/docs/reference/javascript/select?utm_source=chatgpt.com","attribution":"Supabase"}],"has_images":false},"showLoginRequiredCard":false}
ChatGPT es una IA y puede equivocarse.

