/** Cửa hàng trả về từ API (map với bảng `shops` ở backend). */
export type Shop = {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  logo: string | null;
  displayAddress: string | null;
  defaultPickAddressId: number | null;
  rating: number | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CreateShopBody = {
  name: string;
  description?: string;
  logo?: string;
  displayAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  district?: string;
  ward?: string;
  detail?: string;
};

export type UpdateShopBody = Partial<CreateShopBody> & { isActive?: boolean };
