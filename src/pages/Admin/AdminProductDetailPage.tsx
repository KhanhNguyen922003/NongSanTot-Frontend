import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import {
  useAdminProductDetailQuery,
  useApproveAdminProductMutation,
  useRejectAdminProductMutation,
} from '@/queries/admin/useAdmin';

const AdminProductDetailPage = () => {
  const navigate = useNavigate();
  const { productId = '' } = useParams();
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, isError, error } = useAdminProductDetailQuery(productId);
  const approveProduct = useApproveAdminProductMutation(productId);
  const rejectProduct = useRejectAdminProductMutation(productId);

  const approve = async () => {
    setMessage(null);
    try {
      await approveProduct.mutateAsync('Admin approved manually');
      setMessage({ type: 'success', text: 'Đã duyệt sản phẩm.' });
      navigate('/admin/san-pham-duyet');
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Không thể duyệt sản phẩm.') });
    }
  };

  const reject = async () => {
    setMessage(null);
    if (!rejectReason.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập lý do từ chối.' });
      return;
    }

    try {
      await rejectProduct.mutateAsync(rejectReason.trim());
      setMessage({ type: 'success', text: 'Đã từ chối sản phẩm.' });
      navigate('/admin/san-pham-duyet');
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Không thể từ chối sản phẩm.') });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải chi tiết sản phẩm...
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải chi tiết sản phẩm.')}</p>;
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="outline" size="sm">
        <Link to="/admin/san-pham-duyet">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Link>
      </Button>

      {message ? <AuthFormMessage type={message.type} text={message.text} /> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{data.name}</CardTitle>
              <Badge variant="outline">{data.status}</Badge>
              <Badge variant="success">Trust {data.trustScore ?? 0}/100</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {data.shopName || 'Chưa rõ shop'} · {data.shopOwnerPhone || 'Không có SĐT'}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-muted-foreground">Giá</p>
                <p className="font-medium">{data.price.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-muted-foreground">Tồn kho</p>
                <p className="font-medium">{data.stock} {data.unit}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-muted-foreground">Xuất xứ</p>
                <p className="font-medium">{data.origin}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-muted-foreground">Ship</p>
                <p className="font-medium">{data.shippingMethods?.join(', ') || 'Chưa có'}</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="font-medium text-[#27272a]">Mô tả</h3>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{data.description || 'Không có mô tả.'}</p>
            </section>

            <section className="space-y-2">
              <h3 className="font-medium text-[#27272a]">Media sản phẩm</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(data.images ?? []).map((image) => (
                  <img key={image} src={image} alt={data.name} className="h-32 w-full rounded-md object-cover" />
                ))}
                {(data.videos ?? []).map((video) => (
                  <video key={video} src={video} controls className="h-32 w-full rounded-md object-cover" />
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-medium text-[#27272a]">Nhật ký phát triển</h3>
              {data.growthDiary.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có nhật ký phát triển.</p>
              ) : (
                data.growthDiary.map((stage) => (
                  <div key={stage.id} className="rounded-md border p-3">
                    <p className="font-medium">
                      Giai đoạn {stage.stageOrder}: {stage.stageName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stage.logDate ? new Date(stage.logDate).toLocaleDateString('vi-VN') : 'Không có ngày'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{stage.description || 'Không có mô tả.'}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
                      {(stage.images ?? []).map((image) => (
                        <img key={image} src={image} alt={stage.stageName} className="h-24 w-full rounded-md object-cover" />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin lấy hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Người nhận:</span> {data.pickupAddressSnapshot?.receiverName || 'Chưa có'}</p>
              <p><span className="text-muted-foreground">SĐT:</span> {data.pickupAddressSnapshot?.receiverPhone || 'Chưa có'}</p>
              <p><span className="text-muted-foreground">Địa chỉ:</span> {data.pickupAddressSnapshot?.displayAddress || 'Chưa có'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quyết định kiểm duyệt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                className="w-full"
                disabled={approveProduct.isPending || rejectProduct.isPending || data.status === 'active'}
                onClick={() => void approve()}
              >
                {approveProduct.isPending ? 'Đang duyệt...' : 'Duyệt sản phẩm'}
              </Button>
              <textarea
                className="min-h-28 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Nhập lý do nếu từ chối sản phẩm..."
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                disabled={approveProduct.isPending || rejectProduct.isPending || data.status === 'rejected'}
                onClick={() => void reject()}
              >
                {rejectProduct.isPending ? 'Đang từ chối...' : 'Từ chối sản phẩm'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetailPage;
