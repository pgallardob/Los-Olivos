// Pruebas dirigidas de los casos reportados + regresiones de diminutivos
import { readFileSync } from 'node:fs';
import { searchProducts } from './src/services/search.service.js';

const catalog = JSON.parse(readFileSync(new URL('./data/productos.json', import.meta.url), 'utf8'));
const productos = catalog.productos || catalog;

function show(label, msg, opts) {
  const r = searchProducts(msg, productos, opts);
  console.log(`\n[${label}] "${msg}"${opts ? ` (minScore ${opts.minScore})` : ''} → ${r.length} resultados`);
  r.forEach((p, i) => console.log(`   ${i + 1}. ${p.nombre} — $${p.precio}`));
  return r;
}

const has = (list, sub) => list.some((p) => p.nombre.toLowerCase().includes(sub));
let fails = 0;
function check(cond, desc) {
  console.log(`  ${cond ? '✓' : '✗ FALLO'}: ${desc}`);
  if (!cond) fails++;
}

// ── Caso 1: "pancito" (flujo general, minScore 30) ──
const pancito = show('CASO 1', 'pancito', { minScore: 30 });
check(pancito.length > 0, 'encuentra productos de pan');
check(!has(pancito, 'paño'), 'NO incluye paño');
check(!has(pancito, 'española'), 'NO incluye vienesas la española');
check(pancito.every((p) => /pan|marraqueta/i.test(p.nombre)), 'todos son pan');

// ── Caso 1b: "pancito" (flujo product, sin minScore) ──
const pancito2 = show('CASO 1b', 'tengo antojo de pancito');
check(!has(pancito2, 'paño'), 'top 5 sin paño');
check(!has(pancito2, 'española'), 'top 5 sin vienesas española');

// ── Caso 2: "papita" debe seguir encontrando papas (variante vocal activa) ──
const papas = productos.filter((p) => /pap/i.test(p.nombre)).map((p) => p.nombre);
console.log(`\nProductos con "pap" en el catálogo: ${papas.join(' | ') || '(ninguno)'}`);
const papita = show('CASO 2', 'papita', { minScore: 30 });
if (papas.length > 0) check(papita.length > 0 && has(papita, 'pap'), 'papita encuentra papas');

// ── Caso 3: paño y vienesas siguen siendo encontrables por su nombre ──
const pano = show('CASO 3', 'paño');
check(has(pano, 'paño'), 'paño encontrable');
const pano2 = show('CASO 3b', 'pano');
check(has(pano2, 'paño'), 'pano (sin ñ) encontrable');
const vin = show('CASO 3c', 'vienesas la española');
check(has(vin, 'española'), 'vienesas la española encontrable');

// ── Regresiones de diminutivos y búsqueda normal ──
show('REG', 'busco pan', { minScore: 30 });
const pan = searchProducts('busco pan', productos, { minScore: 30 });
check(pan.length > 0 && !has(pan, 'española') && !has(pan, 'paño'), 'busco pan limpio');

show('REG', 'cafecito', { minScore: 30 });
const cafe = searchProducts('cafecito', productos, { minScore: 30 });
check(cafe.length > 0 && has(cafe, 'cafe') || has(cafe, 'nescafe'), 'cafecito encuentra café');

show('REG', 'gansito');
const gansito = searchProducts('gansito', productos, { minScore: 30 });
check(gansito.length > 0 && has(gansito, 'gansito'), 'gansito encontrable');

show('REG', 'tomatito', { minScore: 30 });
const tomatito = searchProducts('tomatito', productos, { minScore: 30 });
check(tomatito.length > 0 && has(tomatito, 'tomate'), 'tomatito encuentra tomate');

show('REG', 'pan de molde', { minScore: 30 });
const pdm = searchProducts('pan de molde', productos, { minScore: 30 });
check(pdm.length > 0 && has(pdm, 'molde'), 'pan de molde encontrable');

console.log(`\n${fails === 0 ? '✔ TODAS LAS PRUEBAS PASAN' : `✗ ${fails} PRUEBAS FALLAN`}`);
process.exit(fails === 0 ? 0 : 1);
