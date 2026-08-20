import { createClient } from '@supabase/supabase-js';
import { config } from '../config/config.js';

let client = null;

function getClient() {
  if (!client && config.supabase.url && config.supabase.serviceRoleKey) {
    client = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function fetchProductsFromSupabase() {
  const supabase = getClient();
  if (!supabase) {
    throw new Error('Supabase no configurado. Verificar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
  }

  // Consulta con select específico + joins para resolver nombres de categoría y marca
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      sku,
      nombre,
      precio,
      stock,
      categoria_id,
      marca_id,
      imagen_url,
      categorias!categoria_id ( nombre ),
      marcas!marca_id ( nombre )
    `)
    .eq('estado', true)
    .is('deleted_at', null)
    .order('nombre');

  if (error) {
    throw new Error(`Error consultando Supabase: ${error.message}`);
  }

  // Transformar a estructura plana del JSON
  return (data || []).map((p) => ({
    id: p.id,
    sku: p.sku,
    nombre: p.nombre,
    precio: p.precio,
    stock: p.stock,
    categoria: p.categorias?.nombre || 'Sin categoría',
    marca: p.marcas?.nombre || 'Sin marca',
    imagen_url: p.imagen_url || null,
  }));
}
