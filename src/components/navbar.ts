/**
 * Navbar: menú móvil desplegable inline y CTA de aviso con SweetAlert2.
 */
import Swal from 'sweetalert2';

interface AvisoDraft {
  name: string;
  phone: string;
  email: string;
  comment: string;
  image: File | null;
}

const SWAL_DARK = {
  background: '#161b17',
  color: '#e4eae6',
  confirmButtonColor: '#6f8b3f',
} as const;

function showSuccessDialog(): void {
  void Swal.fire({
    title: 'Enviado',
    text: 'Tu mensaje fue enviado exitosamente, lo revisaremos y si cumple con nuestras politicas lo publicaremos de inmediato.',
    icon: 'success',
    confirmButtonText: 'Aceptar',
    ...SWAL_DARK,
  });
}

function showErrorDialog(): void {
  void Swal.fire({
    title: 'Error',
    text: 'No se pudo enviar el mensaje. Intenta más tarde.',
    icon: 'error',
    confirmButtonText: 'Entendido',
    ...SWAL_DARK,
  });
}

async function sendAviso(draft: AvisoDraft): Promise<void> {
  const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;

  if (!endpoint) {
    const fallbackEmail = (import.meta.env.VITE_FALLBACK_EMAIL as string) || 'pgallardob@hotmail.com';
    const subject = encodeURIComponent('Nuevo aviso - Comercializadora Los Olivos');
    const body = encodeURIComponent(
      `Nombre: ${draft.name}\nTeléfono: ${draft.phone}\nEmail: ${draft.email}\n\nAviso:\n${draft.comment}`
    );
    window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
    showSuccessDialog();
    return;
  }

  void Swal.fire({
    title: 'Enviando tu aviso…',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
    ...SWAL_DARK,
  });

  try {
    let sendPromise: Promise<Response>;

    if (draft.image) {
      const data = new FormData();
      data.set('name', draft.name);
      data.set('phone', draft.phone);
      data.set('email', draft.email);
      data.set('comment', draft.comment);
      data.set('image', draft.image);
      sendPromise = fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
    } else {
      sendPromise = fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          phone: draft.phone,
          email: draft.email,
          comment: draft.comment,
        }),
      });
    }

    const res = await sendPromise;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showSuccessDialog();
  } catch (err) {
    console.error('Error al enviar aviso:', err);
    showErrorDialog();
  }
}

function showPreview(draft: AvisoDraft): void {
  const imageUrl = draft.image ? URL.createObjectURL(draft.image) : null;
  let pendingAction: 'edit' | 'send' | null = null;

  const container = document.createElement('div');
  container.className = 'aviso-preview';

  // Réplica exacta de la card que se publica en avisos.html
  const card = document.createElement('article');
  card.className = 'aviso-card aviso-preview__card';

  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'aviso-preview__image';
    img.src = imageUrl;
    img.alt = 'Imagen del aviso';
    card.appendChild(img);
  }

  const text = document.createElement('div');
  text.className = 'aviso-preview__text';

  const header = document.createElement('div');
  header.className = 'aviso-card-header';
  const nameEl = document.createElement('h3');
  nameEl.className = 'aviso-card-name';
  nameEl.textContent = draft.name;
  const emailEl = document.createElement('span');
  emailEl.className = 'aviso-card-email';
  emailEl.textContent = draft.email;
  header.appendChild(nameEl);
  header.appendChild(emailEl);

  const bodyEl = document.createElement('p');
  bodyEl.className = 'aviso-card-body';
  bodyEl.textContent = draft.comment;

  text.appendChild(header);
  text.appendChild(bodyEl);
  card.appendChild(text);
  container.appendChild(card);

  const note = document.createElement('p');
  note.className = 'aviso-preview__note';
  note.textContent = 'Así se verá tu aviso en la página (30 días de vigencia).';
  container.appendChild(note);

  const actions = document.createElement('div');
  actions.className = 'quote-form-actions';
  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'quote-form-cancel';
  editBtn.textContent = '← Seguir editando';
  const sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.className = 'quote-form-submit';
  sendBtn.textContent = 'Enviar ahora';
  actions.appendChild(editBtn);
  actions.appendChild(sendBtn);
  container.appendChild(actions);

  void Swal.fire({
    title: 'Vista previa de tu aviso',
    html: container,
    showConfirmButton: false,
    showCancelButton: false,
    showCloseButton: true,
    background: '#161b17',
    color: '#e4eae6',
    width: '34rem',
    heightAuto: false,
    customClass: {
      popup: 'quote-modal',
      container: 'quote-modal-container',
      closeButton: 'quote-modal-close',
    },
    didOpen: () => {
      editBtn.addEventListener('click', () => {
        pendingAction = 'edit';
        void Swal.close();
      });
      sendBtn.addEventListener('click', () => {
        pendingAction = 'send';
        void Swal.close();
      });
    },
  }).then(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (pendingAction === 'send') {
      void sendAviso(draft);
    } else {
      // "Seguir editando" o cierre (Esc / ✗): volver al formulario sin perder datos
      showQuoteDialog(draft);
    }
  });
}

function showQuoteDialog(draft?: Partial<AvisoDraft>): void {
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
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" style="max-width:100%;font-size:0.8rem;" />
      </label>
      <div class="quote-form-actions">
        <button type="submit" class="quote-form-submit">Ver vista previa</button>
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

      if (!form) return;

      // Restaurar valores al volver desde la vista previa
      if (draft) {
        (form.elements.namedItem('name') as HTMLInputElement).value = draft.name ?? '';
        (form.elements.namedItem('phone') as HTMLInputElement).value = draft.phone ?? '';
        (form.elements.namedItem('email') as HTMLInputElement).value = draft.email ?? '';
        (form.elements.namedItem('comment') as HTMLTextAreaElement).value = draft.comment ?? '';
        if (draft.image) {
          const note = document.createElement('small');
          note.style.cssText = 'display:block;color:#a9c25a;font-size:.78rem;margin-top:4px';
          note.textContent = `Ya elegiste una imagen (${draft.image.name}); se conservará al enviar, o selecciona otra para reemplazarla.`;
          (form.elements.namedItem('image') as HTMLInputElement | null)
            ?.closest('label')
            ?.appendChild(note);
        }
      }

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get('name') ?? '');
        const phone = String(data.get('phone') ?? '');
        const email = String(data.get('email') ?? '');
        const comment = String(data.get('comment') ?? '');
        const imageEntry = data.get('image');
        const pickedImage =
          imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;
        const image = pickedImage ?? draft?.image ?? null;

        if (image && image.size > 5 * 1024 * 1024) {
          void Swal.fire({
            title: 'Imagen muy grande',
            text: 'La imagen supera el máximo de 5MB. Elige una más pequeña o envíala sin imagen.',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            ...SWAL_DARK,
          });
          return;
        }

        showPreview({ name, phone, email, comment, image });
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
    // Limpiar la URL para que no se reabra al refrescar
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
    showQuoteDialog();
  }
}
