export enum UserRole {
  BUYER = 'BUYER',
  FARMER = 'FARMER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ProductGrowthDiary {
  id: string;
  productId: string;
  date: string;
  description: string;
  images: string[];
}

export interface Shop {
  id: string;
  farmerId: string;
  name: string;
  displayAddress: string;
  verified: boolean;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  description: string;
  hasVerifiedDiary: boolean;
  diaries?: ProductGrowthDiary[];
  shop?: Shop;
}
