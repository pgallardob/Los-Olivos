
import {
  CATEGORIES,
  PRODUCTS,
  PRODUCTS_PER_PAGE,
  type Product,
} from '../data/products';
import { fetchProducts, type SupabaseProduct } from '../services/supabase-client';


type CategoryId = string;

const ALL_CATEGORIES = 'todos';

let currentCategory: CategoryId = ALL_CATEGORIES;
let currentPage = 1;
let supabaseProducts: Product[] = [];
let useSupabase = false;

/* ============================================================
   FILTRADO
   ============================================================ */

function getFilteredProducts(category: CategoryId): Product[] {
  const source = useSupabase && supabaseProducts.length > 0 ? supabaseProducts : PRODUCTS;

  if (category === ALL_CATEGORIES) {
    return source;
  }

  if (useSupabase) {
    return source.filter(
      (product) => product.categoria.toLowerCase() === category.toLowerCase(),
    );
  }

  return source.filter(
    (product) => product.categoria === category,
  );
}

/* ============================================================
   FILTROS
   ============================================================ */

function renderFilters(container: HTMLElement): void {
  container.innerHTML = '';

  const allButton = createFilterButton(
    'Todos',
    ALL_CATEGORIES,
  );

  container.append(allButton);

  if (useSupabase && supabaseProducts.length > 0) {
    const cats = new Set<string>();
    for (const p of supabaseProducts) {
      if (p.categoria) cats.add(p.categoria);
    }
    for (const catName of [...cats].sort()) {
      container.append(
        createFilterButton(
          catName,
          catName.toLowerCase(),
        ),
      );
    }
  } else {
    for (const category of CATEGORIES) {
      container.append(
        createFilterButton(
          category.nombre,
          category.id,
        ),
      );
    }
  }

  updateFilterActiveState();
}

function createFilterButton(
  label: string,
  categoryId: CategoryId,
): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'catalog-filter-btn';
  button.textContent = label;

  button.setAttribute(
    'aria-pressed',
    categoryId === currentCategory
      ? 'true'
      : 'false',
  );

  button.setAttribute(
    'data-category',
    categoryId,
  );

  button.addEventListener('click', () => {
    currentCategory = categoryId;
    currentPage = 1;

    updateFilterActiveState();
    renderProducts();
    renderPagination();
  });

  return button;
}

function updateFilterActiveState(): void {
  const container =
    document.getElementById('catalog-filters');

  if (!container) {
    return;
  }

  container
    .querySelectorAll('.catalog-filter-btn')
    .forEach((element) => {
      const button = element as HTMLButtonElement;

      const category =
        button.getAttribute('data-category');

      const isActive =
        category === currentCategory;

      button.setAttribute(
        'aria-pressed',
        isActive ? 'true' : 'false',
      );

      button.classList.toggle(
        'catalog-filter-btn--active',
        isActive,
      );
    });
}

/* ============================================================
   PRODUCTOS
   ============================================================ */

function renderProducts(): void {
  const grid =
    document.getElementById('catalog-grid');

  if (!grid) {
    return;
  }

  const filtered =
    getFilteredProducts(currentCategory);

  const start =
    (currentPage - 1) *
    PRODUCTS_PER_PAGE;

  const pageProducts =
    filtered.slice(
      start,
      start + PRODUCTS_PER_PAGE,
    );

  grid.innerHTML = '';

  if (pageProducts.length === 0) {
    const empty =
      document.createElement('p');

    empty.className = 'catalog-empty';

    empty.textContent =
      'No hay productos en esta categoría.';

    grid.append(empty);

    return;
  }

  for (const product of pageProducts) {
    grid.append(
      createProductCard(product),
    );
  }
}

/* ============================================================
   CARD
   ============================================================ */

function createProductCard(
  product: Product,
): HTMLElement {
  const card =
    document.createElement('article');

  card.className = 'catalog-card';

  /* ----------------------------------------------------------
     Contenedor de imagen
     ---------------------------------------------------------- */

  const imgWrap =
    document.createElement('div');

  imgWrap.className =
    'catalog-card-img';

  /* ----------------------------------------------------------
     Imagen
     ---------------------------------------------------------- */

  if (product.imagen) {
    const img =
      document.createElement('img');

    img.className =
      'catalog-card-img-tag';

    img.alt = product.nombre;
    img.src = product.imagen;
    img.decoding = 'async';
    img.loading = 'lazy';

    img.addEventListener(
      'error',
      () => {
        showPlaceholder(imgWrap);
      },
      { once: true },
    );

    imgWrap.append(img);
  } else {
    showPlaceholder(imgWrap);
  }

  /* ----------------------------------------------------------
     Cuerpo de la card
     ---------------------------------------------------------- */

  const body =
    document.createElement('div');

  body.className =
    'catalog-card-body';

  const nameEl =
    document.createElement('h3');

  nameEl.className =
    'catalog-card-name';

  nameEl.textContent =
    product.nombre;

  body.append(nameEl);

  const brandEl =
    document.createElement('p');

  brandEl.className =
    'catalog-card-brand';

  brandEl.textContent =
    product.marca ?? '';

  body.append(brandEl);

  const categoryEl =
    document.createElement('p');

  categoryEl.className =
    'catalog-card-category';

  categoryEl.textContent =
    product.categoria ?? '';

  body.append(categoryEl);

  if (product.precio !== undefined && product.precio !== null) {
    const priceEl =
      document.createElement('p');

    priceEl.className =
      'catalog-card-price';

    priceEl.textContent =
      `$${product.precio.toLocaleString('es-CL')}`;

    body.append(priceEl);
  }

  card.append(
    imgWrap,
    body,
  );

  return card;
}

