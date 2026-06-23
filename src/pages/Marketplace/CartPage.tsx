import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { marketplacePaths } from '@/constants/routes';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import {
  useMyCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '@/queries/carts/useCarts';
import useAuthStore from '@/stores/auth.store';

const CartPage = () => {
  const isAuthenticated = !!useAuthStore((state) => state.user);
  const { data, isLoading, isError, error } = useMyCartQuery(isAuthenticated);
  const updateCartItem = useUpdateCartItemMutation();
  const removeCartItem = useRemoveCartItemMutation();

  const groupedByShop = useMemo(() => {
    const groups = new Map<
      string,
      { shopName: string; shopAddress: string; items: NonNullable<typeof data>['items'] }
    >();
    (data?.items ?? []).forEach((item) => {
      const key = item.shopId ?? 'unknown';
      const existing = groups.get(key);
      if (existing) {
        existing.items.push(item);
        return;
      }

      groups.set(key, {
        shopName: item.shopName || 'Nhà bán Nông Sản Tốt',
        shopAddress: item.shopDisplayAddress || '',
        items: [item],
      });
    });

    return Array.from(groups.entries()).map(([shopId, value]) => ({
      shopId,
      ...value,
    }));
  }, [data?.items]);

  const totalAmount = (data?.items ?? []).reduce((sum, item) => {
    const price = item.productPrice ?? 0;
    return sum + price * item.quantity;
  }, 0);

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent(marketplacePaths.cart)}`} replace />;
  }

  if (isLoading) {
    return (
      <main className="container py-8">
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải giỏ hàng...
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container py-8">
        <Card>
          <CardContent className="py-6 text-sm text-red-600">
            {getApiErrorMessage(error, 'Không thể tải giỏ hàng.')}
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
      <Card className="rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="text-xl text-[#27272a]">Giỏ hàng của bạn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data?.items ?? []).length === 0 ? (
            <div className="space-y-3 rounded-md border bg-slate-50 p-6 text-center">
              <p className="text-sm text-muted-foreground">Giỏ hàng đang trống.</p>
              <Button asChild>
                <Link to="/">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          ) : (
            <>
              {groupedByShop.map((group) => (
                <div key={group.shopId} className="rounded-lg border">
                  <div className="border-b bg-slate-50 px-4 py-3">
                    <p className="font-medium text-[#27272a]">{group.shopName}</p>
                    {group.shopAddress ? (
                      <p className="text-xs text-muted-foreground">{group.shopAddress}</p>
                    ) : null}
                  </div>
                  <div className="divide-y">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          {item.productCoverImage || item.productImages?.[0] ? (
                            <img
                              src={item.productCoverImage || item.productImages?.[0]}
                              alt={item.productName || 'product'}
                              className="h-16 w-16 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-md border bg-slate-100" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#27272a]">{item.productName || 'Sản phẩm đã xóa'}</p>
                            <p className="text-sm text-muted-foreground">
                              {(item.productPrice ?? 0).toLocaleString('vi-VN')}đ / {item.productUnit || 'kg'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
                          <div className="inline-flex items-center rounded-md border">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              disabled={item.quantity <= 1 || updateCartItem.isPending}
                              onClick={() =>
                                void updateCartItem.mutateAsync({
                                  itemId: item.id,
                                  body: { quantity: item.quantity - 1 },
                                })
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              disabled={updateCartItem.isPending || item.quantity >= (item.productStock ?? item.quantity)}
                              onClick={() =>
                                void updateCartItem.mutateAsync({
                                  itemId: item.id,
                                  body: { quantity: item.quantity + 1 },
                                })
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <p className="min-w-[5.5rem] flex-1 text-right font-semibold text-primary sm:w-28 sm:flex-none">
                            {((item.productPrice ?? 0) * item.quantity).toLocaleString('vi-VN')}đ
                          </p>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            disabled={removeCartItem.isPending}
                            onClick={() => void removeCartItem.mutateAsync(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-3 rounded-lg border bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Tạm tính ({data?.items.length ?? 0} sản phẩm)
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {totalAmount.toLocaleString('vi-VN')}đ
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to="/">Tiếp tục mua hàng</Link>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/dat-hang">Tiến hành đặt hàng</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default CartPage;
