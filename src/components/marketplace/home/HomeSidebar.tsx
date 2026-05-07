import { LayoutDashboard, Sparkles, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketplaceCategory, MarketplaceFilter } from '@/features/marketplace/data';

type HomeSidebarProps = {
  categories: MarketplaceCategory[];
  quickFilters: MarketplaceFilter[];
  role?: 'buyer' | 'seller' | 'admin';
  isLoadingMyShops?: boolean;
  hasSellerShop?: boolean;
};

export const HomeSidebar = ({
  categories,
  quickFilters,
  role,
  isLoadingMyShops = false,
  hasSellerShop = false,
}: HomeSidebarProps) => {
  const isSeller = role === 'seller';

  return (
    <aside className="space-y-4">
      {isSeller ? (
        <Card className="rounded-lg border-primary/20 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary">Kênh người bán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pb-3">
            {isLoadingMyShops ? (
              <p className="rounded-md bg-muted px-2 py-2 text-sm text-muted-foreground">
                Đang kiểm tra cửa hàng...
              </p>
            ) : hasSellerShop ? (
              <>
                <Link
                  to="/thong-ke-cua-hang"
                  className="inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#27272a] transition hover:bg-muted"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Bảng điều khiển cửa hàng
                </Link>
                <Link
                  to="/dang-ky-ban-hang"
                  className="inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#27272a] transition hover:bg-muted"
                >
                  <Store className="h-4 w-4 text-primary" />
                  Cập nhật thông tin cửa hàng
                </Link>
              </>
            ) : (
              <Link
                to="/dang-ky-ban-hang"
                className="inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#27272a] transition hover:bg-muted"
              >
                <Store className="h-4 w-4 text-primary" />
                Hoàn tất đăng ký bán hàng
              </Link>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-lg shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Danh mục</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pb-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="w-full rounded-md px-2 py-2 text-left text-sm text-[#27272a] transition hover:bg-muted"
            >
              {category.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pb-3">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className="inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#27272a] transition hover:bg-muted"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              {filter.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card">
        <CardContent className="p-0">
          {isSeller ? (
            <Link
              to={hasSellerShop ? '/thong-ke-cua-hang' : '/dang-ky-ban-hang'}
              className="flex items-center gap-2 p-4 text-sm font-medium text-primary transition hover:bg-primary/5"
            >
              {hasSellerShop ? (
                <LayoutDashboard className="h-4 w-4 shrink-0" />
              ) : (
                <Store className="h-4 w-4 shrink-0" />
              )}
              {hasSellerShop ? 'Đi đến kênh người bán' : 'Đăng ký bán hàng'}
            </Link>
          ) : (
            <Link
              to="/dang-ky-ban-hang"
              className="flex items-center gap-2 p-4 text-sm font-medium text-primary transition hover:bg-primary/5"
            >
              <Store className="h-4 w-4 shrink-0" />
              Đăng ký bán hàng
            </Link>
          )}
        </CardContent>
      </Card>
    </aside>
  );
};
