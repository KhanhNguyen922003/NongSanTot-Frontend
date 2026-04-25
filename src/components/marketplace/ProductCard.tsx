import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/shared/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ProductCardProps = {
  product: Product;
  image?: string;
  soldText?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
};

export function ProductCard({
  product,
  image,
  soldText = 'Đã bán 1.2 tấn',
  rating = 4.8,
  reviewCount = 0,
  location = 'TP. Hồ Chí Minh',
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden rounded-lg border-[#d9d9d9]">
      <div className="relative h-44 bg-gradient-to-br from-green-50 to-yellow-50">
        {image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : null}
        <Badge className="absolute left-0 top-3 rounded-l-none rounded-r-md">New</Badge>
      </div>
      <CardContent className="space-y-2 p-2.5">
        <div className="inline-flex items-center gap-1 text-[10px] text-[#a1a1a1]">
          <MapPin className="h-3 w-3" />
          {location}
        </div>
        <p className="line-clamp-2 h-8 text-xs text-[#27272a]">{product.name}</p>
        <div className="flex items-center gap-0.5 text-secondary">
          {Array.from({ length: Math.round(rating) }).map((_, idx) => (
            <Star key={idx} className="h-3 w-3 fill-current" />
          ))}
          <span className="ml-1 text-[10px] text-muted-foreground">({reviewCount})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-medium text-primary">{product.price.toLocaleString('vi-VN')}đ</p>
            <p className="text-[10px] text-[#a1a1a1]">{soldText}</p>
          </div>
          <Badge variant="success" className="text-[10px]">
            {product.unit}
          </Badge>
        </div>
        <Button asChild className="h-8 w-full">
          <Link to={`/san-pham/${product.id}`}>Xem chi tiết</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
