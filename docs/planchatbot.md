Proyecto: Chatbot IA para landing page de almacén

Quiero desarrollar un chatbot con IA para la landing page de un almacén.

Quiero que trabajes como arquitecto de software y desarrollador senior, pero que implementes el proyecto de forma incremental, segura y verificable.

1. Arquitectura general

La arquitectura objetivo es:

                         ┌──────────────┐
                         │     ERP      │
                         │              │
                         │ Productos    │
                         │ Precios      │
                         │ Stock        │
                         └──────┬───────┘
                                │
                         sincronización
                                │
                                ▼
                     ┌────────────────────┐
                     │     Node.js        │
                     │  proceso de sync   │
                     └─────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             productos.json         negocio.json
                    │                     │
                    └──────────┬──────────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │ Node.js/Express  │
                     │   Chat API       │
                     └─────────┬────────┘
                               │
                               ▼
                         AI Provider
                               │
                    ┌──────────┴──────────┐
                    │                     │
                  Gemini                OpenAI
                 inicial                futuro
                    │
                    ▼
                 respuesta
                    │
                    ▼
                CHATBOT WEB
                    │
                    ▼
               LANDING PAGE

2. Tecnologías

Utilizar:

Node.js
Express
JavaScript
Supabase
@supabase/supabase-js
Gemini API mediante el SDK oficial actual de Google
@google/genai
HTML/CSS/JavaScript para el frontend
variables de entorno mediante .env

El proveedor inicial de IA será Gemini utilizando el nivel gratuito disponible.

La arquitectura debe permitir sustituir Gemini posteriormente por OpenAI sin modificar la lógica principal del chatbot.

3. Proveedor de IA intercambiable

NO acoples toda la aplicación directamente a Gemini.

Crear una abstracción equivalente conceptualmente a:

AIService
    ↓
AIProvider
    ├── GeminiProvider
    └── OpenAIProvider (futuro)


La aplicación deberá comunicarse con AIService, no directamente con Gemini.

La selección del proveedor deberá poder hacerse mediante configuración, por ejemplo:

AI_PROVIDER=gemini


Posteriormente debería ser posible utilizar:

AI_PROVIDER=openai


sin modificar la lógica del chatbot.

4. ERP

El ERP ya existe y fue desarrollado con:

HTML
JavaScript
Node.js
Supabase

El ERP NO tiene una API propia.

Sin embargo, utiliza directamente una base de datos Supabase.

El chatbot utilizará Supabase únicamente durante el proceso de sincronización.

NO modificar el ERP.

NO crear una nueva base de datos.

NO hacer que el chatbot dependa de que el ERP esté encendido.

Supabase/ERP es la fuente original de:

productos
precios
stock
5. Sistema de copia local

Crear un proceso Node.js que haga:

Node.js
   ↓
consulta Supabase
   ↓
obtiene productos
   ↓
obtiene nombre
   ↓
obtiene precio
   ↓
obtiene stock
   ↓
valida datos
   ↓
genera productos.json


El archivo productos.json será una copia local persistente de la información del ERP.

El hosting será administrable.cl y dispone de filesystem persistente.

Por lo tanto, podemos utilizar almacenamiento persistente en filesystem para los archivos JSON.

6. Sincronización

La sincronización deberá ejecutarse:

lunes a las 18:00
martes a las 18:00
miércoles a las 18:00
jueves a las 18:00
viernes a las 18:00

Utilizar explícitamente la zona horaria:

America/Santiago


No utilizar una hora UTC fija sin considerar la zona horaria de Chile.

También debe existir una forma de ejecutar la sincronización manualmente durante desarrollo, por ejemplo:

npm run sync

7. ERP apagado

Este requisito es obligatorio.

Si la sincronización intenta conectarse a Supabase y no está disponible:

Supabase/ERP
     ↓
    ERROR


NO borrar productos.json.

NO reemplazarlo por un archivo vacío.

NO eliminar la información anterior.

El sistema deberá:

registrar el error;
conservar intacto el último productos.json válido;
continuar permitiendo que el chatbot funcione;
utilizar la última información disponible.

El chatbot debe poder funcionar aunque el ERP esté completamente apagado.

8. Escritura segura del JSON

No escribir directamente sobre productos.json.

Utilizar un proceso seguro:

Supabase
   ↓
datos completos
   ↓
validación
   ↓
productos.tmp.json
   ↓
validación del JSON
   ↓
backup de versión anterior
   ↓
reemplazo atómico
   ↓
productos.json


Si cualquier paso falla, mantener la versión anterior.

Nunca dejar el catálogo en estado vacío o parcialmente escrito.

9. Backup

Mantener al menos una copia anterior del catálogo.

Por ejemplo:

data/
    productos.json
    productos.previous.json
    negocio.json


