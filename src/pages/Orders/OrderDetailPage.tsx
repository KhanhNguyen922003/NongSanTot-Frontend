import { Link, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { auth } from '../../../firebase.config';
import AddressSelect2, { type AddressSelection } from '@/components/common/AddressSelect2';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import {
  useBuyerConfirmNegotiationOrderMutation,
  useCancelOrderMutation,
  useOrderDetailQuery,
} from '@/queries/orders/useOrders';

const OrderDetailPage = () => {
  const { orderId = '' } = useParams();
  const isAuthenticated = !!auth.currentUser;
  const { data, isLoading, isError, error } = useOrderDetailQuery(orderId);
  const cancelOrder = useCancelOrderMutation(orderId);
  const confirmNegotiation = useBuyerConfirmNegotiationOrderMutation(orderId);
  const [selectedAddress, setSelectedAddress] = useState<AddressSelection | null>(null);
  const [fastNegotiationShip, setFastNegotiationShip] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isAuthenticated) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent(`/don-hang/${orderId}`)}`} replace />;
  }

  const awaitingAddress = data?.negotiationAwaitingBuyerAddress === true;

  const handleConfirmAddress = async () => {
    setConfirmMsg(null);
    if (!selectedAddress?.id) {
      setConfirmMsg({ type: 'error', text: 'Chọn địa chỉ nhận hàng.' });
      return;
    }
    try {
      await confirmNegotiation.mutateAsync({
        shippingAddressId: selectedAddress.id,
        fastShipping: fastNegotiationShip,
      });
      setConfirmMsg({
        type: 'success',
        text: 'Đã xác nhận. Đơn chuyển sang chờ shop xử lý.',
      });
    } catch (e) {
      setConfirmMsg({
        type: 'error',
        text: getApiErrorMessage(e, 'Không cập nhật được địa chỉ.'),
      });
    }
  };

  return (
    <main className="container px-3 py-4 sm:px-4 sm:py-6">
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

              {awaitingAddress ? (
                <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm font-medium text-[#27272a]">
                    Shop đã tạo đơn từ mức giá đã thống nhất. Chọn địa chỉ giao để hoàn tất.
                  </p>
                  {confirmMsg ? <AuthFormMessage type={confirmMsg.type} text={confirmMsg.text} /> : null}
                  <AddressSelect2 onChange={setSelectedAddress} />
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={fastNegotiationShip}
                      onChange={(ev) => setFastNegotiationShip(ev.target.checked)}
                    />
                    Giao nhanh (nếu có)
                  </label>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={confirmNegotiation.isPending}
                    onClick={() => void handleConfirmAddress()}
                  >
                    {confirmNegotiation.isPending ? 'Đang xác nhận...' : 'Chấp nhận đơn & địa chỉ'}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Mã vận đơn: {data.shippingCode || 'Chưa có'}
                  </p>
                  {data.shippingAddressSnapshot ? (
                    <div className="rounded-md border p-3 text-sm">
                      <p className="font-medium">{data.shippingAddressSnapshot.receiverName}</p>
                      <p className="text-muted-foreground">{data.shippingAddressSnapshot.receiverPhone}</p>
                      <p className="mt-2 text-muted-foreground">
                        {data.shippingAddressSnapshot.detail}, {data.shippingAddressSnapshot.ward},{' '}
                        {data.shippingAddressSnapshot.province}
                      </p>
                    </div>
                  ) : null}
                </>
              )}

              {!awaitingAddress ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Tổng tiền: {data.totalPrice.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phí ship: {data.shippingFee.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    Thành tiền: {data.finalPrice.toLocaleString('vi-VN')}đ
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Tạm tính hàng: {data.totalPrice.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Phí vận chuyển sẽ được tính khi bạn xác nhận địa chỉ bên trên.
                  </p>
                </>
              )}

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
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to="/don-mua">Quay lại đơn mua</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-700 hover:bg-red-50 sm:w-auto"
                  disabled={
                    cancelOrder.isPending ||
                    data.status === 'cancelled' ||
                    data.status === 'delivered'
                  }
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
