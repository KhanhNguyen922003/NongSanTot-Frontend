import { useEffect, useState } from 'react';
import { Sparkles, Store } from 'lucide-react';
import { Product } from '@/shared/types';
import { useApi } from '@/hooks/useApi';
import { MarketplaceNavbar } from '@/components/marketplace/MarketplaceNavbar';
import { MarketplaceFooter } from '@/components/marketplace/MarketplaceFooter';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categories = [
  'Rau củ quả và nấm',
  'Trái cây tươi',
  'Thịt',
  'Hải sản',
  'Thực phẩm đông lạnh',
  'Mắm, gia vị và thảo mộc',
  'Đồ khô',
];

const Home = () => {
  const { loading } = useApi<Product[]>();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts([
      { id: '1', shopId: '1', name: 'Sầu Riêng Ri6 (Tách Múi)', price: 198000, quantity: 100, unit: 'Hộp', description: 'Fresh product', hasVerifiedDiary: true },
      { id: '2', shopId: '1', name: 'Bơ Sáp Đắk Lắk (Loại 1)', price: 52000, quantity: 100, unit: 'Kg', description: 'Fresh product', hasVerifiedDiary: true },
      { id: '3', shopId: '1', name: 'Cá Chỉ Vàng Khô (Tẩm gia vị)', price: 150000, quantity: 100, unit: 'Gói', description: 'Fresh product', hasVerifiedDiary: true },
      { id: '4', shopId: '1', name: 'Bánh Cốm Nguyên Ninh', price: 76500, quantity: 100, unit: 'Hộp', description: 'Fresh product', hasVerifiedDiary: true },
      { id: '5', shopId: '1', name: 'Tôm thẻ chân trắng hữu cơ', price: 242000, quantity: 100, unit: 'Kg', description: 'Fresh product', hasVerifiedDiary: true },
      { id: '6', shopId: '1', name: 'Cà phê Robusta đặc sản', price: 180000, quantity: 100, unit: 'Túi', description: 'Fresh product', hasVerifiedDiary: true },
      { id: '7', shopId: '1', name: 'Gạo ST25', price: 166500, quantity: 100, unit: 'Túi', description: 'Fresh product', hasVerifiedDiary: true },
      { id: '8', shopId: '1', name: 'Thịt ba rọi', price: 200000, quantity: 100, unit: 'Kg', description: 'Fresh product', hasVerifiedDiary: true },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <MarketplaceNavbar />

      <main className="container py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[255px_1fr]">
          <aside className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Danh mục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category) => (
                  <div key={category} className="rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                    {category}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-2 p-4 text-sm text-primary">
                <Store className="h-4 w-4" />
                Bán hàng cùng Xanh Hi!
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="inline-flex items-center gap-2 text-[20px] font-medium text-primary">
                  <Sparkles className="h-5 w-5" />
                  Sản phẩm mới
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {products.map((product) => (
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

      <MarketplaceFooter />
    </div>
  );
};

export default Home;
