/**
 * Chatbot widget para Comercializadora Los Olivos.
 * Se integra en la landing page y comunica con el backend Express.
 * El frontend nunca conoce API keys ni Supabase.
 */

const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:3002/api';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

const ICON_CHAT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const ICON_SEND = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

export function initChatbot(): void {
  const container = document.createElement('div');
  container.className = 'nx-chatbot';
  container.innerHTML = `
    <button class="nx-chatbot__toggle" aria-label="Abrir chat">
      ${ICON_CHAT}
      <span class="nx-chatbot__toggle-badge nx-chatbot__toggle-badge--visible"></span>
    </button>
    <div class="nx-chatbot__window" role="dialog" aria-label="Chat de asistencia">
      <div class="nx-chatbot__header">
        <div class="nx-chatbot__header-info">
          <div>
            <p class="nx-chatbot__header-title">Asistente Los Olivos</p>
            <span class="nx-chatbot__header-status">En línea</span>
          </div>
        </div>
        <button class="nx-chatbot__close" aria-label="Cerrar chat">${ICON_CLOSE}</button>
      </div>
      <div class="nx-chatbot__messages"></div>
      <div class="nx-chatbot__typing"><span></span><span></span><span></span></div>
      <div class="nx-chatbot__input-area">
        <input
          type="text"
          class="nx-chatbot__input"
          placeholder="Escribe tu consulta..."
          maxlength="500"
          aria-label="Mensaje del chat"
        />
        <button class="nx-chatbot__send" aria-label="Enviar mensaje">${ICON_SEND}</button>
      </div>
    </div>
  `;

  document.body.append(container);

  const toggleBtn = container.querySelector<HTMLButtonElement>('.nx-chatbot__toggle')!;
  const closeBtn = container.querySelector<HTMLButtonElement>('.nx-chatbot__close')!;
  const window = container.querySelector<HTMLDivElement>('.nx-chatbot__window')!;
  const messagesEl = container.querySelector<HTMLDivElement>('.nx-chatbot__messages')!;
  const typingEl = container.querySelector<HTMLDivElement>('.nx-chatbot__typing')!;
  const input = container.querySelector<HTMLInputElement>('.nx-chatbot__input')!;
  const sendBtn = container.querySelector<HTMLButtonElement>('.nx-chatbot__send')!;
  const badge = container.querySelector<HTMLSpanElement>('.nx-chatbot__toggle-badge')!;

  let isOpen = false;
  let isSending = false;
  let hasInteracted = false;

  const messages: ChatMessage[] = [];

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function linkify(text: string): string {
    const escaped = escapeHtml(text);
    return escaped.replace(
      /(https?:\/\/[^\s<]+)/g,
      (url) => {
        const linkText = url.includes('maps') ? 'Cómo Llegar' : url;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--nx-olive-light); text-decoration: underline;">${linkText}</a>`;
      }
    );
  }

  function addMessage(role: 'bot' | 'user', text: string): void {
    const msg = document.createElement('div');
    msg.className = `nx-chatbot__msg nx-chatbot__msg--${role}`;
    msg.innerHTML = linkify(text);
    messagesEl.append(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    messages.push({ role, text });
  }

  function addErrorMessage(text: string): void {
    const msg = document.createElement('div');
    msg.className = 'nx-chatbot__msg nx-chatbot__msg--error';
    msg.textContent = text;
    messagesEl.append(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping(): void {
    typingEl.classList.add('nx-chatbot__typing--visible');
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping(): void {
    typingEl.classList.remove('nx-chatbot__typing--visible');
  }

  function openChat(): void {
    isOpen = true;
    window.classList.add('nx-chatbot__window--open');
    badge.classList.remove('nx-chatbot__toggle-badge--visible');
    input.focus();

    if (!hasInteracted) {
      hasInteracted = true;
      addMessage('bot', '¡Hola! Soy el asistente virtual de Comercializadora Los Olivos. Puedo ayudarte con precios, stock y información del negocio. ¿Qué necesitas?');
    }
  }

  function closeChat(): void {
    isOpen = false;
    window.classList.remove('nx-chatbot__window--open');
  }

  toggleBtn.addEventListener('click', () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener('click', closeChat);

  async function sendMessage(): Promise<void> {
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    sendBtn.disabled = true;
    input.value = '';

    addMessage('user', text);
    showTyping();

    try {
      const res = await fetch(`${CHATBOT_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
        }),
      });

      hideTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error de conexión' }));
        addErrorMessage(err.error || 'Error de conexión');
      } else {
        const data = await res.json();
        addMessage('bot', data.reply || 'No tengo una respuesta en este momento.');
      }
    } catch {
      hideTyping();
      addErrorMessage('No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  });
}
