export interface ProductConfigItem {
  price: number;
  options: string[];
  description: string;
  image: string;
  alt: string;
}

export interface CartItem {
  id: string;
  product: string;
  price: number;
  qty: number;
  option: string;
  observations: string;
}

export type DeliveryMethod = 'entrega' | 'retirada';
export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export const PRODUCT_CONFIG: Record<string, ProductConfigItem> = {
  'Pudim Clássico': {
    price: 17.00,
    options: ['Tradicional de Leite Moça'],
    description: 'Textura ultra aveludada, calda de caramelo brilhante e o sabor inconfundível do verdadeiro leite condensado.',
    image: '/assets/pudim_classico.png',
    alt: 'Pudim Clássico de Leite Moça',
  },
  'Cones Trufados': {
    price: 5.00,
    options: ['Chocolate Tradicional', 'Ninho com Nutella', 'Misto'],
    description: 'Cones de wafer crocantes recheados com ganache artesanal cremosa nos sabores Tradicional, Ninho e Nutella.',
    image: '/assets/cones_trufados.png',
    alt: 'Cones Trufados Variados',
  },
  'Caixa de Trufas Gourmet': {
    price: 6.00,
    options: ['Ao Leite', 'Meio Amargo', 'Sensação', 'Maracujá', 'Sortido'],
    description: 'Seleção especial de 6 trufas artesanais com chocolate nobre e recheios cremosos — perfeita para presentear.',
    image: '/assets/caixa_trufas.png',
    alt: 'Caixa de Trufas Gourmet',
  },
};

export const PIX_KEY = 'suachave@email.com';
export const PIX_BENEFICIARY = 'Pudim e Cia';
export const PIX_CITY = 'Araraquara';
export const WHATSAPP_PHONE = '5516991359739';
export const CART_STORAGE_KEY = 'pudimecia_cart_v1';
export const NAME_STORAGE_KEY = 'pudimecia_client_name';
