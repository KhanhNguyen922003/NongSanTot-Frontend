import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HomeHero } from '@/components/marketplace/home/HomeHero';
import { HomeSidebar } from '@/components/marketplace/home/HomeSidebar';
import { marketplaceCategories, marketplaceQuickFilters } from '@/features/marketplace/data';
import useAuthStore from '@/stores/auth.store';
import { useMyShopsQuery } from '@/queries/shops/useMyShops';
import { useProductsQuery } from '@/queries/products/useProducts';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';
  const { data: myShops, isLoading: isLoadingMyShops } = useMyShopsQuery(isSeller);
  const { data: products = [], isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useProductsQuery();
  const hasSellerShop = !!myShops;

  // Ready to migrate to React Hook Form: keep filter state centralized as one object.
  const [filters, setFilters] = useState({
    keyword: '',
  });

  const filteredProducts = useMemo(() => {
    if (!filters.keyword.trim()) {
      return products;
    }

    return products.filter((item) =>
      item.name.toLowerCase().includes(filters.keyword.trim().toLowerCase()),
    );
  }, [filters.keyword, products]);

  return (
    <main className="container py-4 md:py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[255px_1fr]">
        <HomeSidebar
          categories={marketplaceCategories}
          quickFilters={marketplaceQuickFilters}
          role={user?.role}
          isLoadingMyShops={isLoadingMyShops}
          hasSellerShop={hasSellerShop}
        />

        <section className="space-y-6">
          {isAdmin ? (
            <Card className="rounded-lg border-primary/20 bg-primary/5 shadow-card">
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white p-2 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#27272a]">Bạn đang xem Marketplace bằng tài khoản admin</p>
                    <p className="text-sm text-muted-foreground">
                      Marketplace vẫn hiển thị như người mua để kiểm tra trải nghiệm, nhưng thao tác quản trị nằm trong Admin Dashboard.
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link to="/admin">Vào Admin Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <HomeHero />

          <Card className="rounded-lg shadow-card">
            <CardHeader className="border-b pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="inline-flex items-center gap-2 text-[20px] font-medium text-primary">
                  <Sparkles className="h-5 w-5" />
                  Sản phẩm mới
                </CardTitle>
                <Input
                  value={filters.keyword}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      keyword: event.target.value,
                    }))
                  }
                  placeholder="Lọc nhanh theo tên sản phẩm..."
                  className="h-9 w-full md:w-[280px]"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải sản phẩm đã duyệt...
                </div>
              ) : isProductsError ? (
                <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  {getApiErrorMessage(productsError, 'Không thể tải danh sách sản phẩm.')}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-md border bg-slate-50 p-6 text-center text-sm text-muted-foreground">
                  {filters.keyword.trim()
                    ? 'Không tìm thấy sản phẩm phù hợp.'
                    : 'Chưa có sản phẩm nào được admin duyệt để hiển thị.'}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline" className="min-w-44 text-primary">
                      Xem thêm
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Home;
