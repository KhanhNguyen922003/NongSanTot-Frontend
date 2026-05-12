import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { MarketplaceProduct } from '@/queries/products/types';

type ProductCardProps = {
  product: MarketplaceProduct;
};

const unitLabel = (u?: string | null) => u?.trim() || 'kg';

export function ProductCard({ product }: ProductCardProps) {
  const image = product.coverImage || product.images?.[0];
  const location = (product.shopDisplayAddress || product.origin || '').trim() || '—';
  const u = unitLabel(product.unit);
  const rating = product.averageRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const starCount = reviewCount > 0 ? Math.round(rating) : 0;
  const hasVerifiedDiary = !!product.verifiedBadge || (product.trustScore ?? 0) >= 80;
  const lowStock = product.stock > 0 && product.stock <= 10;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      to={`/san-pham/${product.id}`}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden rounded-lg border-[#d9d9d9] transition group-hover:-translate-y-0.5 group-hover:shadow-card">
        <div className="relative h-44 bg-gradient-to-br from-green-50 to-yellow-50">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
              Chưa có ảnh sản phẩm
            </div>
          )}
          {hasVerifiedDiary ? (
            <Badge variant="success" className="absolute right-2 top-3 gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              Có nhật ký
            </Badge>
          ) : null}
          {lowStock ? (
            <Badge className="absolute left-2 top-3 rounded-md bg-amber-500 text-[10px] text-white hover:bg-amber-500">
              Sắp hết
            </Badge>
          ) : null}
          {outOfStock ? (
            <Badge variant="outline" className="absolute left-2 top-3 border-slate-400 text-[10px] text-slate-700">
              Hết hàng
            </Badge>
          ) : null}
        </div>
        <CardContent className="space-y-2 p-2.5">
          <div className="inline-flex max-w-full items-center gap-1 text-[10px] text-[#a1a1a1]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <p className="line-clamp-2 min-h-[2rem] text-xs font-medium leading-snug text-[#27272a]">{product.name}</p>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] text-muted-foreground">
            <span className="line-clamp-1 font-medium text-[#52525b]">{product.shopName || 'Nhà bán'}</span>
            {product.categoryName ? (
              <>
                <span className="text-[#d4d4d4]">·</span>
                <span className="line-clamp-1">{product.categoryName}</span>
              </>
            ) : null}
          </div>
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
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xl font-semibold leading-tight text-primary md:text-2xl">
                {product.price.toLocaleString('vi-VN')}đ
                <span className="whitespace-nowrap text-xs font-normal text-muted-foreground"> / {u}</span>
              </p>
              <p className="mt-0.5 text-[10px] text-[#a1a1a1]">
                Còn {product.stock.toLocaleString('vi-VN')} {u}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{hasVerifiedDiary ? 'Uy tín tốt' : 'Uy tín trên chợ'}</span>
            <span className="font-medium text-primary">{Math.round(product.trustScore ?? 0)}/100</span>
          </div>
          <div className="flex h-8 w-full items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground transition group-hover:bg-primary/90">
            Xem chi tiết
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
