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
      link.href = `/productos.html`;
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

export function initRecipes(): void {
  const grid = document.getElementById('recipes-grid');
  if (!grid) return;

  grid.innerHTML = '';

  for (const recipe of RECIPES) {
    grid.append(createRecipeCard(recipe));
  }
}
