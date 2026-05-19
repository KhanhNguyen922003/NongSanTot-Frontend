export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  shipping: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
  awaiting_buyer_address: { label: 'Chờ người mua cập nhật địa chỉ', color: 'bg-orange-100 text-orange-800 border-orange-200' },
};

export const GHTK_STATUS_MAP: Record<number | string, string> = {
  '-1': 'Hủy đơn hàng',
  1: 'Chưa tiếp nhận',
  2: 'Đã tiếp nhận',
  3: 'Đã lấy hàng',
  4: 'Đang giao hàng',
  5: 'Đã giao hàng',
  6: 'Đã đối soát',
  7: 'Không lấy được hàng',
  8: 'Hoãn lấy hàng',
  9: 'Không giao được hàng',
  10: 'Delay giao hàng',
  11: 'Đã đối soát trả hàng',
  12: 'Đang luân chuyển',
  20: 'Đang trả hàng',
  21: 'Đã trả hàng',
  123: 'Shipper báo đã lấy hàng',
  127: 'Shipper báo không lấy được hàng',
  128: 'Shipper báo delay lấy hàng',
  45: 'Shipper báo đã giao hàng',
  49: 'Shipper báo không giao được giao hàng',
  410: 'Shipper báo delay giao hàng',
};

export function getGhtkStatusLabel(status: number | null | undefined): string {
  if (status == null) return 'Chưa có thông tin';
  return GHTK_STATUS_MAP[status] || `Trạng thái ${status}`;
}
