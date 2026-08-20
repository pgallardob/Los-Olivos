/**
 * Microinteracciones: AutoAnimate en contenedores dinámicos
 * y creación de iconos Lucide declarados con [data-lucide].
 */
import autoAnimate from '@formkit/auto-animate';

export function initAnimations(): void {
  // AutoAnimate en contenedores cuyo contenido cambia dinámicamente
  const animatedContainers = ['cards-grid', 'about-stats'];
  for (const id of animatedContainers) {
    const el = document.getElementById(id);
    if (el) autoAnimate(el);
  }

}
