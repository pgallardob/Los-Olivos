/**
 * Punto de entrada: importa estilos e inicializa cada módulo.
 * Orden: estilos → componentes → utilidades (iconos/tooltips al final,
 * porque operan sobre el DOM ya renderizado).
 */

// --- Estilos ---
import '@picocss/pico/css/pico.min.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import './styles/theme.css';
import './styles/chatbot.css';

// --- Shoelace: solo los componentes utilizados ---
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// --- Componentes y utilidades ---
import { initNavbar } from './components/navbar';
import { initHero } from './components/hero';
import { initCards } from './components/cards';
import { initFooter } from './components/footer';
import { initAnimations } from './utils/animations';
import { initTooltips } from './utils/tooltips';
import { initChatbot } from './components/chatbot';

// Assets internos de Shoelace (iconos del sistema) desde CDN
setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/');

document.body.classList.add('styles-ready');

async function bootstrap(): Promise<void> {
  initNavbar();
  await Promise.all([initHero(), initCards(), initFooter()]);
  initAnimations();
  initTooltips();
  initChatbot();
}

document.addEventListener('DOMContentLoaded', () => {
  void bootstrap();
});
