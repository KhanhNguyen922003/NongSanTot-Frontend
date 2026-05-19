import {
  Carrot,
  Coffee,
  Drumstick,
  Fish,
  LayoutDashboard,
  Loader2,
  Milk,
  Package,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { MarketplaceFilter } from '@/features/marketplace/data';
import { useCategoriesQuery } from '@/queries/categories/useCategories';

type HomeSidebarProps = {
  quickFilters: MarketplaceFilter[];
  role?: 'buyer' | 'seller' | 'admin';
  isLoadingMyShops?: boolean;
  hasSellerShop?: boolean;
  selectedCategorySlug?: string;
  onCategorySelect?: (slug?: string) => void;
  selectedTag?: string;
  onTagSelect?: (tag?: string) => void;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
  onMinRatingChange?: (value: string) => void;
  onMinPriceChange?: (value: string) => void;
  onMaxPriceChange?: (value: string) => void;
  onClearFilters?: () => void;
};

const categoryIconMap = {
  Carrot,
  Coffee,
  Drumstick,
  Fish,
  Milk,
  Package,
  Sprout,
  UtensilsCrossed,
};

export const HomeSidebar = ({
  quickFilters,
  role,
  isLoadingMyShops = false,
  hasSellerShop = false,
  selectedCategorySlug,
  onCategorySelect,
  selectedTag,
  onTagSelect,
  minRating = '',
  minPrice = '',
  maxPrice = '',
  onMinRatingChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
}: HomeSidebarProps) => {
  const isSeller = role === 'seller';
  const isAdmin = role === 'admin';
  const { data: categories = [], isLoading: isLoadingCategories, isError: isCategoriesError, error: categoriesError } = useCategoriesQuery();

  const renderCategoryIcon = (iconName?: string | null) => {
    if (!iconName) return <Package className="h-4 w-4" />;

    const IconComponent = categoryIconMap[iconName as keyof typeof categoryIconMap];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  return (
    <aside className="space-y-4">
      {isAdmin ? (
        <Card className="rounded-lg border-primary/20 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary">Khu vực admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pb-3">
            <Link
              to="/admin"
              className="inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#27272a] transition hover:bg-muted"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              Dashboard admin
            </Link>
            <Link
              to="/admin/products"
              className="inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#27272a] transition hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Duyệt sản phẩm
            </Link>
          </CardContent>
        </Card>
      ) : null}

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
          {isLoadingCategories ? (
            <p className="inline-flex items-center gap-2 rounded-md bg-muted px-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh mục...
            </p>
          ) : isCategoriesError ? (
            <p className="rounded-md bg-red-50 px-2 py-2 text-sm text-red-700">
              {getApiErrorMessage(categoriesError, 'Không thể tải danh mục.')}
            </p>
          ) : categories.length === 0 ? (
            <p className="rounded-md bg-muted px-2 py-2 text-sm text-muted-foreground">
              Chưa có danh mục nào.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onCategorySelect?.(undefined)}
                className={`inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                  !selectedCategorySlug
                    ? 'bg-primary/10 text-primary'
                    : 'text-[#27272a] hover:bg-muted'
                }`}
              >
                <span className="text-primary">
                  <Package className="h-4 w-4" />
                </span>
                <span>Tất cả danh mục</span>
              </button>
              {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  onCategorySelect?.(
                    selectedCategorySlug === category.slug ? undefined : category.slug,
                  )
                }
                className={`inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                  selectedCategorySlug === category.slug
                    ? 'bg-primary/10 text-primary'
                    : 'text-[#27272a] hover:bg-muted'
                }`}
              >
                <span className="text-primary">{renderCategoryIcon(category.icon)}</span>
                <span>{category.name}</span>
              </button>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Bộ lọc sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Đánh giá tối thiểu</p>
            <select
              value={minRating}
              onChange={(event) => onMinRatingChange?.(event.target.value)}
              className="h-9 w-full rounded-md border px-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="4.5">Từ 4.5★</option>
              <option value="4">Từ 4★</option>
              <option value="3">Từ 3★</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Giá từ</p>
              <Input
                value={minPrice}
                onChange={(event) => onMinPriceChange?.(event.target.value)}
                placeholder="0"
                type="number"
                min={0}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Giá đến</p>
              <Input
                value={maxPrice}
                onChange={(event) => onMaxPriceChange?.(event.target.value)}
                placeholder="500000"
                type="number"
                min={0}
                className="h-9"
              />
            </div>
          </div>

          <Button type="button" variant="outline" size="sm" className="w-full" onClick={onClearFilters}>
            Xóa bộ lọc
          </Button>

          <div className="my-2 h-px bg-gray-200" />

          <p className="text-xs font-medium text-muted-foreground">Tag nhanh</p>
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onTagSelect?.(selectedTag === filter.id ? undefined : filter.id)}
              className={`inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                selectedTag === filter.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-[#27272a] hover:bg-muted'
              }`}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              {filter.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card">
        <CardContent className="p-0">
          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 p-4 text-sm font-medium text-primary transition hover:bg-primary/5"
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Đi đến Admin Dashboard
            </Link>
          ) : isSeller ? (
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
