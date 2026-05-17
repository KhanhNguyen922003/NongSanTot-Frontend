import { Link, Navigate } from 'react-router-dom';
import { BarChart3, CalendarClock, Loader2, PackageSearch, Search, ShoppingBag, Truck } from 'lucide-react';
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
    <main className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-amber-50/40 px-3 py-4 sm:px-4 sm:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_35%)]" />

      <div className="relative mx-auto w-full max-w-6xl space-y-6">
        <Card className="border-orange-100/80 bg-white/90 shadow-sm backdrop-blur">
          <CardContent className="space-y-6 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Đơn mua của tôi
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[28rem]">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Tổng đơn</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-sky-600">Đang hiển thị</p>
                  <p className="mt-1 text-2xl font-semibold text-sky-900">{stats.visible}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-emerald-600">Đã giao</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-900">{stats.delivered}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-amber-600">Đang giao</p>
                  <p className="mt-1 text-2xl font-semibold text-amber-900">{stats.shipping}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
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

              <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                <div className="flex max-w-full gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setTabSafe('all')}
                    className={cn(
                      'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      tab === 'all'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabSafe('none')}
                    className={cn(
                      'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      tab === 'none'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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
                          'max-w-[220px] shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                          tab === value
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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

        <Card className="border-slate-200 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-900">Danh sách đơn</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {tab === 'all' ? 'Tất cả đơn hàng bạn đã đặt' : 'Đơn hàng đang lọc theo trạng thái'}
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:flex">
                <BarChart3 className="h-4 w-4" />
                {stats.visible} kết quả
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-5 sm:p-6">
            {isLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải đơn mua...
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {getApiErrorMessage(error, 'Không thể tải đơn mua.')}
              </div>
            ) : !data?.length ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <PackageSearch className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-base font-medium text-slate-900">
                  {tab === 'all' ? 'Bạn chưa có đơn hàng nào.' : 'Không có đơn ở trạng thái này.'}
                </p>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Khi có đơn mới, chúng sẽ xuất hiện ở đây để bạn theo dõi trạng thái giao hàng.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <Search className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-base font-medium text-slate-900">Không có đơn khớp từ khóa tìm kiếm.</p>
                <p className="mt-2 max-w-md text-sm text-slate-500">
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
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                                orderStatusClass[order.status] ?? 'border-slate-200 bg-slate-50 text-slate-700',
                              )}
                            >
                              {orderStatusLabel[order.status] ?? order.status}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                              GHTK: {ghtkText}
                            </span>
                          </div>

                          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-slate-400" />
                              <span>{formatMoney(order.finalPrice)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-slate-400" />
                              <span>{createdAtText ?? 'Chưa có thời gian tạo'}</span>
                            </div>
                          </div>

                          {productPreview ? (
                            <p className="line-clamp-2 text-sm text-slate-500">
                              <span className="font-medium text-slate-700">Sản phẩm:</span> {productPreview}
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
