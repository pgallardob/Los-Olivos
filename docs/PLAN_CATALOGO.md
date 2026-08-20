# Plan de Trabajo — Catálogo de Productos

**Proyecto:** Comercializadora Los Olivos E.I.R.L.
**Objetivo:** Página independiente `/productos.html` con catálogo estático, sin base de datos ni backend.

---

## Análisis previo (completado)

- **Stack:** Vite + TypeScript ES modules + Pico CSS + Shoelace + estilos en `src/styles/theme.css`
- **Entry point:** `index.html` → `src/main.ts` → inicializa `navbar`, `hero`, `cards`, `footer`, `animations`, `tooltips`
- **Navbar:** links con anclas (`#inicio`, `#servicios`, `#nosotros`, `#contacto`) + drawer móvil Shoelace
- **Cards existentes:** `src/components/cards.ts` renderiza en `#cards-grid` — se reutilizará la estética
- **Tokens CSS:** `--nx-olive*`, `--nx-neon`, `--nx-graphite*`, `--nx-metal*` en `theme.css`
- **Vite soporta multi-page:** se agrega `productos.html` como segunda entrada en `vite.config.ts` (rollupOptions.input)

---

## Fases de implementación

### Fase 1 — Estructura de datos
**Archivos nuevos:**
- `src/data/products.ts`
  - `interface Product { id, nombre, marca?, categoria, imagen? }`
  - `interface Category { id, nombre }`
  - Constante `CATEGORIES`: abarrotes, aseo, hogar, alimentos, bebidas, general
  - Productos de ejemplo (~16-20) según sección 22 del requerimiento
  - `PRODUCTS_PER_PAGE = 12` exportada

### Fase 2 — Página de productos
**Archivos nuevos:**
- `productos.html` (raíz, junto a `index.html`)
  - Header con logo (mismo `logoolivos.jpeg`) + navegación de vuelta (`/index.html#inicio`, etc.) + drawer móvil reutilizado
  - Título "Nuestros Productos" + subtítulo
  - Contenedor de filtros de categoría
  - Grid de cards
  - Paginación
  - Footer igual al de index
- `src/products-main.ts` (entry point de la página)
  - Importa mismos estilos que `main.ts`
  - Inicializa navbar, catálogo, footer, tooltips

### Fase 3 — Componente catálogo
**Archivos nuevos:**
- `src/components/catalog.ts`
  - Renderiza filtros de categoría (botones accesibles con `aria-pressed`)
  - Renderiza cards: imagen (`object-fit: contain`, `loading="lazy"`) + nombre + marca
  - Placeholder `sinimg.jpeg` para productos sin imagen
  - Lógica de resolución de imagen: si el producto tiene campo `imagen` se usa esa URL, si no se muestra `sinimg.jpeg`
  - Paginación funcional (por categoría, reset a página 1 al cambiar filtro, `aria-label`)

### Fase 4 — Estilos
**Archivo modificado:** `src/styles/theme.css`
- Sección nueva `/* CATÁLOGO */` al final (sin tocar estilos existentes)
- Grid responsive: 1-2 col móvil, 2-3 tablet, 4 desktop
- Cards con estética existente (graphite, bordes oliva, hover neon, esquinas HUD)
- Filtros tipo chips con estado activo evidente (color + borde, no solo color)
- Paginación responsive sin overflow horizontal

### Fase 5 — Navegación
**Archivos modificados:**
- `index.html`: agregar "Productos" al navbar (desktop + drawer móvil) → `/productos.html`
- Orden: Inicio | Servicios | Productos | Nosotros | Contacto
- Las anclas existentes NO se tocan
- `vite.config.ts`: agregar `rollupOptions.input` con ambas páginas

### Fase 6 — Verificación
- `pnpm build` (tsc --noEmit + vite build) sin errores
- Navegación Inicio ↔ Productos
- Filtros por categoría + paginación
- Producto sin imagen → `sinimg.jpeg`
- Responsive: móvil, tablet, desktop
- Sin errores de consola
- Navbar original intacto

---

## Restricciones respetadas

- ❌ Sin base de datos / Firebase / Supabase / SQL / MongoDB
- ❌ Sin backend para productos
- ❌ Sin librerías nuevas
- ✅ Sitio 100% estático
- ✅ Reutiliza tokens CSS y componentes existentes
- ✅ Arquitectura preparada para: precio, stock, descripción, ofertas, destacados, WhatsApp

## Resumen de archivos

| Acción | Archivo |
|--------|---------|
| Crear | `productos.html` |
| Crear | `src/products-main.ts` |
| Crear | `src/data/products.ts` |
| Crear | `src/components/catalog.ts` |
| Modificar | `index.html` (navbar) |
| Modificar | `src/styles/theme.css` (sección nueva al final) |
| Modificar | `vite.config.ts` (multi-page input) |

---

## Estado: Implementado ✅

Todas las fases están implementadas. El catálogo muestra productos estáticos desde
`src/data/products.ts` con filtros por categoría, paginación e imágenes placeholder
(`sinimg.jpeg`) para productos sin imagen definida.
