import { Product } from '@/shared/types';

export type MarketplaceCategory = {
  id: string;
  label: string;
};

export type MarketplaceFilter = {
  id: string;
  label: string;
};

export type MarketplaceProduct = Product & {
  image: string;
  location: string;
  soldText: string;
  rating: number;
  reviewCount: number;
};

export const marketplaceCategories: MarketplaceCategory[] = [
  { id: 'rau-cu', label: 'Rau củ quả và nấm' },
  { id: 'trai-cay', label: 'Trái cây tươi' },
  { id: 'thit', label: 'Thịt' },
  { id: 'hai-san', label: 'Hải sản' },
  { id: 'dong-lanh', label: 'Thực phẩm đông lạnh' },
  { id: 'gia-vi', label: 'Mắm, gia vị và thảo mộc' },
  { id: 'trung-sua', label: 'Trứng, bơ, sữa và phô mai' },
  { id: 'do-kho', label: 'Đồ khô' },
];

export const marketplaceQuickFilters: MarketplaceFilter[] = [
  { id: 'new', label: 'Sản phẩm mới' },
  { id: 'seasonal', label: 'Sản phẩm theo mùa' },
  { id: 'regional', label: 'Đặc sản vùng miền' },
  { id: 'for-you', label: 'Gợi ý cho bạn' },
];

export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: '1',
    shopId: 's1',
    name: 'Sầu riêng Ri6 tách múi',
    price: 198000,
    quantity: 120,
    unit: 'Hộp',
    description: 'Sầu riêng Ri6 tuyển chọn, đóng hộp tiện lợi.',
    hasVerifiedDiary: true,
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80',
    location: 'Tiền Giang',
    soldText: 'Đã bán 1.2 tấn',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    shopId: 's2',
    name: 'Bơ sáp Đắk Lắk loại 1',
    price: 52000,
    quantity: 300,
    unit: 'Kg',
    description: 'Bơ sáp dẻo thơm, chín đều tự nhiên.',
    hasVerifiedDiary: true,
    image: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=800&q=80',
    location: 'Đắk Lắk',
    soldText: 'Đã bán 860 kg',
    rating: 4.7,
    reviewCount: 98,
  },
  {
    id: '3',
    shopId: 's3',
    name: 'Cá chỉ vàng khô tẩm gia vị',
    price: 150000,
    quantity: 80,
    unit: 'Gói',
    description: 'Cá chỉ vàng khô cay nhẹ, nướng ăn liền.',
    hasVerifiedDiary: false,
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80',
    location: 'Nha Trang',
    soldText: 'Đã bán 430 gói',
    rating: 4.6,
    reviewCount: 57,
  },
  {
    id: '4',
    shopId: 's4',
    name: 'Bánh cốm truyền thống',
    price: 76500,
    quantity: 220,
    unit: 'Hộp',
    description: 'Bánh cốm dẻo thơm, nhân đậu xanh ngọt thanh.',
    hasVerifiedDiary: false,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    location: 'Hà Nội',
    soldText: 'Đã bán 300 hộp',
    rating: 4.5,
    reviewCount: 76,
  },
  {
    id: '5',
    shopId: 's5',
    name: 'Tôm thẻ chân trắng hữu cơ',
    price: 242000,
    quantity: 95,
    unit: 'Kg',
    description: 'Tôm tươi cấp đông nhanh, đảm bảo ngọt thịt.',
    hasVerifiedDiary: true,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d19f35f8?auto=format&fit=crop&w=800&q=80',
    location: 'Bạc Liêu',
    soldText: 'Đã bán 740 kg',
    rating: 4.9,
    reviewCount: 142,
  },
  {
    id: '6',
    shopId: 's6',
    name: 'Cà phê Robusta đặc sản',
    price: 180000,
    quantity: 250,
    unit: 'Túi',
    description: 'Robusta rang mộc, hậu vị socola đắng nhẹ.',
    hasVerifiedDiary: false,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    location: 'Gia Lai',
    soldText: 'Đã bán 1.5 nghìn túi',
    rating: 4.8,
    reviewCount: 203,
  },
];

export const getMarketplaceProductById = (productId: string) =>
  marketplaceProducts.find((item) => item.id === productId);
