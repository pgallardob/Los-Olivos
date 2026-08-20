/**
 * Cards: renderiza tarjetas reutilizables desde datos tipados (api.ts).
 * Cada card: imagen + categoría + icono + título + descripción + CTA.
 */
import Swal from 'sweetalert2';
import { getCards, type CardItem } from '../services/api';

function renderCard(item: CardItem): HTMLElement {
  const card = document.createElement('article');
  card.className = 'card';

  const image = document.createElement('img');
  image.className = 'card-image';
  image.src = item.image;
  image.alt = item.imageAlt;
  image.loading = 'lazy';
  image.decoding = 'async';

  const body = document.createElement('div');
  body.className = 'card-body';

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  if (item.category) {
    const badge = document.createElement('sl-badge');
    badge.setAttribute('variant', 'primary');
    badge.setAttribute('pill', '');
    badge.textContent = item.category;
    meta.append(badge);
  }

  if (item.icon) {
    const icon = document.createElement('span');
    icon.className = 'card-icon';
    const iconNode = document.createElement('i');
    iconNode.setAttribute('data-lucide', item.icon);
    iconNode.setAttribute('aria-hidden', 'true');
    icon.append(iconNode);
    meta.append(icon);
  }

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = item.title;

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = item.description;

  const cta = document.createElement('sl-button');
  cta.className = 'card-cta';
  cta.setAttribute('variant', 'default');
  cta.setAttribute('size', 'small');
  cta.setAttribute('data-tippy-content', `Más información sobre ${item.title}`);
  cta.textContent = item.ctaLabel;
  cta.addEventListener('click', () => {
    void Swal.fire({
      title: item.title,
      text: `${item.description} `,
      imageUrl: item.image,
      imageAlt: item.imageAlt,
      width: 'auto',
      customClass: {
        popup: 'card-modal',
        image: 'card-modal-image',
      },
      confirmButtonText: 'Cerrar',
      background: '#161b17',
      color: '#e4eae6',
      confirmButtonColor: '#6f8b3f',
    });
  });

  if (meta.childNodes.length) {
    body.append(meta);
  }
  body.append(title, description, cta);
  card.append(image, body);
  return card;
}

export async function initCards(): Promise<void> {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  const cards = await getCards();
  grid.append(...cards.map(renderCard));
}
