/**
 * Capa de datos de la landing.
 * Simula una API: expone los datos como promesas tipadas para que,
 * al conectar un backend/CMS real, los componentes no cambien.
 * Todo el contenido está marcado como PLACEHOLDER.
 */

export interface HeroSlide {
  image: string;
  imageAlt: string;
  kicker: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface CardItem {
  image: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  ctaLabel: string;
  /** Nombre de icono Lucide en kebab-case (ej. "cpu", "shield-check") */
  icon: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  socials: { name: string; icon: string; url: string }[];
  linksSocials: { name: string; icon: string; url: string; image?: string }[];
}

const HERO_IMAGES = [
  new URL('../../assets/hero/slide-1.svg', import.meta.url).href,
  new URL('../../assets/hero/slide-2.svg', import.meta.url).href,
  new URL('../../assets/hero/slide-3.svg', import.meta.url).href,
];

const CARD_IMAGES = [
  new URL('../../assets/oferta1.jpeg', import.meta.url).href,
  // aqui se cambia la imagen para continuar yo manualmente despues
  new URL('../../assets/oferta2.jpeg', import.meta.url).href,
  new URL('../../assets/oferta3.jpeg', import.meta.url).href,
  new URL('../../assets/oferta4.jpeg', import.meta.url).href,
  new URL('../../assets/oferta5.jpeg', import.meta.url).href,
  new URL('../../assets/oferta6.jpeg', import.meta.url).href,
];

const heroImage = (n: number) => HERO_IMAGES[n - 1];
const cardImage = (n: number) => CARD_IMAGES[n - 1];

const env = import.meta.env;

const heroSlides: HeroSlide[] = [
  {
    image: heroImage(1),
    imageAlt: 'Red de nodos tecnológicos (placeholder)',
    kicker: 'Innovación // Precisión',
    title: 'En Concordia 408 somos tu mejor alternativa de ahorro',
    subtitle: 'Directo del distribuidor para acercarte los mejores precios.',
    description:
      'Diseñamos una metodologia de trabajo  agil con nuestros proveedores para para mejorar las ofertas disponibles ',
  },
  {
    image: heroImage(2),
    imageAlt: 'Estructura hexagonal futurista (placeholder)',
    kicker: 'Presencia // Rutas',
    title: 'Online, Web y en Redes Sociales',
    subtitle: 'Todas nuestras plataformas dedicadas a nuetros clientes',
    description:
      'Plataformas Web, Instagram, Tik Tok, Facebook y WhatsApp',
  },
  {
    image: heroImage(3),
    imageAlt: 'Panel de datos analíticos (placeholder)',
    kicker: 'Datos // Decisiones',
    title: 'Crecemos juntos de forma cercana y competitiva',
    subtitle: 'Centramos nuestra atención en nuestros clientes.',
    description:
      'Transformamos el concepto comercial en una atención perzonalizada cercana y de calidad.',
  },
];

const cards: CardItem[] = [
  {
    image: cardImage(1),
    imageAlt: 'Oferta LosOlivos',
    category: '',
    title: 'Oferta LosOlivos ',
    description:
      'Nectar Colun caja 1 Lt sabores Durazno, Naranja, Piña. 2 x $1.800. ',
    ctaLabel: 'Ver más',
    icon: '',
  },
  {
    // aqui se cambia la imagen para continuar yo manualmente despues
    image: cardImage(2),
    imageAlt: 'Oferta LosOlivos',
    category: '',
    title: 'Oferta Los Olivos',
    description:
      'Bombillín Andina de Valle sabores Manzana, Durazno, Piña, Naranja six pack $1.800',
    ctaLabel: 'Ver más',
    icon: '',
  },
  {
    image: cardImage(3),
    imageAlt: 'Oferta LosOlivos',
    category: '',
    title: 'Oferta Los Olivos ',
    description:'Bombillín Vivo sabores  Manzana, Durazno, Piña, Naranja tri pack $1.000',
    ctaLabel: 'Ver más',
    icon: '',
  },
  {
    image: cardImage(4),
    imageAlt: 'Oferta LosOlivos',
    category: '',
    title: 'Oferta Los Olivos',
    description:
      'Papa frita Kryspo tarro 37Gr sabores Queso, Tradicional, Cebolla 1 x $950',
    ctaLabel: 'Ver más',
    icon: '',
  },
  {
    image: cardImage(5),
    imageAlt: 'Oferta LosOlivos',
    category: '',
    title: 'Oferta Los Olivos',
    description:
      'Huevo blanco 1ra Agro garote bandeja 30 unidades x $6.600',
    ctaLabel: 'Ver más',
    icon: '',
  },
  {
    image: cardImage(6),
    imageAlt: 'Oferta LosOlivos',
    category: '',
    title: 'Oferta Los Olivos',
    description:'Hambuerguesa Super Beef 100 gr 2 x $1.000 hasta agotar stock',
    ctaLabel: 'Ver más',
    icon: '',
  },
];

const company: CompanyInfo = {
  name: env.VITE_COMPANY_NAME ?? 'Comercializadora Los Olivos',
  tagline: env.VITE_COMPANY_TAGLINE ?? 'Comercializadora Los Olivos E.I.R.L.',
  email: env.VITE_CONTACT_EMAIL ?? 'contacto@ejemplo.com',
  phone: env.VITE_CONTACT_PHONE ?? '+569 64 19 4547 - +569 30 74 8991',
  address: env.VITE_CONTACT_ADDRESS ?? 'Concordia 408 Local A, Peñaflor, Santiago, Chile',
  hours: env.VITE_CONTACT_HOURS ?? 'Lun–Sab 10:00–20:00 hrs',
  socials: [
    { name: 'Instagram', icon: 'instagram', url: env.VITE_SOCIAL_INSTAGRAM ?? '' },
    { name: 'TikTok', icon: 'tiktok', url: env.VITE_SOCIAL_TIKTOK ?? '' },
    { name: 'WhatsApp', icon: 'whatsapp', url: env.VITE_SOCIAL_WHATSAPP ?? '' },
    { name: 'Facebook', icon: 'facebook', url: env.VITE_SOCIAL_FACEBOOK ?? '' },
  ],
  linksSocials: [
    { name: 'La Osita', icon: '', url: 'https://www.instagram.com/emporiolaosita?igsi=YWxtOW50czhtdWli', image: new URL('../../assets/laosita.jpeg', import.meta.url).href },
    { name: 'EFI', icon: '', url: 'https://www.instagram.com/efiregalos?igsi=MXRmaXByNjlmb3VzYQ==', image: new URL('../../assets/efi.jpg', import.meta.url).href },
    { name: 'Los Olivos', icon: '', url: 'https://www.instagram.com/comercializadora_los_olivos_?igsh=MXR1aWJqMzdmYmZibA==', image: new URL('../../assets/los_olivos.jpg', import.meta.url).href },
  ],
};

export function getHeroSlides(): Promise<HeroSlide[]> {
  return Promise.resolve(heroSlides);
}

export function getCards(): Promise<CardItem[]> {
  return Promise.resolve(cards);
}

export function getCompanyInfo(): Promise<CompanyInfo> {
  return Promise.resolve(company);
}
