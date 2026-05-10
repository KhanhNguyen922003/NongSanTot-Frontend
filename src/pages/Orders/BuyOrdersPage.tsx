import { Link, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { auth } from '../../../firebase.config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useMyBuyOrdersQuery } from '@/queries/orders/useOrders';

const BuyOrdersPage = () => {
  const isAuthenticated = !!auth.currentUser;
  const { data, isLoading, isError, error } = useMyBuyOrdersQuery();

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent('/don-mua')}`} replace />;
  }

  return (
    <main className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Đơn mua của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải đơn mua...
            </div>
          ) : isError ? (
            <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải đơn mua.')}</p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
          ) : (
            <div className="space-y-3">
              {data.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-[#27272a]">Đơn #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.finalPrice.toLocaleString('vi-VN')}đ · {order.status}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/don-hang/${order.id}`}>Xem chi tiết</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default BuyOrdersPage;
