import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useAdminProductsQuery } from '@/queries/admin/useAdmin';

const AdminProductsPage = () => {
  const { data, isLoading, isError, error } = useAdminProductsQuery('pending_review');

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
      <CardHeader>
        <CardTitle className="text-lg">Danh sách sản phẩm chờ duyệt</CardTitle>
        <p className="text-sm text-muted-foreground">
          Kiểm tra nội dung, media, nhật ký phát triển và thông tin shop trước khi cho hiển thị.
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có sản phẩm nào chờ duyệt.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-[1.5fr_1fr_120px_120px] gap-3 bg-slate-50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
              <span>Sản phẩm</span>
              <span>Shop</span>
              <span>Trust</span>
              <span className="text-right">Thao tác</span>
            </div>
            {data.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[1.5fr_1fr_120px_120px] items-center gap-3 border-t px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.name} className="h-14 w-14 rounded-md object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-md bg-slate-100" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#27272a]">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.origin} · {product.price.toLocaleString('vi-VN')}đ/{product.unit || 'kg'}
                    </p>
                  </div>
                </div>
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">{product.shopName || 'Chưa rõ shop'}</p>
                  <p className="text-muted-foreground">{product.shopOwnerPhone || 'Không có SĐT'}</p>
                </div>
                <Badge variant="outline">{product.trustScore ?? 0}/100</Badge>
                <div className="text-right">
                  <Button asChild size="sm">
                    <Link to={`/admin/san-pham-duyet/${product.id}`}>Duyệt</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminProductsPage;
