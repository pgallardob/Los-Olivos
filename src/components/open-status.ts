/**
 * Indicador "Abierto ahora" en tiempo real.
 * Calcula según la hora local del cliente si el local está abierto
 * basándose en el horario: Lun–Sab 10:00–20:00 hrs.
 */

const OPEN_HOUR = 10;
const CLOSE_HOUR = 20;
const OPEN_DAYS = [1, 2, 3, 4, 5, 6]; // Lun–Sab (0=Domingo)

function isOpenNow(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  if (!OPEN_DAYS.includes(day)) return false;
  if (hour < OPEN_HOUR || hour >= CLOSE_HOUR) return false;
  return true;
}

function createStatusBadge(): HTMLElement {
  const open = isOpenNow();
  const badge = document.createElement('div');
  badge.className = `open-status ${open ? 'open-status--open' : 'open-status--closed'}`;
  badge.setAttribute('data-short', open ? 'Abierto' : 'Cerrado');

  const dot = document.createElement('span');
  dot.className = 'open-status-dot';
  badge.append(dot);

  const text = document.createElement('span');
  text.className = 'open-status-text';
  text.textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
  badge.append(text);

  return badge;
}

export function initOpenStatus(): void {
  const navbarActions = document.querySelector('.navbar-actions');
  if (!navbarActions) return;

  const badge = createStatusBadge();
  navbarActions.prepend(badge);

  // Actualizar cada minuto
  setInterval(() => {
    const current = document.querySelector('.open-status');
    if (!current) return;
    const open = isOpenNow();
    current.className = `open-status ${open ? 'open-status--open' : 'open-status--closed'}`;
    current.setAttribute('data-short', open ? 'Abierto' : 'Cerrado');
    const textEl = current.querySelector('.open-status-text');
    if (textEl) textEl.textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
  }, 60000);
}
