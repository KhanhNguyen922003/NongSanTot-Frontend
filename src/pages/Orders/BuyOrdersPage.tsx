import { Link, Navigate } from 'react-router-dom';
import { BarChart3, CalendarClock, Loader2, PackageSearch, Search, ShoppingBag, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  BUY_ORDERS_GHTK_TAB_ORDER,
  formatGhtkShipmentStatus,
  GHTK_STATUS_LABELS,
} from '@/constants/ghtkStatus';
import { sellerHubPaths } from '@/constants/sellerHub';
import { marketplacePaths } from '@/constants/routes';
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

const GHTK_STATUS_TEXT = GHTK_STATUS_LABELS as Record<string, string>;

const orderStatusLabel: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  awaiting_buyer_address: 'Chờ địa chỉ',
};

const orderStatusClass: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-sky-200 bg-sky-50 text-sky-700',
  processing: 'border-violet-200 bg-violet-50 text-violet-700',
  shipping: 'border-blue-200 bg-blue-50 text-blue-700',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  awaiting_buyer_address: 'border-orange-200 bg-orange-50 text-orange-700',
};

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

const formatOrderId = (id: string) => `#${id.slice(0, 8)}`;

const formatCreatedAt = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getTabLabel = (tab: string) => {
  if (tab === 'all') return 'Tất cả đơn';
  if (tab === 'none') return 'Chưa đồng bộ GHTK';
  return GHTK_STATUS_TEXT[tab] ?? 'Đang lọc';
};

const BuyOrdersPage = () => {
  const isAuthenticated = !!useAuthStore((state) => state.user);
  const { user } = useAuthStore();
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent(marketplacePaths.buyOrders)}`} replace />;
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

  const stats = useMemo(() => {
    const total = data?.length ?? 0;
    const visible = filtered.length;
    const delivered = data?.filter((order) => order.status === 'delivered').length ?? 0;
    const shipping = data?.filter((order) => order.status === 'shipping').length ?? 0;
    return { total, visible, delivered, shipping };
  }, [data, filtered.length]);

  const setTabSafe = (value: string) => {
    setTab(GHTK_TAB_VALUES.has(value) ? value : 'all');
  };

  return (
    <main className="container space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
      <div className="space-y-4">
        <Card className="rounded-lg shadow-card">
          <CardContent className="space-y-5 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Đơn mua của tôi
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-[34rem]">
                <div className="rounded-lg border bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Tổng đơn</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{stats.total}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Đang hiển thị</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{stats.visible}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Đã giao</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{stats.delivered}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Đang giao</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{stats.shipping}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên shop, mã đơn hoặc tên sản phẩm"
                    className="h-11 rounded-xl border-slate-200 bg-white pl-10 shadow-sm"
                    aria-label="Tìm kiếm đơn mua"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Đang xem: <span className="font-medium text-slate-700">{getTabLabel(tab)}</span>
                </p>
              </div>

              <div className="w-full rounded-lg border bg-white p-1 shadow-sm">
                <div className="flex max-w-full gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setTabSafe('all')}
                    className={cn(
                      'shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      tab === 'all'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground',
                    )}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabSafe('none')}
                    className={cn(
                      'shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      tab === 'none'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground',
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
                          'max-w-[220px] shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                          tab === value
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground',
                        )}
                        title={GHTK_STATUS_LABELS[st]}
                      >
                        {GHTK_STATUS_LABELS[st]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-card">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-foreground">Danh sách đơn</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tab === 'all' ? 'Tất cả đơn hàng bạn đã đặt' : 'Đơn hàng đang lọc theo trạng thái'}
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs text-muted-foreground sm:flex">
                <BarChart3 className="h-4 w-4" />
                {stats.visible} kết quả
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4 sm:p-5">
            {isLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải đơn mua...
              </div>
            ) : isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {getApiErrorMessage(error, 'Không thể tải đơn mua.')}
              </div>
            ) : !data?.length ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <PackageSearch className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">
                  {tab === 'all' ? 'Bạn chưa có đơn hàng nào.' : 'Không có đơn ở trạng thái này.'}
                </p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Khi có đơn mới, chúng sẽ xuất hiện ở đây để bạn theo dõi trạng thái giao hàng.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">Không có đơn khớp từ khóa tìm kiếm.</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Thử tìm bằng mã đơn ngắn, tên shop hoặc xóa bớt ký tự trong ô tìm kiếm.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filtered.map((order) => {
                  const createdAtText = formatCreatedAt(order.createdAt);
                  const ghtkText = formatGhtkShipmentStatus(order.ghtkShipmentStatus ?? null);
                  const productPreview = order.productNames?.slice(0, 3).join(' · ');

                  return (
                    <div
                      key={order.id}
                      className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-slate-900">
                              {order.shopName ?? 'Shop'}
                            </p>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {formatOrderId(order.id)}
                            </span>
                            <span
                              className={cn(
                                'rounded-full border px-2.5 py-1 text-xs font-medium',
                                orderStatusClass[order.status] ?? 'border-border bg-muted text-foreground',
                              )}
                            >
                              {orderStatusLabel[order.status] ?? order.status}
                            </span>
                            <span className="rounded-full border bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              GHTK: {ghtkText}
                            </span>
                          </div>

                          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>{formatMoney(order.finalPrice)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-muted-foreground" />
                              <span>{createdAtText ?? 'Chưa có thời gian tạo'}</span>
                            </div>
                          </div>

                          {productPreview ? (
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Sản phẩm:</span> {productPreview}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[11rem] lg:justify-end">
                          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                            <Link to={`/don-hang/${order.id}`}>Xem chi tiết</Link>
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Mã ngắn {order.id.slice(0, 8)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
                          <BarChart3 className="h-3.5 w-3.5" />
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default BuyOrdersPage;
