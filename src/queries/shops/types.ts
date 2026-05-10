/** Cửa hàng trả về từ API (map với bảng `shops` ở backend). */
export type Shop = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  logo: string | null;
  displayAddress: string | null;
  defaultPickAddressId: string | null;
  rating: number | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CreateShopBody = {
  name: string;
  description?: string;
  logo?: string;
  displayAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  ward?: string;
  detail?: string;
};

export type UpdateShopBody = Partial<CreateShopBody> & { isActive?: boolean };

/** `GET /shops/me/dashboard` — tổng hợp KPI cho FarmerDashboard. */
export type ShopDashboardOverview = {
  shop: {
    id: string;
    name: string;
    isActive: boolean | null;
    rating: number | null;
    updatedAt: string | null;
  };
  ordersByStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    shipping: number;
    delivered: number;
    cancelled: number;
  };
  ordersTotal: number;
  productsByStatus: {
    draft: number;
    pending_review: number;
    active: number;
    rejected: number;
    archived: number;
  };
  productsTotal: number;
  productsLowStockCount: number;
  lowStockThreshold: number;
  newReviewsLast7Days: number;
  unreadBuyerMessages: number;
  revenueDeliveredLast30Days: number;
};
