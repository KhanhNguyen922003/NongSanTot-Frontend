import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useAdminProductsQuery } from '@/queries/admin/useAdmin';

type ProductTab = 'pending_review' | 'active';

const productFilters: { value: ProductTab; label: string }[] = [
  { value: 'pending_review', label: 'Chờ duyệt' },
  { value: 'active', label: 'Đang bày bán' },
];

const AdminProductsPage = () => {
  const [status, setStatus] = useState<ProductTab>('pending_review');
  const { data, isLoading, isError, error } = useAdminProductsQuery(status);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải danh sách sản phẩm...
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải danh sách sản phẩm.')}</p>;
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Quản lý sản phẩm</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kiểm tra nội dung, media và thông tin shop trước khi cho hiển thị. Chọn tab để chuyển giữa danh sách chờ duyệt và sản phẩm đang bày bán.
            </p>
          </div>
          <div className="flex gap-2">
            {productFilters.map((f) => (
              <Button
                key={f.value}
                type="button"
                size="sm"
                variant={status === f.value ? 'default' : 'outline'}
                onClick={() => setStatus(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {status === 'pending_review' ? 'Không có sản phẩm nào chờ duyệt.' : 'Không có sản phẩm đang bày bán.'}
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="hidden grid-cols-[1.5fr_1fr_120px_120px] gap-3 bg-slate-50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground md:grid">
              <span>Sản phẩm</span>
              <span>Shop</span>
              <span>Trust</span>
              <span className="text-right">Thao tác</span>
            </div>
            <div className="divide-y">
            {data.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 px-4 py-4 md:grid md:grid-cols-[1.5fr_1fr_120px_120px] md:items-center md:gap-3 md:py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.name} className="h-14 w-14 shrink-0 rounded-md object-cover" />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-md bg-slate-100" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#27272a]">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.origin} · {product.price.toLocaleString('vi-VN')}đ/{product.unit || 'kg'}
                    </p>
                  </div>
                </div>
                <div className="min-w-0 border-t border-dashed pt-3 text-sm md:border-0 md:pt-0">
                  <p className="truncate text-xs font-medium uppercase text-muted-foreground md:hidden">Shop</p>
                  <p className="truncate font-medium">{product.shopName || 'Chưa rõ shop'}</p>
                  <p className="text-muted-foreground">{product.shopOwnerPhone || 'Không có SĐT'}</p>
                </div>
                <div className="flex flex-col gap-2 border-t border-dashed pt-3 sm:flex-row sm:items-center sm:justify-between md:border-0 md:pt-0">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground md:hidden">Uy tín</p>
                    <Badge variant="outline">{product.trustScore ?? 0}/100</Badge>
                  </div>
                  <Button asChild size="sm" className="w-full shrink-0 sm:w-auto md:w-auto">
                    <Link to={`/admin/products/${product.id}`}>{status === 'pending_review' ? 'Duyệt' : 'Xem'}</Link>
                  </Button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminProductsPage;
