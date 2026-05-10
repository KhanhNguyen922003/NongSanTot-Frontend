import type { CartItem } from '@/queries/carts/types';

export type ShippingQuotePerShop = {
  shopId: string;
  shopName: string;
  shippingFee: number;
  shippingFeeText: string;
  isMock: boolean;
  itemsTotal: number;
  finalTotal: number;
};

export type CheckoutShippingQuote = {
  shippingAddressId: string;
  fastShipping: boolean;
  quotes: ShippingQuotePerShop[];
  totals: {
    itemsTotal: number;
    shippingTotal: number;
    finalTotal: number;
  };
};

export type CheckoutBody = {
  shippingAddressId: string;
  note?: string;
  fastShipping?: boolean;
};

export type Order = {
  id: string;
  buyerId: string;
  shopId: string;
  shippingAddressSnapshot: string;
  actualPickAddressId: string | null;
  totalPrice: number;
  shippingFee: number;
  finalPrice: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  shippingCode: string | null;
  note: string | null;
  createdAt: string | null;
};

export type OrderDetail = Order & {
  shippingAddressSnapshot: {
    addressId: string;
    receiverName: string;
    receiverPhone: string;
    province: string;
    ward: string;
    detail: string;
  } | null;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: number;
    productName: string | null;
    productCoverImage: string | null;
  }>;
  shop: {
    id: string;
    ownerId: string;
    name: string;
    displayAddress: string | null;
    defaultPickAddressId: string | null;
  } | null;
};

export type ConfirmOrderBody = {
  actualPickAddressId?: string;
  fastShipping?: boolean;
};

export type CheckoutResult = {
  success: boolean;
  orders: Order[];
  message: string;
};

export type CartGroup = {
  shopId: string;
  shopName: string;
  items: CartItem[];
};
