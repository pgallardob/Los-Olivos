import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client && supabaseUrl && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export interface SupabaseProduct {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  marca: string;
  imagen_url: string | null;
}

export async function fetchProducts(): Promise<SupabaseProduct[]> {
  const supabase = getClient();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }

  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      precio,
      stock,
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

  return (data || []).map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    stock: p.stock,
    categoria: p.categorias?.nombre || 'Sin categoría',
    marca: p.marcas?.nombre || 'Sin marca',
    imagen_url: p.imagen_url || null,
  }));
}

export function getPublicImageUrl(path: string): string {
  const supabase = getClient();
  if (!supabase) return '';
  const { data } = supabase.storage.from('productos').getPublicUrl(path);
  return data.publicUrl;
}
