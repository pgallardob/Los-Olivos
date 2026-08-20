
import Swal from 'sweetalert2';
import { createElement, MapPin, Phone, Mail, type IconNode } from 'lucide';
import { getCompanyInfo } from '../services/api';

const SOCIAL_ICON_BASE = 'https://cdn.simpleicons.org';

const SOCIAL_COLORS: Record<string, string> = {
  instagram: 'E4405F',
  tiktok: '010101',
  whatsapp: '25D366',
  facebook: '1877F2',
};

function socialIconUrl(slug: string, color = 'e4eae6'): string {
  return `${SOCIAL_ICON_BASE}/${slug}/${color}`;
}

function iconSvg(icon: IconNode, size = 18): SVGElement {
  const svg = createElement(icon);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  return svg;
}

function contactItem(icon: IconNode, text: string, href?: string): HTMLLIElement {
  const li = document.createElement('li');
  li.append(iconSvg(icon));
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    li.append(link);
  } else {
    li.append(document.createTextNode(text));
  }
  return li;
}

function addressItem(address: string): HTMLLIElement {
  const li = document.createElement('li');
  li.style.cursor = 'pointer';
  li.append(iconSvg(MapPin));

  const link = document.createElement('a');
  link.href = '#';
  link.textContent = address;
  link.style.color = 'var(--nx-metal)';
  link.style.textDecoration = 'underline';
  link.style.textDecorationStyle = 'dotted';
  link.style.textUnderlineOffset = '0.2rem';

  link.addEventListener('click', (e) => {
    e.preventDefault();
    const query = encodeURIComponent(address);
    const embedSrc = `https://www.google.com/maps?q=${query}&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

    void Swal.fire({
      title: 'Cómo llegar',
      html: `
        <iframe
          src="${embedSrc}"
          width="100%"
          height="320"
          style="border:0;border-radius:8px;"
          loading="lazy"
          allowfullscreen
        ></iframe>
        <a
          href="${directionsUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="display:inline-block;margin-top:0.75rem;color:var(--nx-olive-light);text-decoration:none;font-size:0.85rem;"
        >
          Abrir en Google Maps →
        </a>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      background: '#161b17',
      color: '#e4eae6',
      confirmButtonColor: '#6f8b3f',
      width: '32rem',
    });
  });

  li.append(link);
  return li;
}

function phoneItem(numbersText: string): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'phone-item';
  li.append(iconSvg(Phone));

  const stack = document.createElement('div');
  stack.className = 'phone-stack';
  const numbers = numbersText
    .split('-')
    .map((n) => n.trim())
    .filter(Boolean);

  for (const num of numbers) {
    const link = document.createElement('a');
    link.href = `tel:${num.replace(/\s/g, '')}`;
    link.textContent = num;
    stack.append(link);
  }

  li.append(stack);
  return li;
}

export async function initFooter(): Promise<void> {
  const company = await getCompanyInfo();

  const description = document.getElementById('footer-description');
  if (description) description.textContent = company.tagline;

  const hours = document.getElementById('footer-hours');
  if (hours) hours.textContent = company.hours;

  const contactList = document.getElementById('footer-contact-list');
  contactList?.append(
    addressItem(company.address),
    phoneItem(company.phone),
    contactItem(Mail, company.email, `mailto:${company.email}`),
  );

  function renderSocials(
    container: Element | null,
    socials: { name: string; icon: string; url: string; image?: string }[],
  ): void {
    if (!container) return;

    for (const social of socials) {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', social.name);
      button.setAttribute('data-social', social.name.toLowerCase());
      button.setAttribute('data-tippy-content', social.name);

      if (social.image) {
        const img = document.createElement('img');
        img.src = social.image;
        img.alt = social.name;
        img.loading = 'lazy';
        button.append(img);
      } else if (social.icon) {
        const brandColor = SOCIAL_COLORS[social.icon] ?? 'e4eae6';
        const img = document.createElement('img');
        img.src = socialIconUrl(social.icon, brandColor);
        img.alt = social.name;
        img.width = 24;
        img.height = 24;
        img.loading = 'lazy';
        button.append(img);
      }

      button.addEventListener('click', () => {
        if (social.url) {
          window.open(social.url, '_blank', 'noopener,noreferrer');
        } else {
          void Swal.fire({
            title: social.name,
            text: 'Enlace pendiente de configurar. [PLACEHOLDER: definir URL real en .env]',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            background: '#161b17',
            color: '#e4eae6',
            confirmButtonColor: '#6f8b3f',
          });
        }
      });

      li.append(button);
      container.append(li);
    }
  }

  renderSocials(document.querySelector('.footer-social--brand'), company.socials);
  renderSocials(document.querySelector('.footer-social--links'), company.linksSocials);

  const copyright = document.getElementById('footer-copyright');
  if (copyright) {
    copyright.textContent = `© ${new Date().getFullYear()} ${company.name}. Todos los derechos reservados. Desarrollado por P.Gallardo.`;
  }
}
