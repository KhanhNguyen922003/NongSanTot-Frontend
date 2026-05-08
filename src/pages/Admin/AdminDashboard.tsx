import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, PackageCheck, PackageSearch, Store, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useAdminDashboardQuery } from '@/queries/admin/useAdmin';

const AdminDashboard = () => {
  const { data, isLoading, isError, error } = useAdminDashboardQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải dashboard admin...
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải dashboard admin.')}</p>;
  }

  const stats = [
    { label: 'Người dùng', value: data.totals.users, icon: Users },
    { label: 'Cửa hàng', value: data.totals.shops, icon: Store },
    { label: 'Sản phẩm', value: data.totals.products, icon: PackageSearch },
    { label: 'Chờ duyệt', value: data.totals.pendingProducts, icon: PackageCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold text-[#27272a]">{stat.value}</p>
                </div>
                <Icon className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Sản phẩm mới chờ duyệt</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/san-pham-duyet">
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentPendingProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có sản phẩm nào chờ duyệt.</p>
          ) : (
            data.recentPendingProducts.map((product) => (
              <Link
                key={product.id}
                to={`/admin/san-pham-duyet/${product.id}`}
                className="flex items-center justify-between gap-3 rounded-md border p-3 transition hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={product.coverImage || '/placeholder.svg'}
                    alt={product.name}
                    className="h-14 w-14 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#27272a]">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.shopName || 'Chưa rõ shop'} · {product.origin}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Trust {product.trustScore ?? 0}</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
