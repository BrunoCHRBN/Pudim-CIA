export interface MockProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  options: string[];
  image: string;
  alt: string;
  testId: string;
  btnTestId: string;
  delayClass: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'pudim-classico',
    name: 'Pudim Clássico',
    price: 17.00,
    description: 'Textura ultra aveludada, calda de caramelo brilhante e o sabor inconfundível do verdadeiro leite condensado.',
    options: ['Tradicional de Leite Moça'],
    image: '/assets/pudim_classico.png',
    alt: 'Pudim Clássico de Leite Moça',
    testId: 'product-card-pudim',
    btnTestId: 'btn-encomendar-pudim',
    delayClass: '',
  },
  {
    id: 'cones-trufados',
    name: 'Cones Trufados',
    price: 5.00,
    description: 'Cones de wafer crocantes recheados com ganache artesanal cremosa nos sabores Tradicional, Ninho e Nutella.',
    options: ['Chocolate Tradicional', 'Ninho com Nutella', 'Misto'],
    image: '/assets/cones_trufados.png',
    alt: 'Cones Trufados Variados',
    testId: 'product-card-cones',
    btnTestId: 'btn-encomendar-cones',
    delayClass: 'delay-1',
  },
  {
    id: 'trufas-gourmet',
    name: 'Caixa de Trufas Gourmet',
    price: 6.00,
    description: 'Seleção especial de 6 trufas artesanais com chocolate nobre e recheios cremosos — perfeita para presentear.',
    options: ['Ao Leite', 'Meio Amargo', 'Sensação', 'Maracujá', 'Sortido'],
    image: '/assets/caixa_trufas.png',
    alt: 'Caixa de Trufas Gourmet',
    testId: 'product-card-trufas',
    btnTestId: 'btn-encomendar-trufas',
    delayClass: 'delay-2',
  },
];
