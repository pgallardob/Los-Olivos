import { readFileSync } from 'node:fs';
import { searchProducts } from './src/services/search.service.js';

const productos = JSON.parse(
  readFileSync(new URL('./data/productos.json', import.meta.url), 'utf8'),
).productos;

const queries = process.argv.slice(2).length > 0
  ? process.argv.slice(2)
  : ['busco papitas', 'me comi un pancito', 'busco cafecito', 'busco galletitas', 'sereal', 'busco endenate', 'quien eres tu', 'cereal', 'monito', 'kiero un cafe', 'busco arroz', 'nescafe'];

for (const q of queries) {
  const r = searchProducts(q, productos, { minScore: 1 });
  console.log(`\n"${q}":`);
  if (r.length === 0) console.log('  (sin resultados)');
  r.forEach((p) => console.log(`   ${p.nombre.trim()}`));
}



