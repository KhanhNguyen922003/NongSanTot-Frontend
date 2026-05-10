import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { auth } from '../../../firebase.config';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import AddressSelect2, { type AddressSelection } from '@/components/common/AddressSelect2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import {
  useConfirmOrderMutation,
  useOrderDetailQuery,
} from '@/queries/orders/useOrders';
import { sellerHubPaths } from '@/constants/sellerHub';
import useAuthStore from '@/stores/auth.store';

const SellerConfirmOrderPage = () => {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [fastShipping, setFastShipping] = useState(false);
  const [selectedPickAddress, setSelectedPickAddress] = useState<AddressSelection | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { data: order, isLoading, isError, error } = useOrderDetailQuery(orderId);
  const confirmOrder = useConfirmOrderMutation(orderId);

  const isAuthenticated = !!auth.currentUser;
  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent(`/quan-ly-don/don-mua/xac-nhan-don-hang/${orderId}`)}`} replace />;
  }

  const handleConfirm = async () => {
    setMessage(null);
    try {
      const result = await confirmOrder.mutateAsync({
        actualPickAddressId: selectedPickAddress?.id,
        fastShipping,
      });
      setMessage({
        type: 'success',
        text: `Xác nhận đơn thành công. Mã vận đơn: ${result.shippingCode || 'N/A'}`,
      });
      navigate(sellerHubPaths.sellOrders);
    } catch (err) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(err, 'Không thể xác nhận đơn hàng.'),
      });
    }
  };

  return (
    <main className="container space-y-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Xác nhận đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải chi tiết đơn...
            </div>
          ) : isError || !order ? (
            <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải đơn hàng.')}</p>
          ) : (
            <>
              {message ? <AuthFormMessage type={message.type} text={message.text} /> : null}
              <p className="text-sm">
                Đơn #{order.id.slice(0, 8)} · Tổng tiền hàng:{' '}
                <span className="font-semibold text-primary">
                  {order.totalPrice.toLocaleString('vi-VN')}đ
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Người nhận: {order.shippingAddressSnapshot?.receiverName} · {order.shippingAddressSnapshot?.receiverPhone}
              </p>
              <p className="text-sm text-muted-foreground">
                Địa chỉ giao: {order.shippingAddressSnapshot?.detail}, {order.shippingAddressSnapshot?.ward}, {order.shippingAddressSnapshot?.province}
              </p>

              <div className="rounded-md border bg-slate-50 p-3">
                <p className="mb-2 text-sm font-medium">Chọn địa chỉ lấy hàng (seller)</p>
                <AddressSelect2 onChange={setSelectedPickAddress} userId={user?.id} />
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={fastShipping}
                  onChange={(event) => setFastShipping(event.target.checked)}
                />
                Vận chuyển nhanh (xteam)
              </label>

              <div className="space-y-2 rounded-md border p-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <p className="text-sm">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {item.priceAtPurchase.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button asChild variant="outline">
                  <Link to={sellerHubPaths.sellOrders}>Quay lại</Link>
                </Button>
                <Button
                  type="button"
                  disabled={confirmOrder.isPending || order.status !== 'pending'}
                  onClick={() => void handleConfirm()}
                >
                  {confirmOrder.isPending ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default SellerConfirmOrderPage;
