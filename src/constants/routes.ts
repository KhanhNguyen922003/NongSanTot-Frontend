import { sellerHubPaths } from '@/constants/sellerHub';

export const authPaths = {
  signIn: '/dang-nhap',
  signUp: '/dang-ky',
  adminDashboard: '/admin',
  adminReviewDemo: '/admin/reviews-demo',
} as const;

export const marketplacePaths = {
  home: '/',
  cart: '/gio-hang',
  checkout: '/dat-hang',
  buyOrders: '/don-mua',
  orderDetail: (orderId: string) => `/don-hang/${encodeURIComponent(orderId)}`,
} as const;

export const sellerProductPaths = {
  edit: (productId: string) => `${sellerHubPaths.products}?edit=${encodeURIComponent(productId)}`,
  stock: (productId: string) => `${sellerHubPaths.products}?edit=${encodeURIComponent(productId)}&focus=stock`,
  orders: (productId: string) => `${sellerHubPaths.sellOrders}?productId=${encodeURIComponent(productId)}`,
} as const;