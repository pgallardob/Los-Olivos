/**
 * Modal del QR del footer — reutilizable en todas las páginas.
 */

export function initQrModal(): void {
  const btn = document.getElementById('qr-scan-btn');
  const modal = document.getElementById('qr-modal');
  const backdrop = document.getElementById('qr-modal-backdrop');
  const close = document.getElementById('qr-modal-close');

  if (!btn || !modal || !backdrop || !close) return;

  const open = (): void => { modal.removeAttribute('hidden'); };
  const closeModal = (): void => { modal.setAttribute('hidden', ''); };

  btn.addEventListener('click', (e) => { e.stopPropagation(); open(); });
  backdrop.addEventListener('click', closeModal);
  close.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
  });
}
