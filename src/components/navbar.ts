/**
 * Navbar: menú móvil desplegable inline y CTA de aviso con SweetAlert2.
 */
import Swal from 'sweetalert2';

function showQuoteDialog(): void {
  const formHtml = `
    <form id="quote-form" class="quote-form">
      <label>
        Nombre
        <input type="text" name="name" required autocomplete="name" />
      </label>
      <label>
        Teléfono
        <input type="tel" name="phone" required autocomplete="tel" />
      </label>
      <label>
        Email
        <input type="email" name="email" required autocomplete="email" />
      </label>
      <label>
        Aviso
        <textarea name="comment" rows="3" required></textarea>
      </label>
      <div class="quote-form-actions">
        <button type="submit" class="quote-form-submit">Enviar</button>
        <button type="button" class="quote-form-cancel" id="quote-cancel">Salir</button>
      </div>
    </form>
  `;

  void Swal.fire({
    title: 'Envíanos tu aviso',
    html: formHtml,
    showConfirmButton: false,
    showCancelButton: false,
    showCloseButton: true,
    background: '#161b17',
    color: '#e4eae6',
    width: '40rem',
    heightAuto: false,
    customClass: {
      popup: 'quote-modal',
      container: 'quote-modal-container',
      closeButton: 'quote-modal-close',
    },
    didOpen: () => {
      const form = document.getElementById('quote-form') as HTMLFormElement | null;
      const cancelButton = document.getElementById('quote-cancel');

      form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
        const data = new FormData(form);
        const name = String(data.get('name') ?? '');
        const phone = String(data.get('phone') ?? '');
        const email = String(data.get('email') ?? '');
        const comment = String(data.get('comment') ?? '');

        if (!endpoint) {
          const fallbackEmail = import.meta.env.VITE_FALLBACK_EMAIL as string || 'pgallardob@hotmail.com';
          const subject = encodeURIComponent('Nuevo aviso - Comercializadora Los Olivos');
          const body = encodeURIComponent(
            `Nombre: ${name}\nTeléfono: ${phone}\nEmail: ${email}\n\nAviso:\n${comment}`,
          );
          window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
          void Swal.fire({
            title: 'Mensaje enviado',
            text: 'Tu mensaje fue enviado exitosamente, lo revisaremos y si cumple con nuestras politicas lo publicaremos de inmediato.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            background: '#161b17',
            color: '#e4eae6',
            confirmButtonColor: '#6f8b3f',
          });
          return;
        }

        void fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name, phone, email, comment }),
        })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            void Swal.fire({
              title: 'Enviado',
              text: 'Tu mensaje fue enviado exitosamente, lo revisaremos y si cumple con nuestras politicas lo publicaremos de inmediato.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              background: '#161b17',
              color: '#e4eae6',
              confirmButtonColor: '#6f8b3f',
            });
            form.reset();
          })
          .catch((err) => {
            console.error('Error al enviar aviso:', err);
            void Swal.fire({
              title: 'Error',
              text: 'No se pudo enviar el mensaje. Intenta más tarde.',
              icon: 'error',
              confirmButtonText: 'Entendido',
              background: '#161b17',
              color: '#e4eae6',
              confirmButtonColor: '#6f8b3f',
            });
          });
      });

      cancelButton?.addEventListener('click', () => Swal.close());
    },
  });
}

export function initNavbar(): void {
  const mobileMenu = document.getElementById('navbar-mobile-menu');
  const toggle = document.getElementById('navbar-toggle');

  // Toggle menú móvil
  toggle?.addEventListener('click', () => {
    if (!mobileMenu) return;
    const isHidden = mobileMenu.hasAttribute('hidden');
    if (isHidden) {
      mobileMenu.removeAttribute('hidden');
    } else {
      mobileMenu.setAttribute('hidden', '');
    }
  });

  // Cerrar el menú al agrandar la pantalla a escritorio
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992 && mobileMenu && !mobileMenu.hasAttribute('hidden')) {
      mobileMenu.setAttribute('hidden', '');
    }
  });

  // Cerrar el menú al navegar
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.setAttribute('hidden', '');
    });
  });

  // CTA "Envianos tu aviso" (navbar)
  document.querySelectorAll('[data-cta="cotizar"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.setAttribute('hidden', '');
      showQuoteDialog();
    });
  });

  // Auto-abrir modal si viene de "Publicar aviso" en avisos.html
  const params = new URLSearchParams(window.location.search);
  if (params.get('aviso') === '1') {
    showQuoteDialog();
  }
}
