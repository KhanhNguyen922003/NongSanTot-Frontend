export type CreateProductGrowthDiaryBody = {
  stageName: string;
  logDate: string;
  description?: string | null;
  images: string[];
};

export type CreateProductBody = {
  categoryId?: string;
  name: string;
  description: string;
  origin: string;
  price: number;
  stock: number;
  unit: string;
  images: string[];
  videos?: string[];
  shippingMethods: string[];
  pickupAddress?: {
    displayAddress: string;
    receiverName: string;
    receiverPhone: string;
  };
  preferredShippingServiceId?: number;
  isAvailable?: boolean;
  growthDiary?: CreateProductGrowthDiaryBody[];
};

export type Product = {
  id: string;
  shopId: string;
  categoryId: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  name: string;
  description: string | null;
  origin: string;
  price: number;
  stock: number;
  unit: string | null;
  tags?: string[] | null;
  coverImage: string | null;
  images: string[] | null;
  videos: string[] | null;
  shippingMethods: string[] | null;
  pickupAddressSnapshot: unknown | null;
  preferredShippingServiceId: number | null;
  status: 'draft' | 'pending_review' | 'active' | 'rejected' | 'archived';
  rejectionReason?: string | null;
  trustScore: number | null;
  verifiedBadge: boolean | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  isAvailable: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  shopName?: string | null;
  shopDisplayAddress?: string | null;
  growthDiaryCount?: number;
};

export type ProductGrowthDiary = {
  id: string;
  productId: string;
  stageOrder: number;
  stageName: string;
  description: string | null;
  images: string[] | null;
  videos: string[] | null;
  documents: string[] | null;
  logDate: string | null;
};

export type MarketplaceProduct = Product & {
  growthDiary?: ProductGrowthDiary[];
};

/** PATCH /products/me/:id — các trường tùy chọn. */
export type UpdateSellerProductBody = {
  name?: string;
  description?: string;
  origin?: string;
  price?: number;
  stock?: number;
  unit?: string;
  tags?: string[];
  images?: string[];
  videos?: string[];
  shippingMethods?: string[];
  isAvailable?: boolean;
};

export type ProductsFilterParams = {
  q?: string;
  categorySlug?: string[];
  categoryId?: string[];
  tags?: string[];
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
};
