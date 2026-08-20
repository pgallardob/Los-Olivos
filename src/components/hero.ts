/**
 * Hero: carrusel Swiper de pantalla casi completa.
 * Las slides se desplazan hacia la izquierda (autoplay + loop)
 * con paginación horizontal visible.
 */
import Swiper from 'swiper';
import { Autoplay, Pagination, Keyboard } from 'swiper/modules';
import { getHeroSlides, type HeroSlide } from '../services/api';

function renderSlide(slide: HeroSlide, index: number): HTMLElement {
  const el = document.createElement('article');
  el.className = 'swiper-slide hero-slide';
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', slide.imageAlt);

  const image = document.createElement('img');
  image.className = 'hero-slide-image';
  image.src = slide.image;
  image.alt = slide.imageAlt;
  image.decoding = 'async';
  image.loading = index === 0 ? 'eager' : 'lazy';
  el.append(image);

  const content = document.createElement('div');
  content.className = 'hero-content';

  const kicker = document.createElement('p');
  kicker.className = 'hero-kicker';
  kicker.textContent = slide.kicker;

  const title = document.createElement(index === 0 ? 'h1' : 'h2');
  title.className = 'hero-title';
  title.textContent = slide.title;

  const subtitle = document.createElement('p');
  subtitle.className = 'hero-subtitle';
  subtitle.textContent = slide.subtitle;

  const description = document.createElement('p');
  description.className = 'hero-description';
  description.textContent = slide.description;

  content.append(kicker, title, subtitle, description);
  el.append(content);
  return el;
}

export async function initHero(): Promise<void> {
  const wrapper = document.getElementById('hero-slides');
  if (!wrapper) return;

  const slides = await getHeroSlides();
  wrapper.append(...slides.map(renderSlide));

  new Swiper('#hero-swiper', {
    modules: [Autoplay, Pagination, Keyboard],
    loop: true,
    speed: 500,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    keyboard: { enabled: true },
    pagination: {
      el: '.hero-pagination',
      clickable: true,
    },
  });
}
