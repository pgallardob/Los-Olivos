/**
 * Componente de recetas del almacén.
 * Renderiza cards de recetas con ingredientes enlazados a productos.
 */

import { RECIPES, type Recipe } from '../data/recipes';

function createRecipeCard(recipe: Recipe): HTMLElement {
  const card = document.createElement('article');
  card.className = 'recipe-card';

  const header = document.createElement('div');
  header.className = 'recipe-card-header';

  const title = document.createElement('h3');
  title.className = 'recipe-card-title';
  title.textContent = recipe.titulo;
  header.append(title);

  const desc = document.createElement('p');
  desc.className = 'recipe-card-desc';
  desc.textContent = recipe.descripcion;
  header.append(desc);

  const meta = document.createElement('div');
  meta.className = 'recipe-card-meta';

  const porciones = document.createElement('span');
  porciones.innerHTML = `<strong>Porciones:</strong> ${recipe.porciones}`;
  meta.append(porciones);

  const tiempo = document.createElement('span');
  tiempo.innerHTML = `<strong>Tiempo:</strong> ${recipe.tiempo}`;
  meta.append(tiempo);

  header.append(meta);
  card.append(header);

  const body = document.createElement('div');
  body.className = 'recipe-card-body';

  const ingTitle = document.createElement('h4');
  ingTitle.textContent = 'Ingredientes';
  body.append(ingTitle);

  const ingList = document.createElement('ul');
  ingList.className = 'recipe-ingredients';

  for (const ing of recipe.ingredientes) {
    const li = document.createElement('li');
    li.className = 'recipe-ingredient';

    const qty = document.createElement('span');
    qty.className = 'recipe-ingredient-qty';
    qty.textContent = ing.cantidad;
    li.append(qty);

    if (ing.productId) {
      const link = document.createElement('a');
      link.href = `/productos.html?producto=${encodeURIComponent(ing.productId)}`;
      link.className = 'recipe-ingredient-link';
      link.textContent = ing.nombre;
      link.title = `Ver ${ing.nombre} en el catálogo`;
      li.append(link);
    } else {
      const name = document.createElement('span');
      name.textContent = ing.nombre;
      li.append(name);
    }

    ingList.append(li);
  }

  body.append(ingList);

  const stepsTitle = document.createElement('h4');
  stepsTitle.textContent = 'Preparación';
  body.append(stepsTitle);

  const stepsList = document.createElement('ol');
  stepsList.className = 'recipe-steps';

  for (const step of recipe.pasos) {
    const li = document.createElement('li');
    li.textContent = step;
    stepsList.append(li);
  }

  body.append(stepsList);
  card.append(body);

  return card;
}

const RECIPES_PER_PAGE = 3;

let currentCategory = 'Todas';
let currentPage = 1;

function getCategories(): string[] {
  const set = new Set<string>();
  for (const r of RECIPES) set.add(r.categoria);
  return ['Todas', ...Array.from(set).sort()];
}

function getFilteredRecipes(): Recipe[] {
  if (currentCategory === 'Todas') return RECIPES;
  return RECIPES.filter((r) => r.categoria === currentCategory);
}

function renderRecipeSelect(container: HTMLElement): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'recipes-controls';

  const label = document.createElement('label');
  label.className = 'recipes-select-label';
  label.textContent = 'Filtrar por categoría:';
  label.htmlFor = 'recipes-category-select';

  const select = document.createElement('select');
  select.id = 'recipes-category-select';
  select.className = 'recipes-select';

  for (const cat of getCategories()) {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentCategory) opt.selected = true;
    select.append(opt);
  }

  select.addEventListener('change', () => {
    currentCategory = select.value;
    currentPage = 1;
    renderRecipes();
    scrollToRecipesTop();
  });

  wrapper.append(label, select);
  container.append(wrapper);
}

function renderPagination(container: HTMLElement, totalPages: number): void {
  if (totalPages <= 1) return;

  const nav = document.createElement('nav');
  nav.className = 'recipes-pagination';
  nav.setAttribute('aria-label', 'Paginación de recetas');

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'recipes-page-btn';
  prevBtn.textContent = '‹ Anterior';
  prevBtn.disabled = currentPage <= 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderRecipes();
      scrollToRecipesTop();
    }
  });

  const info = document.createElement('span');
  info.className = 'recipes-page-info';
  info.textContent = `Página ${currentPage} de ${totalPages}`;

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'recipes-page-btn';
  nextBtn.textContent = 'Siguiente ›';
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderRecipes();
      scrollToRecipesTop();
    }
  });

  nav.append(prevBtn, info, nextBtn);
  container.append(nav);
}

function scrollToRecipesTop(): void {
  const grid = document.getElementById('recipes-grid');
  if (!grid) return;
  const section = grid.closest('.recipes-section');
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

function renderRecipes(): void {
  const grid = document.getElementById('recipes-grid');
  if (!grid) return;

  const section = grid.parentElement;
  if (!section) return;

  grid.innerHTML = '';

  const filtered = getFilteredRecipes();
  const totalPages = Math.ceil(filtered.length / RECIPES_PER_PAGE);

  if (currentPage > totalPages) currentPage = 1;

  const start = (currentPage - 1) * RECIPES_PER_PAGE;
  const pageRecipes = filtered.slice(start, start + RECIPES_PER_PAGE);

  for (const recipe of pageRecipes) {
    grid.append(createRecipeCard(recipe));
  }

  const existingPagination = section.querySelector('.recipes-pagination');
  if (existingPagination) existingPagination.remove();

  renderPagination(section, totalPages);
}

export function initRecipes(): void {
  const grid = document.getElementById('recipes-grid');
  if (!grid) return;

  const section = grid.parentElement;
  if (!section) return;

  const existingControls = section.querySelector('.recipes-controls');
  if (existingControls) existingControls.remove();

  renderRecipeSelect(section);
  renderRecipes();
}
