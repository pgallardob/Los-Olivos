/**
 * Carrito de pedidos por WhatsApp.
 * Permite al cliente armar un pedido desde el catálogo y enviarlo
 * directamente por WhatsApp al negocio.
 */

import type { Product } from '../data/products';

const WHATSAPP_NUMBER = '56964194547';

interface CartItem {
  product: Product;
  qty: number;
}

const cart = new Map<string, CartItem>();

let floatingBtn: HTMLButtonElement | null = null;
let badge: HTMLSpanElement | null = null;
let panel: HTMLElement | null = null;
let backdrop: HTMLElement | null = null;

/* ============================================================
   UTILIDADES
   ============================================================ */

function getTotalItems(): number {
  let total = 0;
  for (const item of cart.values()) {
    total += item.qty;
  }
  return total;
}

function updateBadge(): void {
  if (!badge) return;
  const count = getTotalItems();
  badge.textContent = String(count);
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ============================================================
   PANEL DEL CARRITO
   ============================================================ */

function openPanel(): void {
  if (!panel || !backdrop) return;
  panel.classList.add('cart-panel--open');
  backdrop.removeAttribute('hidden');
  renderPanelContent();
}

function closePanel(): void {
  if (!panel || !backdrop) return;
  panel.classList.remove('cart-panel--open');
  backdrop.setAttribute('hidden', '');
}

function renderPanelContent(): void {
  if (!panel) return;
  const content = panel.querySelector('.cart-panel-content');
  if (!content) return;

  content.innerHTML = '';

  if (cart.size === 0) {
    const empty = document.createElement('p');
    empty.className = 'cart-empty';
    empty.textContent = 'Tu carrito está vacío. Agrega productos desde el catálogo.';
    content.append(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'cart-list';

  for (const item of cart.values()) {
    list.append(createCartItemRow(item));
  }

  content.append(list);

  const summary = document.createElement('div');
  summary.className = 'cart-summary';

  const totalItems = getTotalItems();
  const totalText = document.createElement('p');
  totalText.className = 'cart-total-items';
  totalText.textContent = `Total de productos: ${totalItems}`;
  summary.append(totalText);

  const sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.className = 'cart-send-btn';
  sendBtn.textContent = 'Enviar pedido por WhatsApp';
  sendBtn.addEventListener('click', sendOrder);
  summary.append(sendBtn);

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'cart-clear-btn';
  clearBtn.textContent = 'Vaciar carrito';
  clearBtn.addEventListener('click', () => {
    cart.clear();
    updateBadge();
    renderPanelContent();
  });
  summary.append(clearBtn);

  content.append(summary);
}

function createCartItemRow(item: CartItem): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'cart-item';

  const info = document.createElement('div');
  info.className = 'cart-item-info';

  const name = document.createElement('span');
  name.className = 'cart-item-name';
  name.textContent = item.product.nombre;
  info.append(name);

  if (item.product.marca) {
    const brand = document.createElement('span');
    brand.className = 'cart-item-brand';
    brand.textContent = item.product.marca;
    info.append(brand);
  }

  li.append(info);

  const controls = document.createElement('div');
  controls.className = 'cart-item-controls';

  const minusBtn = document.createElement('button');
  minusBtn.type = 'button';
  minusBtn.className = 'cart-qty-btn';
  minusBtn.textContent = '−';
  minusBtn.setAttribute('aria-label', 'Disminuir cantidad');
  minusBtn.addEventListener('click', () => {
    if (item.qty > 1) {
      item.qty--;
    } else {
      cart.delete(item.product.id);
    }
    updateBadge();
    renderPanelContent();
  });

  const qtyDisplay = document.createElement('span');
  qtyDisplay.className = 'cart-qty-display';
  qtyDisplay.textContent = String(item.qty);

  const plusBtn = document.createElement('button');
  plusBtn.type = 'button';
  plusBtn.className = 'cart-qty-btn';
  plusBtn.textContent = '+';
  plusBtn.setAttribute('aria-label', 'Aumentar cantidad');
  plusBtn.addEventListener('click', () => {
    item.qty++;
    updateBadge();
    renderPanelContent();
  });

  controls.append(minusBtn, qtyDisplay, plusBtn);
  li.append(controls);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'cart-remove-btn';
  removeBtn.textContent = '✕';
  removeBtn.setAttribute('aria-label', 'Eliminar del carrito');
  removeBtn.addEventListener('click', () => {
    cart.delete(item.product.id);
    updateBadge();
    renderPanelContent();
  });
  li.append(removeBtn);

  return li;
}

/* ============================================================
   ENVÍO POR WHATSAPP
   ============================================================ */

function sendOrder(): void {
  if (cart.size === 0) return;

  const lines: string[] = ['¡Hola! Quiero hacer el siguiente pedido:'];

  for (const item of cart.values()) {
    const label = item.product.marca
      ? `${item.qty}x ${item.product.nombre} (${item.product.marca})`
      : `${item.qty}x ${item.product.nombre}`;
    lines.push(`- ${label}`);
  }

  lines.push(``, `Total de productos: ${getTotalItems()}`, ``, `Gracias!`);

  const message = encodeURIComponent(lines.join('\n'));
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ============================================================
   API PÚBLICA
   ============================================================ */

export function addToCart(product: Product): void {
  const existing = cart.get(product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.set(product.id, { product, qty: 1 });
  }
  updateBadge();

  if (floatingBtn) {
    floatingBtn.classList.add('cart-fab--pulse');
    setTimeout(() => floatingBtn?.classList.remove('cart-fab--pulse'), 300);
  }
}

export function initCart(): void {
  const fabContainer = document.getElementById('cart-fab');
  const panelEl = document.getElementById('cart-panel');
  const backdropEl = document.getElementById('cart-panel-backdrop');

  if (!fabContainer || !panelEl || !backdropEl) return;

  floatingBtn = fabContainer as HTMLButtonElement;
  panel = panelEl;
  backdrop = backdropEl;

  badge = document.createElement('span');
  badge.className = 'cart-fab-badge';
  badge.style.display = 'none';
  floatingBtn.append(badge);

  floatingBtn.addEventListener('click', openPanel);
  backdropEl.addEventListener('click', closePanel);

  const closeBtn = panelEl.querySelector('.cart-panel-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel?.classList.contains('cart-panel--open')) {
      closePanel();
    }
  });
}
