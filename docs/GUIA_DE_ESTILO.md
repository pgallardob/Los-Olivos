# Guía de Estilo Visual

## Concepto

Estética **futurista / tecnológica / premium**: precisión, innovación y energía.
Superficies grafito profundo, acentos verde oliva vibrante y un acento **neón lima**
que aporta el carácter futurista (glows, gradientes de texto, detalles HUD).

## Paleta (v2 — neón)

| Token CSS | Color | Uso |
|---|---|---|
| `--nx-olive-dark` | `#46552c` | Fondos de acento, gradientes de botones |
| `--nx-olive` | `#6f8b3f` | Marca, gradientes, botón primario |
| `--nx-olive-light` | `#a9c25a` | Bordes activos, hover, botón outline |
| `--nx-neon` | `#d4ff5e` | **Acento futurista**: glows, kickers, iconos, stats, paginación |
| `--nx-graphite` | `#0b0e0c` | Fondo principal (profundo, para que los glows contrasten) |
| `--nx-graphite-soft` | `#161b17` | Superficies (cards, navbar, drawer, modales) |
| `--nx-metal` | `#a7b1ac` | Texto secundario, grilla de fondo |
| `--nx-metal-light` | `#e4eae6` | Texto principal sobre oscuro |

> Los mismos valores se usan en los SVG placeholder (`assets/`) y en los modales
> de SweetAlert2 (`src/components/*.ts`). Si cambias la paleta, actualiza los tres lugares.

## Fondo tech

- Grilla de circuito sutil (48px) con líneas metálicas al 5 %.
- Dos glows radiales de energía (oliva y neón) con `background-attachment: fixed`.

## Tipografía

- Sistema (`--pico-font-family`): rendimiento máximo, sin webfonts en fase placeholder.
- **Titulares con gradiente** (metal-light → neón) vía `background-clip: text`.
- [PLACEHOLDER: si el branding final requiere webfont, cargar con `font-display: swap`].

## Componentes

- **Navbar**: sticky, translúcida con `backdrop-filter`; enlaces con hover neón + text-shadow.
- **Hero**: pantalla casi completa; kicker neón con línea de energía; título con gradiente;
  paginación tipo "barra de progreso" con gradiente oliva→neón y glow.
- **Cards**: superficie con gradiente oliva sutil, borde oliva al 25 %,
  **esquina HUD** superior derecha en neón que se enciende al hover,
  glow neón en elevación; imagen + badge + icono neón + título + descripción + CTA.
- **Botones**: primario con gradiente oliva y halo neón (se intensifica al hover);
  secundario outline oliva → neón al hover.
- **Stats**: números en neón con text-shadow luminoso; borde que se enciende al hover.
- **Footer**: columnas alineadas arriba; teléfonos apilados; redes sociales en "Síguenos" con iconos de SimpleIcons; "Links de interés" con logos personalizados (`laosita.jpeg`, `efi.jpg`, `los_olivos.jpg` a 52px); dirección clickeable que abre modal con mapa de Google Maps; copyright con crédito de desarrollo.
- **Modal de aviso**: formulario compacto oscuro con campos nombre, teléfono, email y comentario; botones Enviar/Salir; mensaje de éxito con revisión de políticas.
- **Página de avisos**: navbar con título "Avisos vigentes"; cards con nombre, correo, mensaje, fecha y contador regresivo de vigencia (30 días); botones "Volver" y "Publicar aviso".
- **Prevención FOUC**: CSS crítico inline en `<head>` (fondo oscuro + `body { visibility: hidden }`); clase `styles-ready` revela el contenido tras cargar estilos.

## Microinteracciones

- Hover en cards: elevación + borde oliva claro + glow neón (200 ms).
- Kickers con líneas de energía luminosas (`::before`/`::after`).
- AutoAnimate en contenedores con contenido dinámico.
- Tooltips Tippy tema `nexora` (borde oliva sobre grafito).
- Transiciones cortas (150–250 ms): energía sin estridencia.

## Reglas

1. No añadir CSS que Pico ya resuelva.
2. Nuevos colores solo como tokens `--nx-*` en `theme.css`.
3. El neón (`--nx-neon`) es acento, no color de superficie: usarlo en detalles, nunca en fondos grandes.
4. Contraste mínimo WCAG AA (4.5:1 texto normal).
5. Mobile-first: estilos base para móvil, `@media (min-width: ...)` para ampliar.
