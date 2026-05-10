import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeHero } from '@/components/marketplace/home/HomeHero';
import { HomeSidebar } from '@/components/marketplace/home/HomeSidebar';
import { marketplaceQuickFilters } from '@/features/marketplace/data';
import useAuthStore from '@/stores/auth.store';
import { useMyShopsQuery } from '@/queries/shops/useMyShops';
import { useProductsQuery } from '@/queries/products/useProducts';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useSearchParams } from 'react-router-dom';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';
  const { data: myShops, isLoading: isLoadingMyShops } = useMyShopsQuery(isSeller);
  const keyword = searchParams.get('q') || '';
  const categorySlug = searchParams.get('categorySlug') || '';
  const selectedTag = searchParams.get('tag') || '';
  const minRating = searchParams.get('minRating');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const numericMinRating = minRating ? Number(minRating) : undefined;
  const numericMinPrice = minPrice ? Number(minPrice) : undefined;
  const numericMaxPrice = maxPrice ? Number(maxPrice) : undefined;

  const { data: products = [], isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useProductsQuery({
    q: keyword || undefined,
    categorySlug: categorySlug ? [categorySlug] : undefined,
    tags: selectedTag ? [selectedTag] : undefined,
    minRating: numericMinRating,
    minPrice: numericMinPrice,
    maxPrice: numericMaxPrice,
  });
  const hasSellerShop = !!myShops;
  const filteredProducts = useMemo(() => products, [products]);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value.trim()) {
      next.set(key, value.trim());
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('categorySlug');
      next.delete('tag');
      next.delete('minRating');
      next.delete('minPrice');
      next.delete('maxPrice');
      return next;
    });
  };

  return (
    <main className="container py-4 md:py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[255px_1fr]">
        <HomeSidebar
          quickFilters={marketplaceQuickFilters}
          role={user?.role}
          isLoadingMyShops={isLoadingMyShops}
          hasSellerShop={hasSellerShop}
            minRating={minRating ?? ''}
            minPrice={minPrice ?? ''}
            maxPrice={maxPrice ?? ''}
            onMinRatingChange={(value) => updateParam('minRating', value || undefined)}
            onMinPriceChange={(value) => updateParam('minPrice', value)}
            onMaxPriceChange={(value) => updateParam('maxPrice', value)}
            onClearFilters={clearFilters}
            selectedCategorySlug={categorySlug || undefined}
            onCategorySelect={(slug) => updateParam('categorySlug', slug)}
            selectedTag={selectedTag || undefined}
            onTagSelect={(tag) => updateParam('tag', tag)}
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
                  Sản phẩm
                </CardTitle>
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
                  {keyword.trim() || categorySlug || selectedTag || minRating || minPrice || maxPrice
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
