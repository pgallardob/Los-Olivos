import { readJsonFile } from '../utils/json-storage.js';
import { join } from 'path';
import { config } from '../config/config.js';
import { fetchProductsFromSupabase } from '../repositories/product.repository.js';

const PRODUCTOS_PATH = join(config.paths.data, 'productos.json');

let catalog = null;

export async function loadCatalog() {
  const data = readJsonFile(PRODUCTOS_PATH);
  if (data && data.productos && Array.isArray(data.productos)) {
    catalog = data;
    console.log(`[product] Catálogo cargado desde archivo: ${data.productos.length} productos.`);
    return;
  }

  console.warn('[product] No hay catálogo local. Intentando cargar desde Supabase...');
  try {
    const products = await fetchProductsFromSupabase();
    if (products && products.length > 0) {
      catalog = {
        metadata: {
          ultima_actualizacion: new Date().toISOString(),
          cantidad_productos: products.length,
          fuente: 'SUPABASE_DIRECTO',
          estado: 'ok',
        },
        productos: products,
      };
      console.log(`[product] Catálogo cargado desde Supabase: ${products.length} productos.`);
    } else {
      console.warn('[product] Supabase devolvió 0 productos. Catálogo vacío.');
      catalog = null;
    }
  } catch (err) {
    console.error('[product] Error cargando catálogo desde Supabase:', err.message);
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
