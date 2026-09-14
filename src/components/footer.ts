
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
    contactItem(Mail, company.email, '#contact-modal'),
  );

  // ─── Modal de contacto directo (envía email sin publicar en la web) ───
  const contactLink = contactList?.querySelector<HTMLAnchorElement>('a[href="#contact-modal"]');
  contactLink?.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
  });

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

function openContactModal(): void {
  const endpoint = import.meta.env.VITE_AVISOS_API_URL
    ? `${import.meta.env.VITE_AVISOS_API_URL}/api/contacto`
    : 'https://los-olivos-avisos.onrender.com/api/contacto';

  void Swal.fire({
    title: 'Contáctanos',
    html: `
      <style>
        .swal2-popup { border-radius: 12px; }
        .swal2-title { font-size: 1.4rem; margin-bottom: 1rem; }
        #swal-name, #swal-phone, #swal-email, #swal-message {
          width: 100%;
          max-width: 320px;
          margin: 0.5rem auto;
          display: block;
          background: #1a201a;
          border: 1px solid #3a4a2a;
          border-radius: 8px;
          color: #e4eae6;
          padding: 0.6rem 0.8rem;
          font-size: 0.9rem;
          box-shadow: none;
        }
        #swal-name:focus, #swal-phone:focus, #swal-email:focus, #swal-message:focus {
          border-color: #6f8b3f;
          box-shadow: 0 0 0 2px rgba(111,139,63,0.2);
        }
        #swal-message { min-height: 80px; resize: vertical; }
        .swal2-input::placeholder, .swal2-textarea::placeholder { color: #7a8a6a; }
        .swal2-validation-message { background: #2a1a1a; color: #e4eae6; border-radius: 6px; }
      </style>
      <input id="swal-name" class="swal2-input" placeholder="Nombre *" maxlength="80">
      <div style="display:flex;max-width:320px;margin:0.5rem auto;gap:0.4rem;">
        <span style="display:flex;align-items:center;background:#1a201a;border:1px solid #3a4a2a;border-radius:8px;padding:0.6rem 0.5rem;font-size:0.9rem;color:#7a8a6a;white-space:nowrap;">+56</span>
        <input id="swal-phone" class="swal2-input" placeholder="9 1234 5678" maxlength="10" style="flex:1;margin:0;">
      </div>
      <input id="swal-email" class="swal2-input" type="email" placeholder="Email *" maxlength="120">
      <textarea id="swal-message" class="swal2-textarea" placeholder="Mensaje *" maxlength="500" rows="4"></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    background: '#161b17',
    color: '#e4eae6',
    confirmButtonColor: '#6f8b3f',
    cancelButtonColor: '#555',
    width: '26rem',
    preConfirm: async () => {
      const name = (document.getElementById('swal-name') as HTMLInputElement).value.trim();
      const phone = (document.getElementById('swal-phone') as HTMLInputElement).value.trim();
      const email = (document.getElementById('swal-email') as HTMLInputElement).value.trim();
      const message = (document.getElementById('swal-message') as HTMLTextAreaElement).value.trim();

      if (!name || !email || !message) {
        Swal.showValidationMessage('Nombre, email y mensaje son obligatorios');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Swal.showValidationMessage('El email no es válido');
        return false;
      }

      if (phone) {
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 9 || phoneDigits.length > 10) {
          Swal.showValidationMessage('El teléfono debe tener 9 dígitos (ej: 9 1234 5678)');
          return false;
        }
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone: phone ? `+56 ${phone}` : '', email, message }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al enviar');
        }
        return true;
      } catch (err) {
        Swal.showValidationMessage(`Error: ${err instanceof Error ? err.message : 'No se pudo enviar'}`);
        return false;
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      void Swal.fire({
        title: 'Mensaje enviado',
        text: 'Gracias por contactarnos. Te responderemos a la brevedad.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        background: '#161b17',
        color: '#e4eae6',
        confirmButtonColor: '#6f8b3f',
      });
    }
  });
}
