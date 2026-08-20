# Auditoría del ERP — Fase 0

> Documento generado el 2026-08-19 a partir de consultas reales a Supabase.
> No contiene credenciales ni secretos.

## 1. Conexión a Supabase

| Dato | Valor |
|---|---|
| Proyecto | `kkeidfhyiybbngbvqjxt.supabase.co` |
| Región | (implícita en la URL) |
| Esquema | `public` |
| Acceso | Service role key (solo backend) |

**Nota:** `information_schema` no está expuesto en el schema cache de Supabase. Las columnas se inferieron a partir de muestras de datos reales. Los tipos de dato a continuación son inferidos del contenido, no del catálogo de Postgres.

---

## 2. Tablas encontradas

| Tabla | Registros | Descripción |
|---|---|---|
| `productos` | 283 | Catálogo principal de productos |
| `categorias` | 4 | Categorías de productos |
| `marcas` | 3 | Marcas de productos |
| `ventas` | 95 | Registro de ventas |
| `clientes` | 0 | Clientes (vacía) |
| `proveedores` | 0 | Proveedores (vacía) |
| `usuarios` | 2 | Usuarios del ERP |
| `compras` | 0 | Compras (vacía) |

---

## 3. Tabla `productos` — Estructura detallada

### 3.1 Columnas

| Columna | Tipo (inferido) | Nullable | Descripción |
|---|---|---|---|
| `id` | UUID (string) | NO | Identificador único (PK) |
| `sku` | string | NO | Código SKU interno (ej. `ALI-00105`) |
| `codigo_barras` | string | SÍ | Código de barras EAN (ej. `7801810117543`) |
| `codigo_qr` | string | SÍ | Código QR (no utilizado actualmente) |
| `nombre` | string | NO | Nombre del producto |
| `descripcion` | string | SÍ | Descripción o nota del producto |
| `categoria_id` | UUID (FK → `categorias.id`) | SÍ | Categoría del producto |
| `marca_id` | UUID (FK → `marcas.id`) | SÍ | Marca del producto |
| `costo` | integer (número) | NO | Costo de adquisición en CLP |
| `precio` | integer (número) | NO | Precio de venta en CLP |
| `iva` | integer (número) | NO | Porcentaje de IVA (fijo en 19) |
| `stock` | integer (número) | NO | Cantidad en existencia |
| `stock_minimo` | integer (número) | NO | Stock mínimo de alerta |
| `stock_maximo` | integer (número) | NO | Stock máximo deseado |
| `imagen` | string/URL | SÍ | URL de imagen (ningún producto la usa actualmente) |
| `fecha_vencimiento` | timestamp | SÍ | Fecha de vencimiento (no utilizado) |
| `estado` | boolean | NO | `true` = activo, `false` = inactivo |
| `created_at` | timestamp | NO | Fecha de creación |
| `updated_at` | timestamp | NO | Fecha de última modificación |
| `deleted_at` | timestamp | SÍ | Soft delete (`null` = no eliminado) |

### 3.2 Mapeo para el chatbot

| Campo del chatbot | Columna en Supabase | Observación |
|---|---|---|
| ID | `id` | UUID string |
| Nombre | `nombre` | Texto en minúsculas, incluye presentación |
| Precio | `precio` | Integer en CLP (ej. 1590 = $1.590) |
| Stock | `stock` | Integer, `0` = sin stock |
| Activo | `estado` | `true` = incluir en sync, `false` = excluir |
| Soft delete | `deleted_at` | `NOT NULL` = excluir de sync |
| Categoría | `categoria_id` → `categorias.nombre` | Join para obtener nombre legible |
| Marca | `marca_id` → `marcas.nombre` | Join para obtener nombre legible |
| Código de barras | `codigo_barras` | 203 de 283 productos lo tienen |
| SKU | `sku` | Código interno, útil para búsqueda exacta |

### 3.3 Estadísticas

| Métrica | Valor |
|---|---|
| Total de productos | 283 |
| Productos activos (`estado = true`) | 274 |
| Productos inactivos (`estado = false`) | 9 |
| Productos con soft delete (`deleted_at NOT NULL`) | 8 |
| Productos sin stock (`stock = 0`) | 1 |
| Productos con código de barras | 203 |
| Productos con imagen | 0 |
| Precio mínimo | $200 CLP |
| Precio máximo | $10.800 CLP |
| Precio promedio | $1.427 CLP |
| Stock mínimo | 0 |
| Stock máximo | 144 |

### 3.4 Productos por categoría