/* ============================================================
   PLACEHOLDER
   ============================================================ */

function showPlaceholder(
  container: HTMLElement,
): void {
  container.innerHTML = '';

  const img =
    document.createElement('img');

  img.className =
    'catalog-card-placeholder-img';

  img.src = '/assets/sinimg.jpeg';
  img.alt = 'Imagen no disponible';
  img.decoding = 'async';
  img.loading = 'lazy';

  container.append(img);
}

/* ============================================================
   PAGINACIÓN
   ============================================================ */

function renderPagination(): void {
  const container =
    document.getElementById(
      'catalog-pagination',
    );

  if (!container) {
    return;
  }

  const filtered =
    getFilteredProducts(
      currentCategory,
    );

  const totalPages =
    Math.ceil(
      filtered.length /
        PRODUCTS_PER_PAGE,
    );

  container.innerHTML = '';

  if (totalPages <= 1) {
    return;
  }

  /* ----------------------------------------------------------
     Página anterior
     ---------------------------------------------------------- */

  const prevBtn =
    document.createElement('button');

  prevBtn.type = 'button';

  prevBtn.className =
    'catalog-page-btn';

  prevBtn.textContent = '‹';

  prevBtn.setAttribute(
    'aria-label',
    'Página anterior',
  );

  prevBtn.disabled =
    currentPage === 1;

  prevBtn.addEventListener(
    'click',
    () => {
      if (currentPage > 1) {
        currentPage--;

        renderProducts();
        renderPagination();
        scrollToGrid();
      }
    },
  );

  container.append(prevBtn);

  /* ----------------------------------------------------------
     Botones de páginas
     ---------------------------------------------------------- */

  const maxVisible = 5;

  let startPage =
    Math.max(
      1,
      currentPage -
        Math.floor(
          maxVisible / 2,
        ),
    );

  let endPage =
    Math.min(
      totalPages,
      startPage +
        maxVisible -
        1,
    );

  /*
   * Si estamos cerca del final,
   * desplazamos la ventana de páginas.
   */
  if (
    endPage - startPage <
    maxVisible - 1
  ) {
    startPage =
      Math.max(
        1,
        endPage -
          maxVisible +
          1,
      );
  }

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    const pageBtn =
      document.createElement(
        'button',
      );

    pageBtn.type = 'button';

    pageBtn.className =
      'catalog-page-btn';

    pageBtn.textContent =
      String(page);

    pageBtn.setAttribute(
      'aria-label',
      `Página ${page}`,
    );

    pageBtn.setAttribute(
      'aria-current',
      page === currentPage
        ? 'page'
        : 'false',
    );

    pageBtn.classList.toggle(
      'catalog-page-btn--active',
      page === currentPage,
    );

    pageBtn.addEventListener(
      'click',
      () => {
        currentPage = page;

        renderProducts();
        renderPagination();
        scrollToGrid();
      },
    );

    container.append(pageBtn);
  }

  /* ----------------------------------------------------------
     Página siguiente
     ---------------------------------------------------------- */

  const nextBtn =
    document.createElement(
      'button',
    );

  nextBtn.type = 'button';

  nextBtn.className =
    'catalog-page-btn';

  nextBtn.textContent = '›';

  nextBtn.setAttribute(
    'aria-label',
    'Página siguiente',
  );

  nextBtn.disabled =
    currentPage === totalPages;

  nextBtn.addEventListener(
    'click',
    () => {
      if (
        currentPage <
        totalPages
      ) {
        currentPage++;

        renderProducts();
        renderPagination();
        scrollToGrid();
      }
    },
  );

  container.append(nextBtn);
}

/* ============================================================
   SCROLL
   ============================================================ */

function scrollToGrid(): void {
  const grid =
    document.getElementById(
      'catalog-grid',
    );

  if (!grid) {
    return;
  }

  grid.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

export async function initCatalog(): Promise<void> {
  const filtersContainer =
    document.getElementById(
      'catalog-filters',
    );

  if (!filtersContainer) {
    return;
  }

  try {
    const products = await fetchProducts();
    if (products && products.length > 0) {
      supabaseProducts = products.map((p: SupabaseProduct) => ({
        id: p.id,
        nombre: p.nombre,
        marca: p.marca,
        categoria: p.categoria,
        precio: p.precio,
        stock: p.stock,
        imagen: p.imagen_url || undefined,
      }));
      useSupabase = true;
      console.log(`[catalog] ${products.length} productos cargados desde Supabase.`);
    }
  } catch (e) {
    console.warn('[catalog] No se pudo cargar desde Supabase, usando datos estáticos:', e);
  }

  renderFilters(
    filtersContainer,
  );

  renderProducts();

  renderPagination();
}