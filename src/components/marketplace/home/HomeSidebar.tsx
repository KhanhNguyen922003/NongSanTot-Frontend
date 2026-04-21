import { Sparkles, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketplaceCategory, MarketplaceFilter } from '@/features/marketplace/data';

type HomeSidebarProps = {
  categories: MarketplaceCategory[];
  quickFilters: MarketplaceFilter[];
};

export const HomeSidebar = ({ categories, quickFilters }: HomeSidebarProps) => {
  return (
    <aside className="space-y-4">
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
          <Link
            to="/seller/register"
            className="flex items-center gap-2 p-4 text-sm font-medium text-primary transition hover:bg-primary/5"
          >
            <Store className="h-4 w-4 shrink-0" />
            Đăng ký bán hàng
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
};