| Categoría | ID | Productos activos |
|---|---|---|
| Alimentos | `c7b38aa6-...` | 120 |
| General | `518fa8e3-...` | 55 |
| Bebidas | `269532ed-...` | 50 |
| Limpieza | `519892a1-...` | 47 |
| Sin categoría | (null) | 2 |

### 3.5 Muestras de productos

**Producto 1:**
```json
{
  "id": "6b3e1fb2-972c-4779-b10a-d7168dac46b7",
  "sku": "ALI-00105",
  "codigo_barras": null,
  "nombre": "jamon pierna sandwich receta del abuelo 1kg",
  "descripcion": "jamon pierna sandwich receta del abuelo.",
  "categoria_id": "c7b38aa6-70bf-46cf-a1a6-4ac3a36b57bf",
  "marca_id": "ea1d7263-b280-48af-92f2-9c6fed26d0e0",
  "costo": 7400,
  "precio": 10000,
  "iva": 19,
  "stock": 3,
  "stock_minimo": 0,
  "stock_maximo": 0,
  "imagen": null,
  "fecha_vencimiento": null,
  "estado": true,
  "deleted_at": null
}
```

**Producto 2:**
```json
{
  "id": "12bccbd8-f69d-41c8-8b9c-9d1b322ac4dd",
  "sku": "ALI-00078",
  "codigo_barras": "780230000016",
  "nombre": "salsa tomates doña clara 200gr",
  "descripcion": "solo hasta agotar stock",
  "costo": 365,
  "precio": 500,
  "stock": 36,
  "estado": true,
  "deleted_at": null
}
```

**Producto 3:**
```json
{
  "id": "9668f119-a65c-4920-af16-304dbc6308c5",
  "sku": "ALI-00077",
  "codigo_barras": "7801810117543",
  "nombre": "emblem tea 100 bts 180 gr",
  "descripcion": "solo hasta agotar stock",
  "costo": 1720,
  "precio": 2200,
  "stock": 10,
  "estado": true,
  "deleted_at": null
}
```

---

## 4. Tabla `categorias` — Estructura

| Columna | Tipo (inferido) | Nullable | Descripción |
|---|---|---|---|
| `id` | UUID (string) | NO | PK |
| `nombre` | string | NO | Nombre de la categoría |
| `descripcion` | string | SÍ | Descripción |
| `created_at` | timestamp | NO | Fecha de creación |
| `updated_at` | timestamp | NO | Fecha de modificación |
| `deleted_at` | timestamp | SÍ | Soft delete |

### Categorías registradas

| ID | Nombre | Descripción |
|---|---|---|
| `c7b38aa6-...` | Alimentos | Productos alimenticios |
| `269532ed-...` | Bebidas | Bebidas y refrescos |
| `518fa8e3-...` | General | Categoria general |
| `519892a1-...` | Limpieza | Productos de limpieza |

---

## 5. Tabla `marcas` — Estructura

| Columna | Tipo (inferido) | Nullable | Descripción |
|---|---|---|---|
| `id` | UUID (string) | NO | PK |
| `nombre` | string | NO | Nombre de la marca |
| `descripcion` | string | SÍ | Descripción |
| `created_at` | timestamp | NO | Fecha de creación |
| `updated_at` | timestamp | NO | Fecha de modificación |
| `deleted_at` | timestamp | SÍ | Soft delete |

### Marcas registradas

| ID | Nombre | Descripción |
|---|---|---|
| `55112c38-...` | Generico | Marca generica |
| `bf0dbf2e-...` | Importado | Marca importada |
| `ea1d7263-...` | Nacional | Marca nacional |

---

## 6. Tablas no relevantes para el chatbot

| Tabla | Columnas inferidas | Observación |
|---|---|---|
| `ventas` | id, cliente_id, usuario_id, fecha, subtotal, descuento, iva, total, tipo_documento, estado, created_at, medio_pago | 95 registros. No se sincroniza. |
| `clientes` | (vacía) | 0 registros |
| `proveedores` | (vacía) | 0 registros |
| `usuarios` | id, nombre, email, password, rol, estado, created_at, updated_at | 2 registros. Contiene hashes bcrypt. No se sincroniza. |
| `compras` | (vacía) | 0 registros |

---

## 7. Reglas de sincronización determinadas

1. **Filtro de productos a sincronizar:**
   - `estado = true` (producto activo)
   - `deleted_at IS NULL` (no eliminado por soft delete)
   - Esto deja ~**265 productos** aproximadamente (274 activos - 8 con soft delete - 1 posible solapamiento)

