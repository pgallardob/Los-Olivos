/**
 * Punto de entrada para la página de avisos.
 * Carga estilos y renderiza los avisos desde el backend.
 * Muestra contador regresivo de vigencia (30 días) en cada card.
 */
import '@picocss/pico/css/pico.min.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import './styles/theme.css';

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/');

document.body.classList.add('styles-ready');

const API_BASE = import.meta.env.VITE_AVISOS_API_URL || 'http://localhost:3001';

interface Aviso {
  name: string;
  phone: string;
  email: string;
  comment: string;
  date?: string;
  created_at?: string;
  expiresAt?: string;
  expires_at?: string;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Expirado';

  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((ms % (60 * 1000)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function startCountdown(el: HTMLElement, expiresAt: string): void {
  const expiry = new Date(expiresAt).getTime();

  function tick() {
    const remaining = expiry - Date.now();

    if (remaining <= 0) {
      el.textContent = 'Expirado';
      el.classList.add('aviso-countdown--expired');
      return;
    }

    el.textContent = `Vigencia: ${formatRemaining(remaining)}`;
    setTimeout(tick, 1000);
  }

  tick();
}

async function loadAvisos(): Promise<void> {
  const container = document.getElementById('avisos-list');

  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/avisos`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const avisos: Aviso[] = await res.json();

    if (avisos.length === 0) {
      container.innerHTML = '<p class="avisos-empty">No hay avisos publicados todavía.</p>';
      return;
    }

    container.innerHTML = '';

    for (const aviso of avisos) {
      const card = document.createElement('article');
      card.className = 'aviso-card';

      const header = document.createElement('div');
      header.className = 'aviso-card-header';

      const name = document.createElement('h3');
      name.className = 'aviso-card-name';
      name.textContent = aviso.name;
      header.appendChild(name);

      const email = document.createElement('span');
      email.className = 'aviso-card-email';
      email.textContent = aviso.email;
      header.appendChild(email);

      card.appendChild(header);

      const body = document.createElement('p');
      body.className = 'aviso-card-body';
      body.textContent = aviso.comment;
      card.appendChild(body);

      const footer = document.createElement('div');
      footer.className = 'aviso-card-footer';

      const dateStr = aviso.date || aviso.created_at;
      if (dateStr) {
        const date = document.createElement('time');
        date.className = 'aviso-card-date';
        const d = new Date(dateStr);
        date.textContent = d.toLocaleDateString('es-CL', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        footer.appendChild(date);
      }

      const expiresStr = aviso.expiresAt || aviso.expires_at;
      if (expiresStr) {
        const countdown = document.createElement('span');
        countdown.className = 'aviso-countdown';
        footer.appendChild(countdown);
        startCountdown(countdown, expiresStr);
      }

      card.appendChild(footer);

      container.appendChild(card);
    }
  } catch (err) {
    console.error('Error al cargar avisos:', err);
    container.innerHTML =
      '<p class="avisos-error">No se pudieron cargar los avisos. Intenta más tarde.</p>';
  }
}

loadAvisos();
