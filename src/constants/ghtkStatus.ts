/**
 * Trạng thái vận đơn GHTK (theo tài liệu Giao Hàng Tiết Kiệm).
 */
export enum GhtkStatus {
  CANCELED = -1,
  NOT_RECEIVED = 1,
  RECEIVED = 2,
  PICKING = 3,
  WAREHOUSED = 4,
  DELIVERING = 5,
  DELIVERED = 6,
  REJECTED = 7,
  RE_DELIVERING = 8,
  RETURNING = 9,
  RETURNED = 10,
  SHOP_CANCEL = 11,
  IN_TRANSIT = 12,
}

export const GHTK_STATUS_LABELS: Record<GhtkStatus, string> = {
  [GhtkStatus.CANCELED]: 'Đã hủy (GHTK)',
  [GhtkStatus.NOT_RECEIVED]: 'Chưa tiếp nhận',
  [GhtkStatus.RECEIVED]: 'Đã tiếp nhận',
  [GhtkStatus.PICKING]: 'Đang lấy hàng',
  [GhtkStatus.WAREHOUSED]: 'Đã nhập kho',
  [GhtkStatus.DELIVERING]: 'Đang giao hàng',
  [GhtkStatus.DELIVERED]: 'Giao thành công',
  [GhtkStatus.REJECTED]: 'Khách từ chối nhận',
  [GhtkStatus.RE_DELIVERING]: 'Hẹn giao lại',
  [GhtkStatus.RETURNING]: 'Đang hoàn về shop',
  [GhtkStatus.RETURNED]: 'Đã hoàn về shop',
  [GhtkStatus.SHOP_CANCEL]: 'Shop yêu cầu hủy',
  [GhtkStatus.IN_TRANSIT]: 'Luân chuyển kho',
};

export function formatGhtkShipmentStatus(status: number | null | undefined): string {
  if (status == null) return 'Chưa đồng bộ GHTK';
  if (Object.prototype.hasOwnProperty.call(GHTK_STATUS_LABELS, status)) {
    return GHTK_STATUS_LABELS[status as GhtkStatus];
  }
  return `GHTK: mã ${status}`;
}

export const BUY_ORDERS_GHTK_TAB_ORDER: GhtkStatus[] = [
  GhtkStatus.NOT_RECEIVED,
  GhtkStatus.RECEIVED,
  GhtkStatus.PICKING,
  GhtkStatus.WAREHOUSED,
  GhtkStatus.IN_TRANSIT,
  GhtkStatus.DELIVERING,
  GhtkStatus.RE_DELIVERING,
  GhtkStatus.DELIVERED,
  GhtkStatus.REJECTED,
  GhtkStatus.RETURNING,
  GhtkStatus.RETURNED,
  GhtkStatus.SHOP_CANCEL,
  GhtkStatus.CANCELED,
];
