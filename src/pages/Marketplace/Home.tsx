import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HomeHero } from '@/components/marketplace/home/HomeHero';
import { HomeSidebar } from '@/components/marketplace/home/HomeSidebar';
import { marketplaceCategories, marketplaceProducts, marketplaceQuickFilters } from '@/features/marketplace/data';
import useAuthStore from '@/stores/auth.store';
import { useMyShopsQuery } from '@/queries/shops/useMyShops';

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const isSeller = user?.role === 'seller';
  const { data: myShops, isLoading: isLoadingMyShops } = useMyShopsQuery(isSeller);
  const hasSellerShop = !!myShops?.length;

  // Ready to migrate to React Hook Form: keep filter state centralized as one object.
  const [filters, setFilters] = useState({
    keyword: '',
  });

  // Ready to migrate to React Query: replace marketplaceProducts by query data.
  const filteredProducts = useMemo(() => {
    if (!filters.keyword.trim()) {
      return marketplaceProducts;
    }

    return marketplaceProducts.filter((item) =>
      item.name.toLowerCase().includes(filters.keyword.trim().toLowerCase()),
    );
  }, [filters.keyword]);

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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    image={product.image}
                    location={product.location}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    soldText={product.soldText}
                  />
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Button variant="outline" className="min-w-44 text-primary">
                  Xem thêm
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Home;
