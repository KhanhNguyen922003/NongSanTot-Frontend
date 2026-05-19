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
    activeShops: number;
    inactiveShops: number;
    buyers: number;
    sellers: number;
    admins: number;
    products: number;
    pendingProducts: number;
  };
  recentPendingProducts: AdminProductListItem[];
};

export type AdminUserRoleFilter = 'all' | 'buyer' | 'seller' | 'admin';

export type AdminUserListItem = {
  id: string;
  firebaseUid: string | null;
  phone: string;
  fullName: string;
  avatar: string | null;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: string | null;
  shopCount: number;
  productCount: number;
};

export type AdminShopStatusFilter = 'all' | 'active' | 'inactive';

export type AdminShopListItem = {
  id: string;
  name: string;
  description: string | null;
  displayAddress: string | null;
  logo: string | null;
  isActive: boolean;
  rating: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  ownerId: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  productCount: number;
  activeProductCount: number;
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
