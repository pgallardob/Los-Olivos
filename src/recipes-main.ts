/**
 * Punto de entrada de la página de recetas (recetas.html).
 */

import '@picocss/pico/css/pico.min.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import './styles/theme.css';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

import { initNavbar } from './components/navbar';
import { initFooter } from './components/footer';
import { initRecipes } from './components/recipes';
import { initOpenStatus } from './components/open-status';
import { initQrModal } from './components/qr-modal';
import { initTooltips } from './utils/tooltips';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/');

document.body.classList.add('styles-ready');

async function bootstrap(): Promise<void> {
  initNavbar();
  initOpenStatus();
  try {
    await Promise.all([initFooter(), initRecipes()]);
  } catch (err) {
    console.error('[bootstrap] Error:', err);
  }
  initTooltips();
}

document.addEventListener('DOMContentLoaded', () => {
  void bootstrap();
  initQrModal();
});
