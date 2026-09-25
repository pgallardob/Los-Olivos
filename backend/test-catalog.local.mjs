// Regresión de catálogo completo: cada producto debe ser encontrable
// por su primera palabra significativa a través del pipeline real de búsqueda.
// Uso: node test-catalog.local.mjs
import { readFileSync } from 'node:fs';
import { searchProducts } from './src/services/search.service.js';

const catalog = JSON.parse(readFileSync(new URL('./data/productos.json', import.meta.url), 'utf8'));
const productos = catalog.productos || catalog;

const deaccent = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const significantWords = (nombre) =>
  deaccent(nombre).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !/^\d/.test(w));

let ok = 0;
const sinResultados = [];
const fueraDeTop5 = [];

for (const p of productos) {
  const words = significantWords(p.nombre);
  if (words.length === 0) {
    sinResultados.push({ nombre: p.nombre, word: '(sin palabra significativa)' });
    continue;
  }
  const word = words[0];
  const results = searchProducts(`busco ${word}`, productos);
  if (results.length === 0) {
    sinResultados.push({ nombre: p.nombre, word });
  } else {
    ok++;
    if (!results.some((r) => r.nombre === p.nombre)) {
      fueraDeTop5.push({ nombre: p.nombre, word, primera: results[0].nombre });
    }
  }
}

console.log(`Productos: ${productos.length}`);
console.log(`Con resultados (usuario ve opciones): ${ok}`);
console.log(`SIN resultados: ${sinResultados.length}`);
for (const f of sinResultados) console.log(`  ✗ "${f.nombre}" (busqué: ${f.word})`);
console.log(`Encontrable pero fuera del top 5 (aparecen similares): ${fueraDeTop5.length}`);
for (const f of fueraDeTop5.slice(0, 15)) console.log(`  ~ "${f.nombre}" → mostró "${f.primera}"`);
