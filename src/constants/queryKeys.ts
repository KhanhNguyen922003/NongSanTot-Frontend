export const queryKeys = {
  authMe: ['auth', 'me'] as const,
  myShops: ['shops', 'me'] as const,
  shopDashboard: ['shops', 'me', 'dashboard'] as const,
  shops: {
    detail: (id: string) => ['shops', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    detail: (id: string) => ['categories', id] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    products: (status: string) => ['admin', 'products', status] as const,
    product: (id: string) => ['admin', 'products', id] as const,
    shops: (status: string) => ['admin', 'shops', status] as const,
  },
  products: {
    all: (filtersKey: string) => ['products', 'list', filtersKey] as const,
    detail: (id: string) => ['products', id] as const,
    sellerList: ['products', 'me', 'list'] as const,
  },
  reviews: {
    byProduct: (id: string) => ['reviews', 'product', id] as const,
    eligibility: (id: string) => ['reviews', 'eligibility', id] as const,
  },
  cart: {
    me: ['carts', 'me'] as const,
  },
  messaging: {
    mine: ['conversations', 'me'] as const,
    detail: (id: string) => ['conversations', id] as const,
    messages: (id: string) => ['conversations', id, 'messages'] as const,
  },
  orders: {
    shippingQuote: (addressId: string) => ['orders', 'checkout', 'quote', addressId] as const,
    myBuyPrefix: ['orders', 'me', 'buy'] as const,
    myBuy: (ghtkStatus?: string) =>
      [
        'orders',
        'me',
        'buy',
        ghtkStatus && ghtkStatus !== 'all' ? ghtkStatus : 'all',
      ] as const,
    mySell: ['orders', 'me', 'sell'] as const,
    detail: (id: string) => ['orders', id] as const,
    ghtkTracking: (id: string) => ['orders', id, 'ghtk-tracking'] as const,
  },
  addresses: {
    byUser: (userId: string) => ['addresses', 'user', userId] as const,
  },
  vietnamProvinceApi: {
    all: ['vietnam-province-api'] as const,
    provinces: ['vietnam-province-api', 'provinces'] as const,
    province: (provinceCode: number) => ['vietnam-province-api', 'province', provinceCode] as const,
    provinceSearch: (term: string) => ['vietnam-province-api', 'province-search', term] as const,
    districts: (provinceCode: number) => ['vietnam-province-api', 'districts', provinceCode] as const,
    district: (districtCode: number) => ['vietnam-province-api', 'district', districtCode] as const,
    districtSearch: (provinceCode: number, term: string) =>
      ['vietnam-province-api', 'district-search', provinceCode, term] as const,
    wards: (districtCode: number) => ['vietnam-province-api', 'wards', districtCode] as const,
    wardSearch: (districtCode: number, term: string) =>
      ['vietnam-province-api', 'ward-search', districtCode, term] as const,
  },
};
