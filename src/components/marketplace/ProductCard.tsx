import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { MarketplaceProduct } from '@/queries/products/types';

type ProductCardProps = {
  product: MarketplaceProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.coverImage || product.images?.[0];
  const location = product.shopDisplayAddress || product.origin;
  const rating = product.averageRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const starCount = reviewCount > 0 ? Math.round(rating) : 0;
  const hasVerifiedDiary = !!product.verifiedBadge || (product.trustScore ?? 0) >= 80;

  return (
    <Card className="overflow-hidden rounded-lg border-[#d9d9d9] transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative h-44 bg-gradient-to-br from-green-50 to-yellow-50">
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
            Chưa có ảnh sản phẩm
          </div>
        )}
        <Badge className="absolute left-0 top-3 rounded-l-none rounded-r-md">Đã duyệt</Badge>
        {hasVerifiedDiary ? (
          <Badge variant="success" className="absolute right-2 top-3 gap-1 text-[10px]">
            <ShieldCheck className="h-3 w-3" />
            Uy tín
          </Badge>
        ) : null}
      </div>
      <CardContent className="space-y-2 p-2.5">
        <div className="inline-flex items-center gap-1 text-[10px] text-[#a1a1a1]">
          <MapPin className="h-3 w-3" />
          {location}
        </div>
        <p className="line-clamp-2 h-8 text-xs text-[#27272a]">{product.name}</p>
        <p className="line-clamp-1 text-[10px] text-muted-foreground">
          {product.shopName || 'Nhà bán Nông Sản Tốt'}
        </p>
        <div className="flex items-center gap-0.5 text-secondary">
          {starCount > 0 ? (
            <>
              {Array.from({ length: starCount }).map((_, idx) => (
                <Star key={idx} className="h-3 w-3 fill-current" />
              ))}
              <span className="ml-1 text-[10px] text-muted-foreground">({reviewCount})</span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground">Chưa có đánh giá</span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-medium text-primary">{product.price.toLocaleString('vi-VN')}đ</p>
            <p className="text-[10px] text-[#a1a1a1]">
              Còn {product.stock.toLocaleString('vi-VN')} {product.unit || 'kg'}
            </p>
          </div>
          <Badge variant="success" className="text-[10px]">
            {product.unit || 'kg'}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Trust score</span>
          <span className="font-medium text-primary">{product.trustScore ?? 0}/100</span>
        </div>
        <Button asChild className="h-8 w-full">
          <Link to={`/san-pham/${product.id}`}>Xem chi tiết</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
