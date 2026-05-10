import { Link, Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { auth } from '../../../firebase.config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useCancelOrderMutation, useOrderDetailQuery } from '@/queries/orders/useOrders';

const OrderDetailPage = () => {
  const { orderId = '' } = useParams();
  const isAuthenticated = !!auth.currentUser;
  const { data, isLoading, isError, error } = useOrderDetailQuery(orderId);
  const cancelOrder = useCancelOrderMutation(orderId);

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent(`/don-hang/${orderId}`)}`} replace />;
  }

  return (
    <main className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải chi tiết đơn...
            </div>
          ) : isError || !data ? (
            <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải đơn hàng.')}</p>
          ) : (
            <>
              <p className="text-sm">
                Mã đơn: <span className="font-medium">{data.id}</span>
              </p>
              <p className="text-sm text-muted-foreground">Trạng thái: {data.status}</p>
              <p className="text-sm text-muted-foreground">Mã vận đơn: {data.shippingCode || 'Chưa có'}</p>
              <p className="text-sm text-muted-foreground">
                Tổng tiền: {data.totalPrice.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-sm text-muted-foreground">
                Phí ship: {data.shippingFee.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-lg font-semibold text-primary">
                Thành tiền: {data.finalPrice.toLocaleString('vi-VN')}đ
              </p>
              <div className="space-y-2 rounded-md border p-3">
                {data.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <p className="text-sm">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {item.priceAtPurchase.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link to="/don-mua">Quay lại đơn mua</Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  disabled={cancelOrder.isPending || data.status === 'cancelled' || data.status === 'delivered'}
                  onClick={() => void cancelOrder.mutateAsync()}
                >
                  {cancelOrder.isPending ? 'Đang hủy...' : 'Hủy đơn'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default OrderDetailPage;
