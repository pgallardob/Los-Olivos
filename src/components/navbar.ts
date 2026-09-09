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
      <label>
        Imagen (opcional, máx. 5MB)
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
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
        const imageEntry = data.get('image');
        const imageFile = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;

        if (imageFile && imageFile.size > 5 * 1024 * 1024) {
          void Swal.fire({
            title: 'Imagen muy grande',
            text: 'La imagen supera el máximo de 5MB. Elige una más pequeña o envíala sin imagen.',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            background: '#161b17',
            color: '#e4eae6',
            confirmButtonColor: '#6f8b3f',
          });
          return;
        }

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

        const sendRequest = imageFile
          ? fetch(endpoint, {
              method: 'POST',
              headers: { Accept: 'application/json' },
              body: data,
            })
          : fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ name, phone, email, comment }),
            });

        void sendRequest
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

  // Scroll al top absoluto al hacer clic en "Inicio"
  document.querySelectorAll('a[href="#inicio"], a[href="/index.html#inicio"], a[href="/#inicio"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (mobileMenu) mobileMenu.setAttribute('hidden', '');
      if (window.location.pathname.endsWith('/index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.assign('/index.html');
      }
    });
  });

  // CTA "Envianos tu aviso" (navbar)
  document.querySelectorAll('[data-cta="cotizar"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.setAttribute('hidden', '');
      showQuoteDialog();
    });
  });

  // Modal informativo al hacer clic en "Productos" (solo si no estamos ya en productos.html)
  if (!window.location.pathname.endsWith('/productos.html')) {
    document.querySelectorAll('a[href="/productos.html"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (mobileMenu) mobileMenu.setAttribute('hidden', '');
        void Swal.fire({
          title: 'Antes de ir a Productos',
          html: '<p style="font-size:0.95rem;line-height:1.6;text-align:left;margin:0;color:#ffffff">Recuerda que si agregas productos a tu carrito y envías el pedido, este estará disponible para su retiro en la tienda durante <strong style="color:#d4ff5e">2 hrs</strong>.<br><br>El pago solo debes realizarlo al retirar, en <strong style="color:#d4ff5e">efectivo</strong> o con <strong style="color:#d4ff5e">Redcompra</strong>.</p><p style="font-size:1.1rem;text-align:center;margin:1rem 0 0;color:#d4ff5e;font-weight:600">¡Gracias!</p>',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#6f8b3f',
          background: '#161b17',
          color: '#ffffff',
          showCloseButton: true,
          customClass: {
            popup: 'products-info-modal',
            closeButton: 'products-info-close',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.assign('/productos.html');
          }
        });
      });
    });
  }

  // Auto-abrir modal si viene de "Publicar aviso" en avisos.html
  const params = new URLSearchParams(window.location.search);
  if (params.get('aviso') === '1') {
    showQuoteDialog();
  }
}