La implementación puede utilizar una estructura mejor si existe una razón técnica.

10. Metadata

productos.json deberá incluir metadata suficiente para saber:

fecha de última sincronización exitosa;
fecha del intento más reciente;
cantidad de productos;
estado de la sincronización;
origen de los datos.

No inventar la estructura exacta de las tablas de Supabase. Primero inspeccionar el proyecto y determinar la estructura real.

11. negocio.json

Crear un archivo separado:

data/negocio.json


para información relativamente estática:

nombre del almacén;
dirección;
horarios;
teléfono;
WhatsApp;
información general;
preguntas frecuentes si corresponde.

No almacenar esta información en la base de datos del ERP salvo que exista una razón concreta.

12. Productos

El catálogo local deberá contener como mínimo:

ID del producto;
nombre;
precio;
stock.

La estructura exacta dependerá de las tablas reales de Supabase.

Antes de implementar el sincronizador, inspeccionar el proyecto y determinar:

nombre real de la tabla;
nombre real de las columnas;
tipo de cada columna;
campo de identificación;
campo de nombre;
campo de precio;
campo de stock;
campo de producto activo/inactivo, si existe.

NO inventar estos nombres.

13. Regla crítica sobre la IA

NO enviar todo productos.json a Gemini.

Si existen 1.000, 5.000 o más productos, nunca enviar el catálogo completo al modelo para responder una pregunta simple.

Ejemplo:

Usuario:

¿Cuánto cuesta el arroz?


El flujo debe ser:

Pregunta
   ↓
Node.js
   ↓
buscar "arroz" en catálogo local
   ↓
encontrar producto
   ↓
obtener precio y stock
   ↓
enviar solamente información relevante a AIService
   ↓
Gemini


Gemini solamente recibe el contexto necesario.

14. Precios

El precio siempre debe provenir del catálogo local sincronizado desde Supabase.

Gemini NO debe inventar precios.

Si el producto no existe en el catálogo, Gemini debe indicarlo.

Nunca proporcionar un precio inventado.

15. Stock

El stock siempre debe provenir del catálogo local.

Gemini NO debe decidir si un producto está disponible.

Node.js debe determinarlo.

Ejemplo:

stock > 0 → disponible
stock = 0 → no disponible


La regla exacta deberá adaptarse a la estructura real del ERP si existe alguna lógica especial de stock.

16. Preguntas generales

Para preguntas como:

¿Dónde están?
¿Cuál es el horario?
¿Atienden el sábado?
¿Cuál es el teléfono?


utilizar negocio.json.

No es necesario llamar a Gemini para todas las preguntas sencillas.

Cuando sea posible, resolver preguntas simples directamente desde los datos locales.

Gemini debe utilizarse cuando aporte valor en la interpretación o generación de una respuesta conversacional.

17. Anti-alucinación

El prompt del modelo debe establecer claramente:

no inventar precios;
no inventar stock;
no inventar productos;
no inventar horarios;
no inventar dirección;
no inventar teléfonos;
utilizar exclusivamente la información proporcionada por el backend;
reconocer cuando no existe información suficiente.

La IA debe actuar principalmente como intérprete y generador de lenguaje natural.

La lógica factual del negocio debe permanecer en Node.js.

18. API del chatbot

Crear inicialmente:

POST /api/chat


Entrada conceptual:

{
  "message": "¿Cuánto cuesta el arroz?"
}


Salida conceptual:

{
  "reply": "El arroz de 1 kg cuesta $1.590."
}


También crear:

GET /api/health


para verificar que el backend está funcionando.

Crear un endpoint de estado de sincronización solamente si resulta útil para administración y seguridad.

19. Frontend

Crear un widget de chat integrado en la landing.

Debe incluir:

botón flotante;
abrir/cerrar;
historial temporal de conversación;
mensajes del usuario;
mensajes del asistente;
input;
botón enviar;
Enter para enviar;
indicador de escritura;
scroll automático;
responsive;
funcionamiento móvil;
manejo de errores.

El frontend solamente debe comunicarse con:

/api/chat


Nunca directamente con Gemini.

Nunca directamente con Supabase usando credenciales privadas.

20. Seguridad

Implementar como mínimo:

.env;
.env.example;
.gitignore;
CORS correctamente configurado;
rate limiting;
validación del input;
límite de longitud de mensajes;
manejo seguro de errores;
API keys exclusivamente en backend;
no exponer credenciales de Supabase;
no exponer credenciales de Gemini.

No devolver stack traces ni secretos al navegador.

21. Logs

Implementar logging suficiente para diagnosticar:

sincronizaciones exitosas;
sincronizaciones fallidas;
errores de Supabase;
errores de Gemini;
errores del servidor;
cantidad de productos sincronizados.

No almacenar innecesariamente conversaciones de clientes.

