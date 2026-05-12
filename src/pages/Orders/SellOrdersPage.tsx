import { Link, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { auth } from '../../../firebase.config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sellerHubPaths } from '@/constants/sellerHub';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useMySellOrdersQuery } from '@/queries/orders/useOrders';

const SellOrdersPage = () => {
  const isAuthenticated = !!auth.currentUser;
  const { data, isLoading, isError, error } = useMySellOrdersQuery();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/dang-nhap?next=${encodeURIComponent(sellerHubPaths.sellOrders)}`}
        replace
      />
    );
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Đơn bán của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải đơn bán...
            </div>
          ) : isError ? (
            <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải đơn bán.')}</p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground">Bạn chưa có đơn bán nào.</p>
          ) : (
            <div className="space-y-3">
              {data.map((order) => (
                <div key={order.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-[#27272a]">Đơn #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.finalPrice.toLocaleString('vi-VN')}đ · {order.status}
                    </p>
                  </div>
                  {order.status === 'pending' ? (
                    <Button asChild size="sm" className="w-full shrink-0 sm:w-auto">
                      <Link to={`/quan-ly-don/don-mua/xac-nhan-don-hang/${order.id}`}>
                        Xác nhận đơn
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                      <Link to={`/don-hang/${order.id}`}>Xem chi tiết</Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellOrdersPage;
