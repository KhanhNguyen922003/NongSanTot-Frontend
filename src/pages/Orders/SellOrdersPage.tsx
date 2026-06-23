import { Navigate } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { sellerHubPaths } from '@/constants/sellerHub';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useMySellOrdersQuery } from '@/queries/orders/useOrders';
import { OrderCard } from '@/components/orders/OrderCard';
import useAuthStore from '@/stores/auth.store';

const SellOrdersPage = () => {
  const isAuthenticated = !!useAuthStore((state) => state.user);
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
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Đơn bán của tôi</h1>
        <p className="text-muted-foreground mt-2">Quản lý và theo dõi các đơn hàng khách đã đặt.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg">Danh sách đơn hàng</CardTitle>
          <CardDescription>Tất cả đơn hàng được sắp xếp theo thời gian mới nhất.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Đang tải danh sách đơn bán...</p>
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <p className="text-red-600 font-medium">{getApiErrorMessage(error, 'Không thể tải đơn bán.')}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Thử lại</Button>
            </div>
          ) : !data?.length ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Chưa có đơn hàng nào</h3>
              <p className="text-muted-foreground mt-1">Cửa hàng của bạn chưa nhận được đơn đặt hàng nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellOrdersPage;
