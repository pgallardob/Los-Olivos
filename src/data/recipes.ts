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
  categoria: string;
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
    categoria: 'Almuerzo',
    ingredientes: [
      { nombre: 'Carne picada', cantidad: '500 g' },
      { nombre: 'Papa', cantidad: '4 unidades' },
      { nombre: 'Zapallo', cantidad: '½ kg' },
      { nombre: 'Cebolla', cantidad: '1 unidad' },
      { nombre: 'Arroz Tucapel Blue Bonnet 900gr', cantidad: '1 taza', productId: 'd55197ba-516d-41c0-a6c8-4b573b0a1947' },
      { nombre: 'Aceite Natura Maravilla 900ml', cantidad: '2 cucharadas', productId: 'bff45cec-5f20-4d88-b465-9eeaf787adb7' },
      { nombre: 'Sal Lobos 1kg', cantidad: 'a gusto', productId: 'ec37840e-5e1c-42e7-b7d3-a928a04261d2' },
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
    categoria: 'Almuerzo',
    ingredientes: [
      { nombre: 'Porotos granados', cantidad: '500 g' },
      { nombre: 'Zapallo', cantidad: '300 g' },
      { nombre: 'Choclo Minuto Verde 200gr', cantidad: '1 unidad', productId: 'd8ecd904-f994-4f9a-a723-379a00978d4f' },
      { nombre: 'Cebolla', cantidad: '1 unidad' },
      { nombre: 'Aceite Natura Maravilla 900ml', cantidad: '2 cucharadas', productId: 'bff45cec-5f20-4d88-b465-9eeaf787adb7' },
      { nombre: 'Sal Lobos 1kg', cantidad: 'a gusto', productId: 'ec37840e-5e1c-42e7-b7d3-a928a04261d2' },
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
    categoria: 'Postre',
    ingredientes: [
      { nombre: 'Arroz Tucapel Blue Bonnet 900gr', cantidad: '1 taza', productId: 'd55197ba-516d-41c0-a6c8-4b573b0a1947' },
      { nombre: 'Azúcar Iansa 900gr', cantidad: '½ taza', productId: '0ac810c7-185d-42a6-878f-c5c6fe2544b4' },
      { nombre: 'Leche Entera Pitrufquen 1lt', cantidad: '1 litro', productId: 'e9ba4e5b-9138-48db-a386-f042459229b4' },
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
  {
    id: 'pancakes',
    titulo: 'Pancakes de Desayuno',
    descripcion: 'Rápidos y esponjosos, ideales para empezar el día con energía.',
    porciones: '4 personas',
    tiempo: '20 min',
    categoria: 'Desayuno',
    ingredientes: [
      { nombre: 'Leche Entera Pitrufquen 1lt', cantidad: '1 taza', productId: 'e9ba4e5b-9138-48db-a386-f042459229b4' },
      { nombre: 'Huevos Primera', cantidad: '2 unidades', productId: 'ce5aa8a5-13d1-4458-839c-0e97902605c3' },
      { nombre: 'Mantequilla Soprole 125gr', cantidad: '2 cucharadas', productId: 'be8b8e38-ac94-4de4-9579-39f7eec6b6b6' },
      { nombre: 'Azúcar Iansa 900gr', cantidad: '2 cucharadas', productId: '0ac810c7-185d-42a6-878f-c5c6fe2544b4' },
      { nombre: 'Sal Lobos 1kg', cantidad: '1 pizca', productId: 'ec37840e-5e1c-42e7-b7d3-a928a04261d2' },
    ],
    pasos: [
      'Batir los huevos con la leche, azúcar y sal.',
      'Agregar la harina tamizada poco a poco hasta obtener una mezcla suave.',
      'Derretir la mantequilla e incorporarla a la mezcla.',
      'Calentar una sartén antiadherente y verter porciones de mezcla.',
      'Cocinar 2 minutos por lado hasta que se formen burbujas.',
      'Servir con miel, mermelada o fruta fresca.',
    ],
  },
  {
    id: 'pasta-queso',
    titulo: 'Pasta con Queso Gauda',
    descripcion: 'Un plato rápido y cremoso que gusta a todos en casa.',
    porciones: '4 personas',
    tiempo: '25 min',
    categoria: 'Almuerzo',
    ingredientes: [
      { nombre: 'Spaghetti Lucchetti N5 400gr', cantidad: '400 g', productId: 'c972ed88-9222-4a7d-8574-d999f8536505' },
      { nombre: 'Queso Gauda Soprole 1kg', cantidad: '200 g', productId: '8030c739-4690-4489-8299-6d7e4b89e130' },
      { nombre: 'Crema de Leche Surlat 200ml', cantidad: '1 unidad', productId: 'e70f2b5b-5907-45ef-bff4-5ffcd420d629' },
      { nombre: 'Aceite Natura Maravilla 900ml', cantidad: '1 cucharada', productId: 'bff45cec-5f20-4d88-b465-9eeaf787adb7' },
      { nombre: 'Sal Lobos 1kg', cantidad: 'a gusto', productId: 'ec37840e-5e1c-42e7-b7d3-a928a04261d2' },
    ],
    pasos: [
      'Cocinar la pasta en agua hirviendo con sal según las instrucciones del paquete.',
      'Rallar el queso gauda.',
      'Escurrir la pasta reservando un poco del agua de cocción.',
      'Mezclar la crema de leche con el queso rallado a fuego bajo.',
      'Incorporar la pasta y mezclar bien, añadiendo agua de cocción si es necesario.',
      'Servir inmediatamente con queso extra espolvoreado.',
    ],
  },
  {
    id: 'completo',
    titulo: 'Completo Italiano Casero',
    descripcion: 'El clásico completo chileno en casa. Rinde para toda la familia.',
    porciones: '4 personas',
    tiempo: '20 min',
    categoria: 'Once/Cena',
    ingredientes: [
      { nombre: 'Pan Hot Dog Marcelo 10 uni', cantidad: '4 unidades', productId: '2fa1a4c8-5831-404f-a164-4688ddf1a7c7' },
      { nombre: 'Salchicha de Pollo Montina 5 unid', cantidad: '4 unidades', productId: 'cf0c373e-5201-4c26-a26f-62f83f8d74fe' },
      { nombre: 'Palta', cantidad: '½ unidad' },
      { nombre: 'Tomate', cantidad: '1 unidad' },
      { nombre: 'Salsa de Tomate Pomarola 200gr', cantidad: 'a gusto', productId: 'd23d40da-39af-42db-9e50-3dc2249271f1' },
    ],
    pasos: [
      'Hervir las salchichas en agua por 5 minutos.',
      'Calentar los panes en el horno o plancha.',
      'Picar la palta y machacarla con un poco de sal y limón.',
      'Picar el tomate en cubos pequeños.',
      'Armar los completos: pan, salchicha, palta, tomate y salsa de tomate.',
      'Servir inmediatamente.',
    ],
  },
  {
    id: 'huevos-pericos',
    titulo: 'Huevos Pericos',
    descripcion: 'Desayuno rápido y nutritivo. Listo en 10 minutos.',
    porciones: '2 personas',
    tiempo: '10 min',
    categoria: 'Desayuno',
    ingredientes: [
      { nombre: 'Huevos Primera', cantidad: '4 unidades', productId: 'ce5aa8a5-13d1-4458-839c-0e97902605c3' },
      { nombre: 'Aceite Natura Maravilla 900ml', cantidad: '1 cucharada', productId: 'bff45cec-5f20-4d88-b465-9eeaf787adb7' },
      { nombre: 'Sal Lobos 1kg', cantidad: 'a gusto', productId: 'ec37840e-5e1c-42e7-b7d3-a928a04261d2' },
      { nombre: 'Pan Molde Blanco Marcelo 500gr', cantidad: '4 rebanadas', productId: 'dd765dda-3775-4f07-8fd3-e6be791abcd1' },
    ],
    pasos: [
      'Batir los huevos en un bol con sal.',
      'Calentar el aceite en una sartén a fuego medio.',
      'Verter los huevos batidos y revolver suavemente.',
      'Cocinar 3-4 minutos hasta que cuajen pero queden cremosos.',
      'Tostar las rebanadas de pan.',
      'Servir los huevos sobre el pan tostado.',
    ],
  },
];
