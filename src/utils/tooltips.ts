/**
 * Tooltips con Tippy.js sobre elementos [data-tippy-content],
 * con tema oscuro coherente con la identidad visual.
 */
import tippy from 'tippy.js';

export function initTooltips(): void {
  tippy('[data-tippy-content]', {
    theme: 'nexora',
    animation: 'shift-away',
    delay: [150, 50],
    touch: ['hold', 400],
  });
}
