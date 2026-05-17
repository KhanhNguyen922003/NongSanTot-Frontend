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
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipping'
    | 'delivered'
    | 'cancelled'
    | 'awaiting_buyer_address';
  shippingCode: string | null;
  ghtkShipmentStatus?: number | null;
  note: string | null;
  negotiationOfferId?: string | null;
  createdAt: string | null;
  /** Chỉ có ở danh sách đơn mua. */
  shopName?: string | null;
  /** Chỉ có ở danh sách đơn mua — phục vụ tìm kiếm. */
  productNames?: string[];
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
  /** Backend: đơn từ trả giá, chờ buyer chọn địa chỉ giao. */
  negotiationAwaitingBuyerAddress?: boolean;
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

export type BuyerConfirmNegotiationBody = {
  shippingAddressId: string;
  fastShipping?: boolean;
};

export type CheckoutResult = {
  success: boolean;
  orders: Order[];
  message: string;
};

export type GhtkTrackingOrder = {
  labelId: string | null;
  partnerId: string | null;
  status: string | null;
  statusText: string | null;
  created: string | null;
  modified: string | null;
  message: string | null;
  pickDate: string | null;
  deliverDate: string | null;
  shipMoney: string | null;
  insurance: string | null;
  value: string | null;
  weight: string | null;
  pickMoney: number | null;
  isFreeship: string | null;
  customerFullname: string | null;
  customerTel: string | null;
  address: string | null;
  storageDay: string | null;
};

export type GhtkShipmentTrackingResponse = {
  success: boolean;
  isMock?: boolean;
  message?: string;
  order: GhtkTrackingOrder;
};

export type CartGroup = {
  shopId: string;
  shopName: string;
  items: CartItem[];
};
