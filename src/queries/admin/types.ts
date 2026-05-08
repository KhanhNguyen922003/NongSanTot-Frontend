export type AdminProductStatus = 'draft' | 'pending_review' | 'active' | 'rejected' | 'archived';

export type AdminProductListItem = {
  id: string;
  name: string;
  origin: string;
  price: number;
  stock: number;
  unit: string | null;
  coverImage: string | null;
  status: AdminProductStatus;
  rejectionReason: string | null;
  trustScore: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  shopId: string | null;
  shopName: string | null;
  shopOwnerPhone: string | null;
};

export type AdminDashboard = {
  totals: {
    users: number;
    shops: number;
    products: number;
    pendingProducts: number;
  };
  recentPendingProducts: AdminProductListItem[];
};

export type AdminGrowthDiaryItem = {
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

export type AdminProductDetail = AdminProductListItem & {
  categoryId: string | null;
  description: string | null;
  images: string[] | null;
  videos: string[] | null;
  shippingMethods: string[] | null;
  pickupAddressSnapshot: {
    displayAddress?: string;
    receiverName?: string;
    receiverPhone?: string;
  } | null;
  preferredShippingServiceId: number | null;
  moderationScore: number | null;
  moderationResult: unknown | null;
  moderatedAt: string | null;
  verifiedBadge: boolean | null;
  isAvailable: boolean | null;
  growthDiary: AdminGrowthDiaryItem[];
};
