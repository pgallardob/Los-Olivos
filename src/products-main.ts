/**
 * Punto de entrada de la página de productos (productos.html).
 * Reutiliza los mismos estilos y componentes que main.ts, pero
 * inicializa el catálogo en vez de hero/cards.
 */

// --- Estilos (mismos que main.ts) ---
import '@picocss/pico/css/pico.min.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import './styles/theme.css';

// --- Shoelace: componentes utilizados ---
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// --- Componentes y utilidades ---
import { initNavbar } from './components/navbar';
import { initFooter } from './components/footer';
import { initCatalog } from './components/catalog';
import { initTooltips } from './utils/tooltips';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/');

document.body.classList.add('styles-ready');

async function bootstrap(): Promise<void> {
  initNavbar();
  await Promise.all([initFooter(), initCatalog()]);
  initTooltips();
}

document.addEventListener('DOMContentLoaded', () => {
  void bootstrap();
});
