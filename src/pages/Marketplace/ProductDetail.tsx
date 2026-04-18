import { CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMarketplaceProductById, marketplaceProducts } from '@/features/marketplace/data';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();

  // Ready for React Query: replace lookup by query(`/products/${productId}`).
  const product = productId ? getMarketplaceProductById(productId) : undefined;

  const relatedProducts = useMemo(
    () => marketplaceProducts.filter((item) => item.id !== productId).slice(0, 4),
    [productId],
  );

  if (!product) {
    return (
      <main className="container py-8">
        <Card className="rounded-lg shadow-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm.</p>
            <Button asChild>
              <Link to="/">Quay về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container space-y-6 py-6">
      <Card className="rounded-lg shadow-card">
        <CardContent className="grid gap-6 p-5 md:grid-cols-[1fr_1.1fr]">
          <div className="overflow-hidden rounded-lg border">
            <img src={product.image} alt={product.name} className="h-full min-h-[300px] w-full object-cover" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Badge variant="success">Sản phẩm nổi bật</Badge>
              <h1 className="text-2xl font-semibold text-[#27272a] md:text-3xl">{product.name}</h1>
              <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {product.location}
              </div>
            </div>

            <div className="rounded-lg border bg-[#f8faf8] p-4">
              <p className="text-3xl font-semibold text-primary">{product.price.toLocaleString('vi-VN')}đ</p>
              <p className="text-sm text-muted-foreground">Đơn vị tính: {product.unit}</p>
            </div>

            <p className="text-sm leading-6 text-[#27272a]">{product.description}</p>

            <div className="flex flex-wrap gap-2">
              {product.hasVerifiedDiary ? (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Có nhật ký canh tác xác thực
                </Badge>
              ) : null}
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Kiểm định chất lượng
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="min-w-40">Thêm vào giỏ</Button>
              <Button variant="outline" className="min-w-40">
                Liên hệ nhà bán
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Nhật ký canh tác</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 border-l-2 border-primary/30 pl-4">
            {(product.diaries ?? [
              {
                id: 'd1',
                productId: product.id,
                date: '2026-03-01',
                description: 'Gieo trồng theo tiêu chuẩn hữu cơ, không thuốc trừ sâu tổng hợp.',
                images: [],
              },
              {
                id: 'd2',
                productId: product.id,
                date: '2026-04-05',
                description: 'Thu hoạch và sơ tuyển tại vườn, đóng gói trong ngày.',
                images: [],
              },
            ]).map((diary) => (
              <div key={diary.id} className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {new Date(diary.date).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-sm text-[#27272a]">{diary.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Sản phẩm liên quan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                image={item.image}
                location={item.location}
                soldText={item.soldText}
                rating={item.rating}
                reviewCount={item.reviewCount}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProductDetail;