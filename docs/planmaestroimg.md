# PROMPT MAESTRO — SISTEMA DE IMÁGENES DE PRODUCTOS

## CONTEXTO DEL PROYECTO

Estoy desarrollando una página web utilizando HTML y JavaScript, con Supabase como backend/base de datos.

La página de productos actualmente se ejecuta localmente en:

`http://localhost:5173/productos.html`

Posteriormente será publicada utilizando el plan de **$5.990 de Administrable.cl**.

La base de datos de Supabase ya contiene los nombres de los productos y otros datos del catálogo.

El proyecto tendrá aproximadamente **250 productos**.

## OBJETIVO PRINCIPAL

Implementar un sistema de imágenes de productos utilizando **Supabase Storage**, evitando almacenar las 250 imágenes dentro de la carpeta del proyecto web.

Cada producto deberá tener asociada una imagen real del producto y dicha imagen deberá cargarse automáticamente en la card correspondiente dentro de:

`productos.html`

La solución debe ser dinámica y escalable para que posteriormente puedan agregarse nuevos productos sin tener que modificar manualmente el HTML.

---

# REGLAS IMPORTANTES

## 1. NO modificar innecesariamente el proyecto existente

Antes de realizar cualquier cambio:

* Analiza la estructura actual del proyecto.
* Analiza `productos.html`.
* Analiza todos los archivos JavaScript relacionados con los productos.
* Analiza cómo se conecta actualmente el proyecto con Supabase.
* Analiza la estructura actual de la tabla de productos.
* Identifica cómo se generan actualmente las cards.

NO reemplaces código funcional sin una razón concreta.

Mantén todas las funcionalidades existentes.

---

## 2. Utilizar Supabase Storage

Las imágenes NO deben almacenarse dentro de:

* `src`
* `public`
* carpetas de imágenes del proyecto
* cualquier otra carpeta que posteriormente sea subida a Administrable.cl

Las imágenes deberán almacenarse en:

**Supabase Storage**

Crear/utilizar un bucket llamado:

`productos`

La arquitectura final debe ser:

```text
Supabase
│
├── Database
│   └── productos
│
└── Storage
    └── productos
        ├── producto-1.webp
        ├── producto-2.webp
        └── ...
```

---

# 3. Plan de Supabase

El proyecto utilizará inicialmente el **plan Free de Supabase**.

No cambiar el plan de Supabase.

El almacenamiento debe optimizarse para utilizar la menor cantidad de espacio posible.

---

# 4. Imágenes reales

Las imágenes deben representar productos reales.

La IA NO debe inventar, generar o modificar artificialmente el envase, etiqueta, logotipo o apariencia del producto.

No utilizar imágenes generadas por IA para representar productos comerciales reales.

La IA puede ayudar a:

* identificar el producto;
* buscar fuentes;
* organizar las imágenes;
* detectar coincidencias;
* renombrar archivos;
* optimizar imágenes.

Pero la fotografía/imagen utilizada debe corresponder al producto real.

---

# 5. Formato de las imágenes

Antes de almacenarlas, las imágenes deberán optimizarse.

Preferentemente:

* Formato: WebP
* Tamaño aproximado: 500 × 500 px
* Peso objetivo: aproximadamente 50–150 KB por imagen cuando la calidad lo permita.
* Mantener buena calidad visual.
* Mantener una presentación visual consistente entre productos.

No utilizar imágenes innecesariamente grandes.

---

# 6. Información de cada producto

Cada card de producto deberá mostrar como mínimo:

* Imagen
* Marca
* Categoría
* Precio

Ejemplo visual:

```text
┌───────────────────────────┐
│                           │
│       IMAGEN PRODUCTO     │
│                           │
├───────────────────────────┤
│ Marca: Coca-Cola          │
│ Categoría: Bebidas        │
│ Precio: $1.990            │
└───────────────────────────┘
```

IMPORTANTE:

Marca, categoría y precio deben ser datos dinámicos provenientes de Supabase.

NO escribir manualmente esos datos dentro de las imágenes.

Si cambia el precio en Supabase, la card debe mostrar automáticamente el nuevo precio.

---

# 7. Base de datos

Analiza la tabla actual de productos.

Si es necesario agregar un campo para la imagen, utiliza preferentemente:

`imagen_url`

No crees columnas nuevas innecesariamente.

Antes de modificar la estructura de la base de datos:

1. Explica qué columna necesitas.
2. Explica por qué.
3. Muestra el SQL que utilizarías.
4. Espera mi aprobación antes de ejecutarlo.

La relación debe terminar conceptualmente así:

```text
producto
│
├── nombre
├── marca
├── categoria
├── precio
└── imagen_url
```

---

# 8. Carga de imágenes en productos.html

La página:

`http://localhost:5173/productos.html`

debe cargar las imágenes desde Supabase Storage.

NO colocar las imágenes manualmente en el HTML.

NO hacer:

```html
<img src="imagen1.webp">
```

para cada producto.

Debe ser dinámico.

El JavaScript debe obtener desde Supabase los datos del producto y construir la card utilizando:

* nombre
* marca
* categoría
* precio
* imagen_url

La imagen debe provenir de Supabase Storage.

---

# 9. No romper el sistema actual

Antes de modificar la generación de cards:

* identifica exactamente dónde se generan;
* identifica qué datos reciben;
* identifica qué clases CSS utilizan;
* identifica si existen filtros;
* identifica si existen búsquedas;
* identifica si existen categorías;
* identifica paginación, carrito u otras funcionalidades relacionadas.

Las modificaciones deben integrarse al sistema existente.

No rehacer todo el frontend si no es necesario.

---

# 10. Trabajo por fases

DEBES trabajar estrictamente siguiendo estas fases.

## FASE 1 — Auditoría

Analiza:

* estructura del proyecto;
* `productos.html`;
* JavaScript;
* conexión Supabase;
* tabla de productos;
* generación de cards.

En esta fase NO modifiques código.

Entrega un informe indicando:

1. Qué archivos intervienen.
2. Cómo se cargan actualmente los productos.
3. Cómo se generan actualmente las cards.
4. Qué columnas tiene la tabla de productos.
5. Qué modificaciones serán necesarias.
6. Qué riesgos detectas.

Después de entregar el informe, ESPERA MI CONFIRMACIÓN.

---

## FASE 2 — Preparación de Supabase

Después de mi aprobación:

* preparar el bucket `productos`;
* definir las políticas necesarias;
* determinar si debe ser público;
* preparar la estructura necesaria para las imágenes.

Si se requiere ejecutar SQL:

* mostrar primero el SQL;
* explicar qué hace;
* esperar aprobación antes de ejecutarlo.

---

## FASE 3 — Campo de imagen

Preparar el campo:

`imagen_url`

o una alternativa técnicamente mejor si existe una razón justificada.

No modificar la base de datos sin mi aprobación.

---

## FASE 4 — Primera card

Modificar el sistema para que una card pueda mostrar:

```text
Imagen
Marca
Categoría
Precio
```

Utilizando datos dinámicos de Supabase.

Primero realizar una prueba con **un solo producto**.

Verificar:

* que la imagen cargue;
* que la URL funcione;
* que la card mantenga el diseño;
* que marca, categoría y precio sean correctos.

---

## FASE 5 — Prueba con 3 productos

Una vez que funcione un producto:

* utilizar 3 productos reales;
* subir sus imágenes a Supabase Storage;
* asociarlas mediante `imagen_url`;
* verificar que las 3 cards funcionen correctamente.

NO procesar todavía los 250 productos.

Después de la prueba, entregar un informe de resultados y ESPERAR MI CONFIRMACIÓN.

---

# FASE 6 — Preparación para las 250 imágenes

Una vez aprobada la prueba:

Analizar todos los productos de Supabase que no tengan imagen.

Crear un listado:

```text
ID | Producto | Marca | Categoría | Precio | Estado imagen
```

Estados posibles:

* pendiente
* imagen encontrada
* revisada
* subida
* error

No subir imágenes incorrectas automáticamente.

---

# FASE 7 — Obtención de imágenes

Para cada producto:

1. Identificar nombre.
2. Identificar marca.
3. Identificar categoría.
4. Identificar presentación/tamaño.
5. Buscar una imagen real correspondiente.
6. Verificar que corresponda al producto.
7. Descargarla.
8. Optimizarla.
9. Convertirla a WebP.
10. Subirla a Supabase Storage.
11. Guardar la URL en Supabase.

La IA NO debe inventar imágenes.

Si no existe una coincidencia suficientemente confiable:

```text
NO subir una imagen incorrecta.
```

Marcar el producto como:

`pendiente_revision`

para revisión manual.

---

# FASE 8 — Automatización

Cuando sea seguro automatizar:

Crear un proceso que pueda:

1. Leer productos desde Supabase.
2. Detectar cuáles no tienen imagen.
3. Procesar la imagen correspondiente.
4. Optimizarla.
5. Subirla a Storage.
6. Obtener su URL.
7. Guardar `imagen_url`.
8. Continuar con el siguiente producto.
9. Registrar errores.

El proceso debe ser seguro para ejecutarse nuevamente.

Si un producto ya tiene una imagen correcta:

NO volver a descargarla ni duplicarla.

---

# FASE 9 — Integración final con productos.html

La página:

`http://localhost:5173/productos.html`

debe mostrar automáticamente todas las cards.

Cada card debe contener:

```text
Imagen
Marca
Categoría
Precio
```

Los datos deben provenir de Supabase.

La imagen debe provenir de Supabase Storage.

No deben existir 250 referencias de imágenes escritas manualmente en HTML.

---

# FASE 10 — Control de calidad

Comprobar los 250 productos.

Verificar:

### Imagen

* corresponde al producto;
* corresponde a la marca;
* corresponde a la presentación;
* se visualiza correctamente;
* tiene buena calidad;
* está optimizada;
* no está duplicada incorrectamente.

### Card

* imagen correcta;
* marca correcta;
* categoría correcta;
* precio correcto;
* diseño intacto;
* responsive funcionando.

### Base de datos

* `imagen_url` correcta;
* sin URLs rotas;
* sin duplicados innecesarios;
* sin productos accidentalmente modificados.

---

# FASE 11 — Nuevos productos

El sistema debe quedar preparado para futuros productos.

Cuando se agregue un producto nuevo:

```text
Nuevo producto
       ↓
Supabase
       ↓
sin imagen
       ↓
pendiente
       ↓
se agrega imagen
       ↓
imagen_url
       ↓
aparece automáticamente en productos.html
```

No debería ser necesario modificar manualmente el HTML para cada producto nuevo.

---

# REGLA FUNDAMENTAL DE SEGURIDAD

Antes de realizar operaciones que puedan:

* borrar datos;
* modificar masivamente productos;
* modificar estructura de tablas;
* reemplazar archivos;
* eliminar imágenes;
* cambiar políticas de Supabase;
* procesar los 250 productos;

DEBES detenerte y solicitar mi aprobación.

No realizar operaciones destructivas o masivas sin confirmación.

---

# CRITERIO FINAL DE ÉXITO

El trabajo estará terminado cuando:

* Las imágenes estén fuera del proyecto web.
* Las imágenes estén en Supabase Storage.
* Las imágenes sean reales y correspondan a los productos.
* No existan imágenes generadas artificialmente para representar productos comerciales.
* Las imágenes estén optimizadas.
* Cada producto tenga su `imagen_url`.
* `productos.html` cargue automáticamente las imágenes.
* Cada card muestre:

  * Imagen
  * Marca
  * Categoría
  * Precio
* Los datos sean dinámicos desde Supabase.
* Los 250 productos estén procesados o claramente marcados para revisión.
* Los productos futuros puedan incorporar imágenes sin modificar manualmente el HTML.
* El sistema existente de la web continúe funcionando correctamente.

---

# FORMA DE TRABAJO

NO intentes completar todo el proyecto en una sola operación.

Trabaja de forma incremental:

**Auditar → informar → esperar aprobación → modificar → probar → informar → esperar aprobación → continuar.**

Siempre indica:

1. Qué vas a modificar.
2. Por qué.
3. Qué archivos serán afectados.
4. Qué cambios realizarás.
5. Cómo verificarás que funcionan.

Prioriza siempre:

**Seguridad → no romper funcionalidades existentes → simplicidad → rendimiento → escalabilidad.**
