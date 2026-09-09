
import {
  CATEGORIES,
  PRODUCTS,
  PRODUCTS_PER_PAGE,
  type Product,
} from '../data/products';
import { fetchProducts, type SupabaseProduct } from '../services/supabase-client';
import { addToCart } from './cart';


type CategoryId = string;

const ALL_CATEGORIES = 'todos';

let currentCategory: CategoryId = ALL_CATEGORIES;
let currentPage = 1;
let searchQuery = '';
let supabaseProducts: Product[] = [];
let useSupabase = false;

/* ============================================================
   FILTRADO
   ============================================================ */

function getFilteredProducts(category: CategoryId): Product[] {
  const source = useSupabase && supabaseProducts.length > 0 ? supabaseProducts : PRODUCTS;

  let filtered = source;

  if (searchQuery.trim() !== '') {
    const q = searchQuery.trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\b' + escaped, 'i');
    filtered = filtered.filter(
      (product) => regex.test(product.nombre),
    );
    return filtered;
  }

  if (category !== ALL_CATEGORIES) {
    if (useSupabase) {
      filtered = filtered.filter(
        (product) => product.categoria.toLowerCase() === category.toLowerCase(),
      );
    } else {
      filtered = filtered.filter(
        (product) => product.categoria === category,
      );
    }
  }

  return filtered;
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
    searchQuery = '';
    clearSearchMessage();

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

  card.setAttribute('data-product-id', product.id);

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

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'catalog-card-add';
  addBtn.textContent = '+ Agregar';
  addBtn.setAttribute('aria-label', `Agregar ${product.nombre} al carrito`);
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product);
  });
  body.append(addBtn);

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
   HIGHLIGHT DESDE URL (recetas)
   ============================================================ */

function highlightProductFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('producto');
  if (!productId) return;

  const allProducts = useSupabase && supabaseProducts.length > 0 ? supabaseProducts : PRODUCTS;
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const category = product.categoria.toLowerCase();
  const source = useSupabase ? supabaseProducts : PRODUCTS;
  const indexInCategory = source
    .filter((p) => useSupabase ? p.categoria.toLowerCase() === category : p.categoria === product.categoria)
    .findIndex((p) => p.id === productId);

  if (indexInCategory < 0) return;

  const targetPage = Math.floor(indexInCategory / PRODUCTS_PER_PAGE) + 1;

  if (currentCategory !== product.categoria && currentCategory !== category) {
    currentCategory = useSupabase ? category : product.categoria;
    currentPage = targetPage;
    renderFilters(document.getElementById('catalog-filters')!);
    renderProducts();
    renderPagination();
  } else if (currentPage !== targetPage) {
    currentPage = targetPage;
    renderProducts();
    renderPagination();
  }

  requestAnimationFrame(() => {
    const card = document.querySelector(`[data-product-id="${productId}"]`) as HTMLElement | null;
    if (card) {
      card.classList.add('catalog-card--highlight');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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

  initSearchInput();

  highlightProductFromUrl();
}

/* ============================================================
   BÚSQUEDA
   ============================================================ */

function initSearchInput(): void {
  const input = document.getElementById('catalog-search-input') as HTMLInputElement | null;
  const btn = document.getElementById('catalog-search-btn') as HTMLButtonElement | null;
  const suggestionsEl = document.getElementById('catalog-search-suggestions') as HTMLDivElement | null;
  if (!input) return;

  const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const matchesSearch = (productName: string, term: string): boolean => {
    const escaped = escapeRegex(term.toLowerCase());
    const regex = new RegExp('\\b' + escaped, 'i');
    return regex.test(productName);
  };

  const doSearch = () => {
    const term = input.value.trim();
    if (term === '') return;

    const source = useSupabase && supabaseProducts.length > 0 ? supabaseProducts : PRODUCTS;
    const results = source.filter(
      (product) => matchesSearch(product.nombre, term),
    );

    input.value = '';
    hideSuggestions();

    if (results.length === 0) {
      searchQuery = '';
      showSearchMessage(`El producto "${term}" no existe en el catálogo.`, 'not-found');
      return;
    }

    if (currentCategory !== ALL_CATEGORIES) {
      const resultCategoryNames = [...new Set(results.map((p) => p.categoria))];
      const currentCatLower = currentCategory.toLowerCase();
      const inCurrentCategory = useSupabase
        ? resultCategoryNames.some((cn) => cn.toLowerCase() === currentCatLower)
        : resultCategoryNames.some((cn) => cn === currentCategory);

      if (!inCurrentCategory) {
        const catList = resultCategoryNames.join('", "');
        showSearchMessage(
          `El producto "${term}" se encuentra en la categoría "${catList}".`,
          'info',
        );
      } else {
        clearSearchMessage();
      }
    } else {
      clearSearchMessage();
    }

    searchQuery = term;
    currentCategory = ALL_CATEGORIES;
    currentPage = 1;
    updateFilterActiveState();
    renderProducts();
    renderPagination();
  };

  const showSuggestions = (term: string) => {
    if (!suggestionsEl || term.length < 2) {
      hideSuggestions();
      return;
    }

    const source = useSupabase && supabaseProducts.length > 0 ? supabaseProducts : PRODUCTS;
    const matches = source
      .filter((product) => matchesSearch(product.nombre, term))
      .slice(0, 8);

    if (matches.length === 0) {
      hideSuggestions();
      return;
    }

    suggestionsEl.innerHTML = '';
    matches.forEach((product) => {
      const item = document.createElement('div');
      item.className = 'catalog-search-suggestion-item';
      item.setAttribute('role', 'option');
      item.textContent = product.nombre;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = product.nombre;
        hideSuggestions();
        doSearch();
      });
      suggestionsEl.appendChild(item);
    });
    suggestionsEl.style.display = 'block';
  };

  const hideSuggestions = () => {
    if (!suggestionsEl) return;
    suggestionsEl.innerHTML = '';
    suggestionsEl.style.display = 'none';
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      hideSuggestions();
      doSearch();
    }
    if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  input.addEventListener('input', () => {
    const term = input.value.trim();
    showSuggestions(term);
  });

  input.addEventListener('blur', () => {
    setTimeout(hideSuggestions, 150);
  });

  if (btn) {
    btn.addEventListener('click', () => {
      hideSuggestions();
      doSearch();
    });
  }
}

function showSearchMessage(text: string, type: 'info' | 'not-found'): void {
  const msg = document.getElementById('catalog-search-message');
  if (!msg) return;
  msg.textContent = text;
  msg.className = `catalog-search-message catalog-search-message--${type}`;
  msg.style.display = 'block';
}

function clearSearchMessage(): void {
  const msg = document.getElementById('catalog-search-message');
  if (!msg) return;
  msg.textContent = '';
  msg.className = 'catalog-search-message';
  msg.style.display = 'none';
}