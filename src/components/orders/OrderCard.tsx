import { Link } from 'react-router-dom';
import { Package, MapPin, Truck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OrderDetail } from '@/queries/orders/types';
import { ORDER_STATUS_MAP, getGhtkStatusLabel } from '@/constants/orderStatus';

interface OrderCardProps {
  order: OrderDetail;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const statusInfo = ORDER_STATUS_MAP[order.status] || {
    label: order.status,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  const firstItem = order.items?.[0];
  const extraItemsCount = (order.items?.length || 1) - 1;
  const shippingAddress = order.shippingAddressSnapshot;

  return (
    <div className="p-4 sm:p-6 transition-colors hover:bg-gray-50/50">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Products & Info */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="h-24 w-24 shrink-0 rounded-md border bg-white overflow-hidden flex items-center justify-center">
            {firstItem?.productCoverImage ? (
              <img
                src={firstItem.productCoverImage}
                alt={firstItem.productName || 'Sản phẩm'}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-8 w-8 text-gray-300" />
            )}
          </div>

          {/* Order details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-lg text-gray-900 truncate">
                  {firstItem?.productName || 'Sản phẩm không xác định'}
                  {extraItemsCount > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      +{extraItemsCount} sản phẩm khác
                    </span>
                  )}
                </p>
                <span className="font-bold text-primary ml-4">
                  {order.finalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                  #{order.id.slice(0, 8)}
                </span>
                <span>•</span>
                <span>{new Date(order.createdAt!).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>{order.items?.length || 0} sản phẩm</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-sm">
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 mr-1">Vận chuyển:</span>
                    <span className="font-medium text-gray-700">
                      {getGhtkStatusLabel(order.ghtkShipmentStatus)}
                    </span>
                    {order.shippingCode && (
                      <span className="text-xs text-gray-500 block">
                        Mã VĐ: {order.shippingCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {shippingAddress && (
                <div className="space-y-1 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700 block">
                        {shippingAddress.receiverName}
                      </span>
                      <span
                        className="text-gray-500 block truncate"
                        title={`${shippingAddress.detail}, ${shippingAddress.ward}, ${shippingAddress.province}`}
                      >
                        {shippingAddress.detail}, {shippingAddress.ward}, {shippingAddress.province}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                    <span className="text-gray-600">{shippingAddress.receiverPhone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Badges */}
        <div className="flex flex-col sm:items-end justify-between gap-4 shrink-0 border-t xl:border-t-0 xl:border-l pt-4 xl:pt-0 xl:pl-6">
          <div className="flex flex-col items-start sm:items-end gap-2">
            <Badge variant="outline" className={`border ${statusInfo.color} font-medium`}>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {order.status === 'pending' ? (
              <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-sm">
                <Link to={`/quan-ly-don/don-mua/xac-nhan-don-hang/${order.id}`}>
                  Xác nhận đơn hàng
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full sm:w-auto hover:bg-gray-50">
                <Link to={`/don-hang/${order.id}`}>Chi tiết đơn</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
