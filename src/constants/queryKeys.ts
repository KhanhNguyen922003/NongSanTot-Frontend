export const queryKeys = {
  authMe: ['auth', 'me'] as const,
  myShops: ['shops', 'me'] as const,
  shopDashboard: ['shops', 'me', 'dashboard'] as const,
  categories: {
    all: ['categories'] as const,
    detail: (id: string) => ['categories', id] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    products: (status: string) => ['admin', 'products', status] as const,
    product: (id: string) => ['admin', 'products', id] as const,
  },
  products: {
    all: (filtersKey: string) => ['products', 'list', filtersKey] as const,
    detail: (id: string) => ['products', id] as const,
    sellerList: ['products', 'me', 'list'] as const,
  },
  cart: {
    me: ['carts', 'me'] as const,
  },
  orders: {
    shippingQuote: (addressId: string, fastShipping: boolean) =>
      ['orders', 'checkout', 'quote', addressId, fastShipping] as const,
    myBuy: ['orders', 'me', 'buy'] as const,
    mySell: ['orders', 'me', 'sell'] as const,
    detail: (id: string) => ['orders', id] as const,
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
