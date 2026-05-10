/** Base URL khu vực quản lý người bán (sidebar + outlet). */
export const SELLER_HUB_BASE = "/thong-ke-cua-hang";

export const sellerHubPaths = {
  overview: SELLER_HUB_BASE,
  products: `${SELLER_HUB_BASE}/san-pham`,
  sellOrders: `${SELLER_HUB_BASE}/don-ban`,
  messages: `${SELLER_HUB_BASE}/tin-nhan`,
  shopSettings: "/dang-ky-ban-hang",
  newProduct: "/dang-tin-san-pham",
} as const;
