import { Link, Navigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { auth } from '../../../firebase.config';
import {
  BUY_ORDERS_GHTK_TAB_ORDER,
  formatGhtkShipmentStatus,
  GHTK_STATUS_LABELS,
} from '@/constants/ghtkStatus';
import { sellerHubPaths } from '@/constants/sellerHub';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { cn } from '@/lib/utils';
import { useMyBuyOrdersQuery } from '@/queries/orders/useOrders';
import useAuthStore from '@/stores/auth.store';

const GHTK_TAB_VALUES = new Set<string>([
  'all',
  'none',
  ...BUY_ORDERS_GHTK_TAB_ORDER.map((s) => String(s)),
]);

const BuyOrdersPage = () => {
  const isAuthenticated = !!auth.currentUser;
  const { user } = useAuthStore();
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent('/don-mua')}`} replace />;
  }

  // Sellers should access sell orders dashboard, not buy orders
  if (user?.role === 'seller') {
    return <Navigate to={sellerHubPaths.sellOrders} replace />;
  }

  const ghtkParam = tab === 'all' ? undefined : tab;
  const { data, isLoading, isError, error } = useMyBuyOrdersQuery(ghtkParam);

  const filtered = useMemo(() => {
    if (!data?.length) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((o) => {
      if (o.id.toLowerCase().includes(q)) return true;
      if (o.shopName?.toLowerCase().includes(q)) return true;
      if (o.productNames?.some((n) => n.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [data, search]);

  const setTabSafe = (value: string) => {
    setTab(GHTK_TAB_VALUES.has(value) ? value : 'all');
  };

  return (
    <main className="container px-3 py-4 sm:px-4 sm:py-6">
      <Card>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle>Đơn mua của tôi</CardTitle>
          <p className="text-sm text-muted-foreground">Lọc theo trạng thái vận đơn</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-0 border-b border-border px-1">
              <button
                type="button"
                onClick={() => setTabSafe('all')}
                className={cn(
                  'shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  tab === 'all'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setTabSafe('none')}
                className={cn(
                  'shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  tab === 'none'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                Chưa đồng bộ GHTK
              </button>
              {BUY_ORDERS_GHTK_TAB_ORDER.map((st) => {
                const value = String(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTabSafe(value)}
                    className={cn(
                      'max-w-[200px] shrink-0 truncate border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                      tab === value
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground',
                    )}
                    title={GHTK_STATUS_LABELS[st]}
                  >
                    {GHTK_STATUS_LABELS[st]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên Shop, mã đơn hoặc tên sản phẩm"
              className="pl-9"
              aria-label="Tìm kiếm đơn mua"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải đơn mua...
            </div>
          ) : isError ? (
            <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải đơn mua.')}</p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground">
              {tab === 'all'
                ? 'Bạn chưa có đơn hàng nào.'
                : 'Không có đơn ở trạng thái này.'}
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có đơn khớp từ khóa tìm kiếm.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-[#27272a]">
                      {order.shopName ?? 'Shop'}{' '}
                      <span className="font-normal text-muted-foreground">· Đơn #{order.id.slice(0, 8)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.finalPrice.toLocaleString('vi-VN')}đ · Đơn: {order.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      GHTK: {formatGhtkShipmentStatus(order.ghtkShipmentStatus ?? null)}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
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
