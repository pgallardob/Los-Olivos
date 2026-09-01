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
  id: number;
  name: string;
  phone: string;
  email: string;
  comment: string;
  date?: string;
  created_at?: string;
  expiresAt?: string;
  expires_at?: string;
  likes?: number;
  loves?: number;
  image_url?: string | null;
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

const REACTIONS_KEY = 'olivos-avisos-reactions';

type ReactionState = Record<string, { like?: boolean; love?: boolean }>;

function loadReactions(): ReactionState {
  try {
    const raw = localStorage.getItem(REACTIONS_KEY);
    return raw ? (JSON.parse(raw) as ReactionState) : {};
  } catch {
    return {};
  }
}

function saveReactions(state: ReactionState): void {
  try {
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
}

function isActive(reactions: ReactionState, avisoId: number, type: 'like' | 'love'): boolean {
  return Boolean(reactions[String(avisoId)]?.[type]);
}

function setReactionState(
  reactions: ReactionState,
  avisoId: number,
  type: 'like' | 'love',
  active: boolean
): ReactionState {
  const id = String(avisoId);
  const next = { ...reactions, [id]: { ...reactions[id], [type]: active } };
  saveReactions(next);
  return next;
}

async function postReaction(avisoId: number, type: 'like' | 'love', action: 'add' | 'remove') {
  try {
    const res = await fetch(`${API_BASE}/api/avisos/${avisoId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, action }),
    });
    if (!res.ok) return null;
    return (await res.json()) as { likes: number; loves: number };
  } catch (err) {
    console.error('Error al enviar reacción:', err);
    return null;
  }
}

function createReactionButton(
  aviso: Aviso,
  type: 'like' | 'love',
  reactions: ReactionState
): { container: HTMLElement; countEl: HTMLElement } {
  const container = document.createElement('button');
  container.type = 'button';
  container.className = `reaction-btn reaction-btn--${type}`;
  container.setAttribute('aria-pressed', 'false');

  const icon = document.createElement('span');
  icon.className = 'reaction-btn__icon';
  icon.innerHTML =
    type === 'like'
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  const count = document.createElement('span');
  count.className = 'reaction-btn__count';
  count.textContent = String(aviso[type === 'like' ? 'likes' : 'loves'] ?? 0);

  const label = document.createElement('span');
  label.className = 'reaction-btn__label';
  label.textContent = type === 'like' ? 'Me gusta' : 'Me encanta';

  container.appendChild(icon);
  container.appendChild(count);
  container.appendChild(label);

  const active = isActive(reactions, aviso.id, type);
  if (active) {
    container.classList.add('reaction-btn--active');
    container.setAttribute('aria-pressed', 'true');
  }

  return { container, countEl: count };
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function loadAvisos(): Promise<void> {
  const container = document.getElementById('avisos-list');

  if (!container) return;

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        container.innerHTML = `<p class="avisos-loading">Reintentando (${attempt}/${maxRetries})…</p>`;
      }

      const res = await fetchWithTimeout(`${API_BASE}/api/avisos`, 60000);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const avisos: Aviso[] = await res.json();

      if (avisos.length === 0) {
        container.innerHTML = '<p class="avisos-empty">No hay avisos publicados todavía.</p>';
        return;
      }

      container.innerHTML = '';

      let reactions = loadReactions();

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

        const content = document.createElement('div');
        content.className = 'aviso-card-content';

        if (aviso.image_url) {
          const figure = document.createElement('figure');
          figure.className = 'aviso-card-figure';

          const img = document.createElement('img');
          img.className = 'aviso-card-image';
          img.src = aviso.image_url;
          img.alt = `Imagen del aviso de ${aviso.name}`;
          img.loading = 'lazy';
          img.decoding = 'async';

          figure.appendChild(img);
          content.appendChild(figure);
        }

        const text = document.createElement('div');
        text.className = 'aviso-card-text';
        text.appendChild(header);

        const body = document.createElement('p');
        body.className = 'aviso-card-body';
        body.textContent = aviso.comment;
        text.appendChild(body);

        content.appendChild(text);
        card.appendChild(content);

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

        const reactionsEl = document.createElement('div');
        reactionsEl.className = 'aviso-reactions';

        const likeBtn = createReactionButton(aviso, 'like', reactions);
        const loveBtn = createReactionButton(aviso, 'love', reactions);

        likeBtn.container.addEventListener('click', async () => {
          const currently = isActive(loadReactions(), aviso.id, 'like');
          const next = !currently;
          reactions = setReactionState(reactions, aviso.id, 'like', next);
          likeBtn.container.classList.toggle('reaction-btn--active', next);
          likeBtn.container.setAttribute('aria-pressed', String(next));

          const action: 'add' | 'remove' = next ? 'add' : 'remove';
          const result = await postReaction(aviso.id, 'like', action);
          if (result) {
            likeBtn.countEl.textContent = String(result.likes);
            loveBtn.countEl.textContent = String(result.loves);
          } else {
            likeBtn.countEl.textContent = String(
              (aviso.likes ?? 0) + (next ? 1 : currently ? -1 : 0)
            );
          }
        });

        loveBtn.container.addEventListener('click', async () => {
          const currently = isActive(loadReactions(), aviso.id, 'love');
          const next = !currently;
          reactions = setReactionState(reactions, aviso.id, 'love', next);
          loveBtn.container.classList.toggle('reaction-btn--active', next);
          loveBtn.container.setAttribute('aria-pressed', String(next));

          const action: 'add' | 'remove' = next ? 'add' : 'remove';
          const result = await postReaction(aviso.id, 'love', action);
          if (result) {
            likeBtn.countEl.textContent = String(result.likes);
            loveBtn.countEl.textContent = String(result.loves);
          } else {
            loveBtn.countEl.textContent = String(
              (aviso.loves ?? 0) + (next ? 1 : currently ? -1 : 0)
            );
          }
        });

        reactionsEl.appendChild(likeBtn.container);
        reactionsEl.appendChild(loveBtn.container);
        card.appendChild(reactionsEl);

        container.appendChild(card);
      }

      return;
    } catch (err) {
      console.error(`Error al cargar avisos (intento ${attempt}):`, err);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  container.innerHTML =
    '<p class="avisos-error">No se pudieron cargar los avisos. Intenta más tarde.</p>';
}

loadAvisos();
