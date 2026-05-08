export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  productName: string | null;
  productPrice: number | null;
  productUnit: string | null;
  productStock: number | null;
  productCoverImage: string | null;
  productImages: string[] | null;
  productStatus: 'draft' | 'pending_review' | 'active' | 'rejected' | 'archived' | null;
  productIsAvailable: boolean | null;
  shopId: string | null;
  shopName: string | null;
  shopDisplayAddress: string | null;
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
};

export type AddCartItemBody = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemBody = {
  quantity: number;
};
