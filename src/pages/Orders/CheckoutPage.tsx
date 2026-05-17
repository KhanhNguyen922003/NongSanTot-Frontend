import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Store } from 'lucide-react';
import { auth } from '../../../firebase.config';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import AddressSelect2, { type AddressSelection } from '@/components/common/AddressSelect2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useMyCartQuery } from '@/queries/carts/useCarts';
import {
  useCheckoutOrderMutation,
  useCheckoutShippingQuoteQuery,
} from '@/queries/orders/useOrders';

type GroupedCart = {
  shopId: string;
  shopName: string;
  items: Array<{
    id: string;
    productName: string | null;
    productCoverImage: string | null;
    productPrice: number | null;
    productUnit: string | null;
    quantity: number;
  }>;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<AddressSelection | null>(null);
  const [fastShipping, setFastShipping] = useState(false);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAuthenticated = !!auth.currentUser;
  const { data: cart, isLoading: isLoadingCart, isError: isCartError, error: cartError } = useMyCartQuery(isAuthenticated);
  const checkoutOrder = useCheckoutOrderMutation();
  const { refetch: refetchShippingQuote, ...quoteShipping } = useCheckoutShippingQuoteQuery(
    selectedAddress?.id,
    fastShipping,
  );
  console.log("selectedAddress?.id", selectedAddress?.id);
  useEffect(() => {
    if (!selectedAddress?.id) return;
    void refetchShippingQuote();
  }, [fastShipping, refetchShippingQuote, selectedAddress?.id]);

  const groupedCartItems = useMemo(() => {
    const groups = new Map<string, GroupedCart>();
    (cart?.items ?? []).forEach((item) => {
      const key = item.shopId ?? 'unknown';
      const existing = groups.get(key);
      if (existing) {
        existing.items.push({
          id: item.id,
          productName: item.productName,
          productCoverImage: item.productCoverImage || item.productImages?.[0] || null,
          productPrice: item.productPrice,
          productUnit: item.productUnit,
          quantity: item.quantity,
        });
        return;
      }

      groups.set(key, {
        shopId: key,
        shopName: item.shopName || 'Nhà bán Nông Sản Tốt',
        items: [
          {
            id: item.id,
            productName: item.productName,
            productCoverImage: item.productCoverImage || item.productImages?.[0] || null,
            productPrice: item.productPrice,
            productUnit: item.productUnit,
            quantity: item.quantity,
          },
        ],
      });
    });

    return Array.from(groups.values());
  }, [cart?.items]);

  const handleCheckout = async () => {
    setMessage(null);
    if (!selectedAddress?.id) {
      setMessage({ type: 'error', text: 'Vui lòng chọn địa chỉ giao hàng.' });
      return;
    }

    try {
      const result = await checkoutOrder.mutateAsync({
        shippingAddressId: selectedAddress.id,
        note: note.trim() || undefined,
        fastShipping,
      });
      setMessage({ type: 'success', text: result.message });
      navigate('/don-mua');
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Không thể đặt hàng.'),
      });
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent('/dat-hang')}`} replace />;
  }

  if (isLoadingCart) {
    return (
      <main className="container py-8">
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải thông tin đặt hàng...
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isCartError) {
    return (
      <main className="container py-8">
        <Card>
          <CardContent className="py-6 text-sm text-red-600">
            {getApiErrorMessage(cartError, 'Không thể tải dữ liệu giỏ hàng.')}
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!cart?.items.length) {
    return (
      <main className="container py-8">
        <Card>
          <CardContent className="space-y-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">Giỏ hàng trống, chưa thể đặt hàng.</p>
            <Button asChild>
              <Link to="/">Tiếp tục mua sắm</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
      <Card className="rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="text-xl text-[#27272a]">Xác nhận đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {message ? <AuthFormMessage type={message.type} text={message.text} /> : null}

          <div className="space-y-2">
            <p className="text-sm font-medium text-[#27272a]">Địa chỉ giao hàng</p>
            <AddressSelect2 onChange={setSelectedAddress} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-[#27272a]">Ghi chú cho người bán</p>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={fastShipping}
              onChange={(event) => setFastShipping(event.target.checked)}
            />
            Vận chuyển nhanh (xteam)
          </label>

          <div className="space-y-3">
            {groupedCartItems.map((group) => {
              const quote = quoteShipping.data?.quotes.find((item) => item.shopId === group.shopId);
              return (
                <div key={group.shopId} className="rounded-lg border">
                  <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-2">
                    <Store className="h-4 w-4 text-primary" />
                    <p className="font-medium text-[#27272a]">{group.shopName}</p>
                  </div>
                  <div className="space-y-2 p-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x {(item.productPrice ?? 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-primary">
                          {((item.productPrice ?? 0) * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    ))}
                    <div className="mt-2 border-t pt-2 text-sm">
                      <p className="text-muted-foreground">
                        Phí ship:{' '}
                        {selectedAddress?.id
                          ? quoteShipping.isLoading
                            ? 'Đang tính...'
                            : quote
                              ? `${quote.shippingFeeText}${quote.isMock ? ' (mock)' : ''}`
                              : 'Chưa tính được'
                          : 'Vui lòng chọn địa chỉ giao hàng'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-muted-foreground">
              Tạm tính: {quoteShipping.data?.totals.itemsTotal.toLocaleString('vi-VN') ?? '0'}đ
            </p>
            <p className="text-sm text-muted-foreground">
              Phí vận chuyển: {quoteShipping.data?.totals.shippingTotal.toLocaleString('vi-VN') ?? '0'}đ
            </p>
            <p className="text-2xl font-semibold text-primary">
              Tổng thanh toán: {quoteShipping.data?.totals.finalTotal.toLocaleString('vi-VN') ?? '0'}đ
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/gio-hang">Quay lại giỏ hàng</Link>
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={checkoutOrder.isPending || !selectedAddress?.id}
              onClick={() => void handleCheckout()}
            >
              {checkoutOrder.isPending ? 'Đang đặt hàng...' : 'Đặt hàng'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default CheckoutPage;
