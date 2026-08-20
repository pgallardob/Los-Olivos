# Arquitectura Frontend

## Principios

1. **Separación estricta de responsabilidades**: HTML = estructura, CSS = presentación, TS = lógica.
2. **Cero inline**: sin `style=""`, sin `onclick=""`. Se permite `<style>` crítico en `<head>` para prevenir FOUC.
3. **Módulos con responsabilidad única**: cada componente inicializa su propia sección.
4. **CSS mínimo**: Pico CSS aporta la base; `theme.css` solo define identidad (tokens + ajustes puntuales).
5. **Datos desacoplados de la vista**: `services/api.ts` expone datos tipados; las vistas solo renderizan.

## Flujo de inicialización

```
index.html  →  <script type="module" src="/src/main.ts">
main.ts
 ├── importa estilos (Pico, Swiper, Shoelace, tippy, theme.css)
 ├── document.body.classList.add('styles-ready')  → revela contenido con estilos
 ├── initNavbar()    → menú móvil (sl-drawer) + modal "Envianos tu aviso" (SweetAlert2)
 ├── initHero()      → Swiper (autoplay 3500ms, speed 500ms, paginación horizontal)
 ├── initCards()     → fetch de datos tipados → render de <article> cards
 ├── initFooter()    → contacto (dirección clickeable con mapa modal), redes sociales, links de interés
 ├── initAnimations()→ AutoAnimate en contenedores dinámicos
 └── initTooltips()  → Tippy.js sobre [data-tippy-content]

productos.html  →  <script type="module" src="/src/products-main.ts">
products-main.ts
 ├── importa estilos (Pico, Shoelace, tippy, theme.css)
 ├── document.body.classList.add('styles-ready')
 ├── initNavbar()    → navbar reutilizado con link a /productos.html
 ├── initCatalog()   → render catálogo: filtros, grid, paginación, imágenes
 ├── initFooter()    → footer reutilizado
 └── initTooltips()  → Tippy.js

avisos.html  →  <script type="module" src="/src/avisos-main.ts">
avisos-main.ts
 ├── importa estilos (Pico, Shoelace, theme.css)
 ├── document.body.classList.add('styles-ready')
 ├── fetch GET /api/avisos → render de cards con countdown
 └── expiración automática de avisos (30 días)
```

## Decisiones técnicas

| Decisión | Justificación |
|---|---|
| Vite como bundler | Dev server instantáneo, tree-shaking, code-splitting de CSS, salida ES2022 |
| Vite multi-page | `index.html` + `productos.html` como entradas independientes en `rollupOptions.input` |
| Shoelace vía import selectivo | Solo se cargan los componentes usados (drawer, button, icon-button, badge) |
| Datos como `Promise` en `api.ts` | Interfaz idéntica a una API real → migrar a backend sin tocar componentes |
| Variables de entorno `VITE_*` | Datos de negocio editables sin tocar código |
| `VITE_FORM_ENDPOINT` | URL del backend de avisos (Express + Resend); vacío usa `mailto:` de respaldo |
| `VITE_SOCIAL_*` | Redes sociales del área "Síguenos" (Instagram, WhatsApp, etc.) |
| Links de interés con logos | `linksSocials` en `api.ts` usa imágenes locales (`laosita.jpeg`, `efi.jpg`, `los_olivos.jpg`) con URLs de Instagram |
| Dirección clickeable | Modal SweetAlert2 con mapa embebido de Google Maps + link "Cómo llegar" |
| FOUC prevention | CSS crítico inline en `<head>` + clase `styles-ready` en body tras cargar estilos |
| Avisos con expiración | 30 días desde publicación; prune automático en backend y frontend |
| `loading="lazy"` en imágenes de cards | Imágenes fuera del viewport no bloquean carga inicial |
| Swiper ≥ 12.1.2 | Versión 11 tenía vulnerabilidad crítica (prototype pollution); no bajar de 12.1.2 |
| Backend Express + Resend API | Envío real de emails del formulario de contacto |

## Convenciones

- Componentes exportan una función `initX(): void` (o `Promise<void>`).
- Archivos siempre en UTF-8 sin BOM. Evitar editar en lote con PowerShell
  `Get-Content`/`Set-Content` sin `-Encoding UTF8` (corrompe acentos).
- Tipos e interfaces en el módulo que posee los datos (`api.ts`).
- Selectores DOM por `id` para mounts de componentes y `data-*` para comportamiento
  (`data-tippy-content`, `data-social`, `data-cta`).
- Nombres de archivo en kebab-case, funciones en camelCase, tipos en PascalCase.

## Performance

- Bundle único pequeño + CSS dividido; sin dependencias no usadas.
- Imágenes: `loading="lazy"` + `decoding="async"` fuera del hero; el primer slide es eager.
- Sin polyfills: target ES2022 (navegadores modernos).
- CSS crítico inline en `<head>` para prevenir FOUC al navegar entre páginas.

## Escalabilidad futura

- Nuevas secciones = nuevo módulo en `components/` + mount en `index.html` + init en `main.ts`.
- Conexión a CMS/backend: reemplazar la implementación interna de `api.ts` (misma firma).
- i18n: extraer strings de `api.ts` a diccionarios por idioma.
- Catálogo: agregar precio, stock, descripción, ofertas, destacados, WhatsApp en `products.ts`.
- Imágenes de productos: agregar URLs de imágenes locales o CDN propio en el campo `imagen` de cada producto.
