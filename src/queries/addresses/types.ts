export type Address = {
  id: string;
  userId: string;
  label: string | null;
  receiverName: string;
  receiverPhone: string;
  province: string;
  ward: string;
  detail: string;
  isDefault: boolean | null;
  createdAt: string | null;
};

export type AddressBody = {
  userId: string;
  label?: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  ward: string;
  detail: string;
  isDefault?: boolean;
};
