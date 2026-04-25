export const queryKeys = {
  authMe: ['auth', 'me'] as const,
  myShops: ['shops', 'me'] as const,
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
