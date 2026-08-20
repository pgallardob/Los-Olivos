/**
 * Datos estáticos del catálogo de productos.
 * Sin base de datos — todo se define aquí en TypeScript.
 *
 * Para agregar un producto: copiar un objeto del array PRODUCTS y modificar los campos.
 * Para agregar una categoría: agregar un objeto al array CATEGORIES y usar su id en productos.
 */

export interface Product {
  id: string;
  nombre: string;
  marca?: string;
  categoria: string;
  imagen?: string;
  precio?: number;
  stock?: number;
}

export interface Category {
  id: string;
  nombre: string;
}

export const CATEGORIES: Category[] = [
  { id: 'abarrotes', nombre: 'Abarrotes' },
  { id: 'aseo', nombre: 'Aseo' },
  { id: 'hogar', nombre: 'Hogar' },
  { id: 'alimentos', nombre: 'Alimentos' },
  { id: 'bebidas', nombre: 'Bebidas' },
  { id: 'general', nombre: 'General' },
];

export const PRODUCTS_PER_PAGE = 12;

export const PRODUCTS: Product[] = [
  // --- ABARROTES ---
  { id: 'arroz-tucapel', nombre: 'Arroz Tucapel', marca: 'Tucapel', categoria: 'abarrotes' },
  { id: 'fideos-lucchetti', nombre: 'Fideos Lucchetti', marca: 'Lucchetti', categoria: 'abarrotes' },
  { id: 'aceite-miraflores', nombre: 'Aceite Miraflores', marca: 'Miraflores', categoria: 'abarrotes' },
  { id: 'azucar-iansa', nombre: 'Azúcar Iansa', marca: 'Iansa', categoria: 'abarrotes' },
  { id: 'lentejas-el-globo', nombre: 'Lentejas El Globo', marca: 'El Globo', categoria: 'abarrotes' },
  { id: 'conservas-watties', nombre: 'Conservas Watties', marca: 'Watties', categoria: 'abarrotes' },

  // --- ASEO ---
  { id: 'detergente-quix', nombre: 'Detergente Quix', marca: 'Quix', categoria: 'aseo' },
  { id: 'lavalozas-quix', nombre: 'Lavalozas Quix', marca: 'Quix', categoria: 'aseo' },
  { id: 'cloro-lindo', nombre: 'Cloro Lindo', marca: 'Lindo', categoria: 'aseo' },
  { id: 'desinfectante-lysoform', nombre: 'Desinfectante Lysoform', marca: 'Lysoform', categoria: 'aseo' },
  { id: 'papel-higienico-confort', nombre: 'Papel Higiénico Confort', marca: 'Confort', categoria: 'aseo' },
  { id: 'toallas-nobel', nombre: 'Toallas Nobel', marca: 'Nobel', categoria: 'aseo' },

  // --- HOGAR ---
  { id: 'esponjas-scotch', nombre: 'Esponjas Scotch-Brite', marca: 'Scotch-Brite', categoria: 'hogar' },
  { id: 'bolsas-doy-pack', nombre: 'Bolsas Doy Pack', marca: 'Doy Pack', categoria: 'hogar' },
  { id: 'guantes-comfort', nombre: 'Guantes Comfort', marca: 'Comfort', categoria: 'hogar' },
  { id: 'utensilios-kitchen', nombre: 'Utensilios de Cocina', marca: 'Kitchen', categoria: 'hogar' },

  // --- ALIMENTOS ---
  { id: 'pan-bimbo', nombre: 'Pan Bimbo', marca: 'Bimbo', categoria: 'alimentos' },
  { id: 'leche-soprole', nombre: 'Leche Soprole', marca: 'Soprole', categoria: 'alimentos' },
  { id: 'huevos-campesino', nombre: 'Huevos Campesino', marca: 'Campesino', categoria: 'alimentos' },

  // --- BEBIDAS ---
  { id: 'coca-cola', nombre: 'Coca Cola', marca: 'Coca-Cola', categoria: 'bebidas' },
  { id: 'agua-cachantun', nombre: 'Agua Cachantun', marca: 'Cachantun', categoria: 'bebidas' },
  { id: 'jugo-watts', nombre: 'Jugo Watts', marca: 'Watts', categoria: 'bebidas' },
];
