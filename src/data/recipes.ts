/**
 * Datos estáticos de recetas.
 * Cada receta enlaza ingredientes con productos del catálogo.
 */

export interface RecipeIngredient {
  nombre: string;
  cantidad: string;
  productId?: string;
}

export interface Recipe {
  id: string;
  titulo: string;
  descripcion: string;
  porciones: string;
  tiempo: string;
  ingredientes: RecipeIngredient[];
  pasos: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: 'charquican',
    titulo: 'Charquicán de Carne',
    descripcion: 'Un clásico chileno, rendidor y sabroso. Ideal para el almuerzo en familia.',
    porciones: '4 personas',
    tiempo: '45 min',
    ingredientes: [
      { nombre: 'Carne picada', cantidad: '500 g' },
      { nombre: 'Papa', cantidad: '4 unidades' },
      { nombre: 'Zapallo', cantidad: '½ kg' },
      { nombre: 'Cebolla', cantidad: '1 unidad' },
      { nombre: 'Arroz Tucapel', cantidad: '1 taza', productId: 'arroz-tucapel' },
      { nombre: 'Aceite Miraflores', cantidad: '2 cucharadas', productId: 'aceite-miraflores' },
      { nombre: 'Sal y comino', cantidad: 'a gusto' },
    ],
    pasos: [
      'Sofreír la cebolla picada en aceite hasta que esté transparente.',
      'Agregar la carne picada y cocinar hasta dorar.',
      'Añadir las papas y el zapallo en cubos, más el arroz.',
      'Cubrir con agua caliente, sazonar con sal y comino.',
      'Cocinar a fuego medio 25 minutos hasta que todo esté tierno.',
      'Servir caliente, idealmente con ensalada.',
    ],
  },
  {
    id: 'porotos-granados',
    titulo: 'Porotos Granados',
    descripcion: 'Tradición chilena en cada cucharada. Nutritivo y económico.',
    porciones: '6 personas',
    tiempo: '60 min',
    ingredientes: [
      { nombre: 'Porotos granados', cantidad: '500 g' },
      { nombre: 'Zapallo', cantidad: '300 g' },
      { nombre: 'Choclo', cantidad: '4 unidades' },
      { nombre: 'Cebolla', cantidad: '1 unidad' },
      { nombre: 'Aceite Miraflores', cantidad: '2 cucharadas', productId: 'aceite-miraflores' },
      { nombre: 'Sal y orégano', cantidad: 'a gusto' },
    ],
    pasos: [
      'Remojar los porotos la noche anterior y cocinarlos en agua hasta ablandar.',
      'En otra olla, sofreír la cebolla en aceite.',
      'Agregar el zapallo en cubos y el choclo rallado.',
      'Añadir los porotos cocidos y sazonar con sal y orégano.',
      'Cocinar a fuego bajo 20 minutos, revolviendo ocasionalmente.',
      'Servir bien caliente.',
    ],
  },
  {
    id: 'arroz-leche',
    titulo: 'Arroz con Leche',
    descripcion: 'Postre casero fácil y delicioso. Perfecto para compartir.',
    porciones: '4 personas',
    tiempo: '30 min',
    ingredientes: [
      { nombre: 'Arroz Tucapel', cantidad: '1 taza', productId: 'arroz-tucapel' },
      { nombre: 'Azúcar Iansa', cantidad: '½ taza', productId: 'azucar-iansa' },
      { nombre: 'Leche', cantidad: '1 litro' },
      { nombre: 'Canela', cantidad: '1 ramita' },
      { nombre: 'Cáscara de limón', cantidad: '1 trozo' },
    ],
    pasos: [
      'Lavar el arroz y cocinarlo en agua por 10 minutos.',
      'Escurrir y agregar la leche, el azúcar, la canela y la cáscara de limón.',
      'Cocinar a fuego bajo, revolviendo constantemente, por 15 minutos.',
      'Retirar la canela y el limón.',
      'Servir tibio o frío, espolvoreado con canela en polvo.',
    ],
  },
];
