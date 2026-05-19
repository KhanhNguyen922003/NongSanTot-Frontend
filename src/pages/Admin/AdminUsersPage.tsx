import { useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useAdminUsersQuery, useUpdateAdminUserRoleMutation } from '@/queries/admin/useAdmin';
import type { AdminUserRoleFilter } from '@/queries/admin/types';

const filters: { value: AdminUserRoleFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'buyer', label: 'Người mua' },
  { value: 'seller', label: 'Người bán' },
  { value: 'admin', label: 'Admin' },
];

const AdminUsersPage = () => {
  const [role, setRole] = useState<AdminUserRoleFilter>('all');
  const { data, isLoading, isError, error } = useAdminUsersQuery(role);
  const updateRole = useUpdateAdminUserRoleMutation();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải danh sách người dùng...
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{getApiErrorMessage(error, 'Không thể tải danh sách người dùng.')}</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Quản lý người dùng</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Xem nhanh loại tài khoản, số shop/sản phẩm liên quan và chuyển vai trò buyer/seller khi cần.
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={role === filter.value ? 'default' : 'outline'}
                onClick={() => setRole(filter.value)}
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
            <p className="text-sm text-muted-foreground">Không có người dùng phù hợp bộ lọc hiện tại.</p>
          ) : (
            data.map((user) => (
              <div key={user.id} className="rounded-lg border p-4 transition hover:bg-slate-50">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <Users className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-[#27272a]">{user.fullName}</p>
                        <Badge variant={user.role === 'admin' ? 'success' : 'outline'}>{user.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                      <p className="text-sm text-muted-foreground">{user.firebaseUid || 'Chưa có Firebase UID'}</p>
                      <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                        <Badge variant="outline">{user.shopCount} shop</Badge>
                        <Badge variant="outline">{user.productCount} sản phẩm</Badge>
                        <Badge variant="outline">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ ngày tạo'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {user.role !== 'admin' ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant={user.role === 'buyer' ? 'default' : 'outline'}
                          disabled={updateRole.isPending}
                          onClick={() => updateRole.mutate({ userId: user.id, role: 'buyer' })}
                        >
                          Đặt buyer
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={user.role === 'seller' ? 'default' : 'outline'}
                          disabled={updateRole.isPending}
                          onClick={() => updateRole.mutate({ userId: user.id, role: 'seller' })}
                        >
                          Đặt seller
                        </Button>
                      </>
                    ) : (
                      <Badge variant="success">Tài khoản admin</Badge>
                    )}
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

export default AdminUsersPage;