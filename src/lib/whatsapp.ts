import { CartItem, Product, BusinessSettings, CheckoutData } from '@/types/domain';
import { formatCentsToBRL } from '@/lib/formatters';
import { generatePixEMV } from '@/lib/pix';
import { getItemUnitPrice, calculateCheckoutTotal } from '@/lib/checkout';

export interface BuildWhatsAppOrderParams {
  cart: CartItem[];
  products: Product[];
  checkoutData: CheckoutData;
  settings: BusinessSettings;
}

export function buildWhatsAppOrderMessage({
  cart,
  products,
  checkoutData,
  settings,
}: BuildWhatsAppOrderParams): string {
  const totalCents = calculateCheckoutTotal(cart, products, checkoutData.deliveryMethod, settings);
  const totalStr = formatCentsToBRL(totalCents);

  const emojiDetalhes = '🍮';
  const emojiCliente = '👤';
  const emojiEntrega = '🛵';
  const emojiRetirada = '🛍️';
  const emojiPagamento = '💳';
  const emojiPix = '🔑';

  const deliveryIcon = checkoutData.deliveryMethod === 'entrega' ? emojiEntrega : emojiRetirada;
  const deliveryMethodStr =
    checkoutData.deliveryMethod === 'entrega' ? 'Entrega (Delivery)' : 'Retirar na Loja';

  let paymentMethodStr = '';
  if (checkoutData.paymentMethod === 'pix') {
    paymentMethodStr = 'Pix (Pago via Copia e Cola do site)';
  } else if (checkoutData.paymentMethod === 'cartao') {
    paymentMethodStr = 'Cartão';
  } else {
    const change = checkoutData.changeAmount?.trim();
    paymentMethodStr = `Dinheiro (Troco para: ${change ? change : 'Não necessário'})`;
  }

  let msg = `Olá, ${settings.storeName}! Gostaria de fazer um pedido através do site:\n\n`;
  msg += `${emojiDetalhes} *DETALHES DO PEDIDO*\n`;

  cart.forEach((item, idx) => {
    const product = products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    const productName = product?.name || item.cachedProductName || 'Produto';
    const variantName = variant?.name || item.cachedVariantName || 'Padrão';
    const unitPrice = getItemUnitPrice(item, products);
    const subtotalCents = unitPrice * item.quantity;

    msg += `\n*Item ${idx + 1}:* ${productName}\n`;
    msg += `*Quantidade:* ${item.quantity}x\n`;
    msg += `*Opção/Sabor:* ${variantName}\n`;
    msg += `*Subtotal:* ${formatCentsToBRL(subtotalCents)}\n`;
    if (item.observations) {
      msg += `*Obs. do item:* ${item.observations}\n`;
    }
  });

  msg += `\n*Valor Total:* ${totalStr}\n\n`;
  msg += `---\n`;
  msg += `${emojiCliente} *CLIENTE*\n`;
  msg += `*Nome:* ${checkoutData.clientName.trim()}\n\n`;
  msg += `---\n`;
  msg += `${deliveryIcon} *ENVIO*\n`;
  msg += `*Tipo:* ${deliveryMethodStr}\n`;
  if (checkoutData.deliveryMethod === 'entrega' && checkoutData.deliveryAddress) {
    msg += `*Endereço:* ${checkoutData.deliveryAddress.trim()}\n`;
  }
  msg += `\n---\n`;
  msg += `${emojiPagamento} *PAGAMENTO*\n`;
  msg += `*Forma:* ${paymentMethodStr}\n`;

  if (checkoutData.paymentMethod === 'pix') {
    const pixCode = generatePixEMV(
      settings.pixKey,
      settings.pixBeneficiary,
      settings.pixCity,
      totalCents
    );
    msg += `\n---\n${emojiPix} *CÓDIGO PIX COPIA E COLA*\n${pixCode}`;
  }

  return msg;
}

export function buildWhatsAppUrl(whatsappPhone: string, message: string): string {
  const cleanPhone = whatsappPhone.replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}