No crear persistencia de conversaciones en esta primera versión.

22. Estructura del proyecto

Proponer una estructura limpia y mantenible.

Como referencia:

backend/
├── src/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   │   ├── product.service.js
│   │   ├── business.service.js
│   │   ├── sync.service.js
│   │   └── ai/
│   │       ├── ai.service.js
│   │       ├── gemini.provider.js
│   │       └── openai.provider.js
│   ├── repositories/
│   ├── utils/
│   └── config/
├── data/
│   ├── productos.json
│   └── negocio.json
├── backups/
├── logs/
├── .env
├── .env.example
├── .gitignore
└── package.json


Puedes modificar esta estructura si existe una mejor alternativa, pero explica la razón antes de hacer cambios estructurales importantes.

23. Desarrollo incremental

NO implementes todo el proyecto de una sola vez.

Trabaja por fases.

Antes de comenzar a escribir código:

inspecciona el proyecto existente;
identifica qué archivos ya existen;
identifica si ya existe un backend Node.js;
identifica cómo está organizada la landing;
identifica la estructura de Supabase utilizada por el ERP;
identifica posibles conflictos con la arquitectura propuesta;
presenta un plan técnico por fases.

Después implementa solamente la primera fase.

No avances automáticamente a todas las fases.

Después de cada fase:

ejecuta las pruebas correspondientes;
verifica errores;
corrige problemas;
documenta lo realizado;
indica qué queda pendiente;
espera para continuar si la siguiente fase requiere decisiones del usuario.
24. Regla importante: no inventar información

Si no conoces:

nombres de tablas;
columnas;
rutas;
estructura existente;
comandos;
configuración del hosting;
variables;
comportamiento del ERP;

NO inventes.

Inspecciona el proyecto primero o pregunta.

25. Compatibilidad con el ERP existente

El ERP existente debe permanecer funcionando.

No modificar:

tablas;
lógica del ERP;
frontend del ERP;
procesos existentes;

salvo que sea estrictamente necesario y se haya explicado previamente.

El chatbot debe consumir los datos existentes de manera no destructiva.

26. Hosting

El backend será desplegado posteriormente en:

administrable.cl


El hosting dispone de filesystem persistente.

Por lo tanto, productos.json, negocio.json, backups y logs podrán almacenarse en filesystem persistente, siempre que la configuración concreta del hosting lo confirme.

No diseñar la solución suponiendo filesystem efímero.

27. Pruebas obligatorias

Probar como mínimo:

Sincronización
Supabase disponible.
Supabase apagado/no disponible.
Datos vacíos.
Error de consulta.
JSON válido.
JSON inválido.
Interrupción durante escritura.
Backup.
Recuperación.
Productos
Producto existente.
Producto inexistente.
Mayúsculas/minúsculas.
Acentos.
Variaciones simples.
Múltiples productos.
Precio.
Stock.
Stock cero.
Chat
Pregunta simple.
Pregunta general.
Pregunta sobre horario.
Pregunta sobre dirección.
Pregunta sobre producto.
Pregunta sobre precio.
Pregunta sobre stock.
Pregunta ambigua.
Pregunta sin respuesta.
Mensaje vacío.
Mensaje demasiado largo.
IA
Gemini disponible.
Gemini con error.
límite de solicitudes.
contexto correcto.
ausencia de información.
prevención de precios inventados.
Seguridad

Verificar que el navegador no pueda obtener:

GEMINI_API_KEY
SUPABASE_SERVICE_ROLE_KEY

28. Orden de implementación

Seguir este orden:

Inspección del proyecto.
Inspección de Supabase.
Plan técnico detallado.
Configuración Node.js.
Variables de entorno.
Conexión Supabase.
Consulta de productos.
Sincronizador.
productos.json.
Backup y escritura segura.
Scheduler.
negocio.json.
Búsqueda local.
Precio y stock.
AIService.
GeminiProvider.
Prompt.
/api/chat.
Frontend.
Integración con landing.
Seguridad.
Pruebas.
Preparación para administrable.cl.
Producción.
29. Primera tarea

NO comiences todavía creando todos los archivos.

Primero:

inspecciona el repositorio;
identifica la estructura actual;
identifica si ya existe Node.js/Express;
identifica la estructura de la landing;
identifica cualquier integración existente con Supabase;
identifica la estructura utilizada por el ERP;
identifica las tablas y columnas necesarias para productos, precio y stock;
comprueba posibles conflictos;
presenta el plan de implementación adaptado al código real encontrado.

Después de presentar ese análisis, comienza únicamente con la primera fase de implementación.

No inventes estructuras que no estén presentes en el proyecto.

No elimines código existente sin justificarlo.

No hagas cambios destructivos.

El objetivo es construir el sistema de manera incremental, probada y mantenible.