2. **Columnas a seleccionar (select específico, no `*`):**
   ```
   id, sku, codigo_barras, nombre, descripcion, categoria_id, marca_id, precio, stock, estado
   ```
   - No se sincroniza: `costo` (información sensible), `iva` (fijo en 19%), `stock_minimo`, `stock_maximo`, `imagen` (vacía), `fecha_vencimiento`, `codigo_qr`, `created_at`, `updated_at`, `deleted_at`
   - Se evalúa incluir `categoria_id` y `marca_id` con join para resolver nombres legibles

3. **Join para enriquecer datos:**
   - `categoria_id` → `categorias.nombre` (para mostrar "Alimentos" en vez del UUID)
   - `marca_id` → `marcas.nombre` (para mostrar "Nacional" en vez del UUID)

4. **Tipo de precio:** integer en CLP sin decimales (ej. `1590` = $1.590)
5. **Tipo de stock:** integer, `0` = sin stock
6. **No hay variantes** de un mismo producto (cada registro es un producto único)
7. **No hay productos duplicados** visibles (cada uno tiene su propio SKU)
8. **Nombres en minúsculas:** los nombres de productos están en minúsculas en la base. El chatbot deberá normalizar para presentación.

---

## 8. Estructura propuesta para `productos.json`

```json
{
  "metadata": {
    "ultima_actualizacion": "2026-08-19T18:00:00-04:00",
    "ultima_sincronizacion_exitosa": "2026-08-19T18:00:00-04:00",
    "cantidad_productos": 265,
    "fuente": "ERP_SUPABASE",
    "estado": "ok"
  },
  "productos": [
    {
      "id": "6b3e1fb2-972c-4779-b10a-d7168dac46b7",
      "sku": "ALI-00105",
      "nombre": "jamon pierna sandwich receta del abuelo 1kg",
      "categoria": "Alimentos",
      "marca": "Nacional",
      "precio": 10000,
      "stock": 3
    }
  ]
}
```

### Decisiones de diseño:

- **No incluir `costo`:** información sensible del negocio, el chatbot no la necesita
- **No incluir `iva`:** fijo en 19%, irrelevante para el chatbot
- **Resolver FK a nombres:** el JSON final tendrá `categoria` y `marca` como strings legibles, no UUIDs
- **No incluir `codigo_barras` en el JSON del chatbot:** se puede usar para búsqueda pero no es necesario en el archivo final (se evalúa durante la implementación)
- **Incluir `sku`:** útil para búsqueda exacta desde el chatbot

---

## 9. Observaciones y riesgos

| Observación | Impacto | Recomendación |
|---|---|---|
| `information_schema` no accesible | No se pudieron obtener tipos exactos de Postgres | Los tipos se inferirán de los datos. Validar con cast en el sincronizador |
| Nombres en minúsculas | El chatbot debe capitalizar para presentación | Normalizar en `product.service.js` |
| 2 productos sin `categoria_id` | Aparecerán como "Sin categoría" | Manejar con fallback en el join |
| 0 productos con imagen | El chatbot no mostrará imágenes de productos | Asignar imágenes locales o URLs en el catálogo |
| Soft delete + estado boolean | Doble mecanismo de exclusión | Filtrar por ambos: `estado = true AND deleted_at IS NULL` |
| `precio` es integer | Sin decimales | Formatear con separador de miles en la respuesta |

---

## 10. Consulta SQL equivalente para el sincronizador

```sql
SELECT
  p.id,
  p.sku,
  p.nombre,
  p.precio,
  p.stock,
  c.nombre AS categoria,
  m.nombre AS marca
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN marcas m ON p.marca_id = m.id
WHERE p.estado = true
  AND p.deleted_at IS NULL
ORDER BY p.nombre;
```

---

## 11. Estado de la Fase 0

- [x] Nombre de la tabla de productos: **`productos`**
- [x] Columna ID: **`id`** (UUID)
- [x] Columna de nombre: **`nombre`** (string)
- [x] Columna de precio: **`precio`** (integer, CLP)
- [x] Columna de stock: **`stock`** (integer)
- [x] Columna de producto activo: **`estado`** (boolean) + **`deleted_at`** (soft delete)
- [x] Categorías: tabla **`categorias`**, FK **`categoria_id`**, 4 categorías
- [x] Marcas: tabla **`marcas`**, FK **`marca_id`**, 3 marcas
- [x] Cantidad aproximada: **283 total, ~265 sincronizables**
- [x] Tipo de precio: **integer (CLP sin decimales)**
- [x] Tipo de stock: **integer**
- [x] Variantes: **no existen**
- [x] Productos duplicados: **no detectados**

**Fase 0 completada.** Listo para avanzar a la Fase 1 (crear proyecto Node.js) cuando el usuario lo autorice.
