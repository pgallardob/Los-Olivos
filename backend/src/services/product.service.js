import { readJsonFile } from '../utils/json-storage.js';
import { join } from 'path';
import { config } from '../config/config.js';

const PRODUCTOS_PATH = join(config.paths.data, 'productos.json');

let catalog = null;

export async function loadCatalog() {
  const data = readJsonFile(PRODUCTOS_PATH);
  if (data && data.productos && Array.isArray(data.productos)) {
    catalog = data;
    console.log(`[product] Catálogo cargado: ${data.productos.length} productos.`);
  } else {
    console.warn('[product] No hay catálogo válido. Ejecutar: npm run sync');
    catalog = null;
  }
}

export function reloadCatalog() {
  const data = readJsonFile(PRODUCTOS_PATH);
  if (data && data.productos && Array.isArray(data.productos)) {
    catalog = data;
    console.log(`[product] Catálogo recargado: ${data.productos.length} productos.`);
  } else {
    console.warn('[product] Recarga falló. Catálogo anterior conservado en memoria.');
  }
}

export function getCatalog() {
  return catalog;
}

export function getProductCount() {
  return catalog ? catalog.productos.length : 0;
}
