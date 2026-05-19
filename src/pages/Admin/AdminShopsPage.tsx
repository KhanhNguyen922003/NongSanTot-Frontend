import { useState } from 'react';
import { Loader2, Store, ToggleLeft, ToggleRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useAdminShopsQuery, useToggleAdminShopStatusMutation } from '@/queries/admin/useAdmin';
import type { AdminShopStatusFilter } from '@/queries/admin/types';

const filters: { value: AdminShopStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã khóa' },
];

const AdminShopsPage = () => {
  const [status, setStatus] = useState<AdminShopStatusFilter>('all');
  const { data, isLoading, isError, error } = useAdminShopsQuery(status);
  const toggleShopStatus = useToggleAdminShopStatusMutation();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải danh sách shop...
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải danh sách shop.')}</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Quản lý shop</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Bật/tắt trạng thái shop để kiểm soát shop không phù hợp hoặc tạm ngưng hoạt động.
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={status === filter.value ? 'default' : 'outline'}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có shop nào phù hợp bộ lọc hiện tại.</p>
          ) : (
            data.map((shop) => (
              <div key={shop.id} className="rounded-lg border p-4 transition hover:bg-slate-50">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                      {shop.logo ? (
                        <img src={shop.logo} alt={shop.name} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold text-[#27272a]">{shop.name}</p>
                        <Badge variant={shop.isActive ? 'success' : 'destructive'}>
                          {shop.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {shop.ownerName || 'Chưa rõ chủ shop'} · {shop.ownerPhone || 'Không có SĐT'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {shop.displayAddress || 'Chưa cập nhật địa chỉ hiển thị'}
                      </p>
                      {shop.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{shop.description}</p> : null}
                      <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                        <Badge variant="outline">{shop.productCount} sản phẩm</Badge>
                        <Badge variant="outline">{shop.activeProductCount} đang bán</Badge>
                        <Badge variant="outline">Rating {shop.rating ?? 0}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant={shop.isActive ? 'outline' : 'default'}
                      size="sm"
                      disabled={toggleShopStatus.isPending}
                      onClick={() =>
                        toggleShopStatus.mutate({
                          shopId: shop.id,
                          isActive: !shop.isActive,
                        })
                      }
                    >
                      {shop.isActive ? (
                        <>
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          Khóa shop
                        </>
                      ) : (
                        <>
                          <ToggleRight className="mr-2 h-4 w-4" />
                          Mở lại shop
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShopsPage;