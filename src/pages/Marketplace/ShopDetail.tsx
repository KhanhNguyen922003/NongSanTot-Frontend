import { Star, Store, Package, TrendingUp, Loader2, MapPin, MessageCircle, Phone, CalendarDays } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { useShopDetailQuery } from '@/queries/shops/useShops';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useMemo } from 'react';

const ShopDetail = () => {
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  const { data, isLoading, isError, error } = useShopDetailQuery(shopId ?? '');

  const productsByCategory = useMemo(() => {
    if (!data?.products) return {};
    return data.products.reduce((acc, product) => {
      const cat = product.categoryName || 'Sản phẩm khác';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, typeof data.products>);
  }, [data?.products]);

  const categoryNames = useMemo(() => Object.keys(productsByCategory).sort(), [productsByCategory]);

  if (isLoading) {
    return (
      <main className="container px-3 py-6 sm:px-4">
        <Card className="rounded-lg shadow-card">
          <CardContent className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Đang tải thông tin cửa hàng...
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="container px-3 py-6 sm:px-4">
        <Card className="rounded-lg shadow-card">
          <CardContent className="space-y-4 p-6 flex flex-col items-center justify-center py-20">
            <Store className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-base text-muted-foreground">
              {getApiErrorMessage(error, 'Không tìm thấy cửa hàng.')}
            </p>
            <Button onClick={() => navigate('/')}>Quay về trang chủ</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { shop, statistics } = data;
  const rating = Math.round(shop.rating * 10) / 10;
  const ratingStars = Math.round(shop.rating);

  return (
    <main className="bg-slate-50 min-h-screen pb-10">
      {/* Cover Image & Shop Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="container px-3 sm:px-4">
          <div className="relative pt-6 pb-6 sm:pt-8 sm:pb-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            {/* Logo */}
            <div className="flex-shrink-0 relative">
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="h-28 w-28 md:h-36 md:w-36 rounded-full border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 md:h-36 md:w-36 items-center justify-center rounded-full border-4 border-white shadow-md bg-slate-100">
                  <Store className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {/* Online Badge */}
              <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#27272a] md:text-3xl">{shop.name}</h1>
                  {shop.displayAddress && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                      <MapPin className="h-4 w-4" />
                      {shop.displayAddress}
                    </div>
                  )}
                  {shop.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 max-w-2xl">
                      {shop.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <Button className="flex-1 md:flex-none gap-2 bg-primary hover:bg-primary/90">
                    <MessageCircle className="h-4 w-4" />
                    Chat ngay
                  </Button>
                  <Button variant="outline" className="flex-1 md:flex-none gap-2">
                    <Phone className="h-4 w-4" />
                    Liên hệ
                  </Button>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3 border-t border-border mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">{rating}</span>
                    <span className="text-muted-foreground ml-1">/ 5.0</span>
                  </div>
                </div>
                
                <div className="w-px h-4 bg-border hidden sm:block"></div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{statistics.activeProductsCount}</span>
                  <span className="text-muted-foreground">sản phẩm</span>
                </div>

                <div className="w-px h-4 bg-border hidden sm:block"></div>

                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{statistics.deliveredOrdersCount}</span>
                  <span className="text-muted-foreground">đơn đã giao</span>
                </div>

                <div className="w-px h-4 bg-border hidden sm:block"></div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Tham gia {new Date(shop.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-3 py-8 sm:px-4 space-y-12">
        {/* Products Section by Category */}
        {categoryNames.length > 0 ? (
          categoryNames.map(category => (
            <div key={category} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#27272a]">{category}</h2>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {productsByCategory[category].length}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4 lg:gap-6">
                {productsByCategory[category].map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      shopId: shop.id,
                      categoryId: product.categoryId,
                      name: product.name,
                      description: null,
                      origin: '',
                      price: product.price,
                      stock: product.stock,
                      unit: null,
                      tags: null,
                      coverImage: product.coverImage,
                      images: null,
                      videos: null,
                      shippingMethods: null,
                      pickupAddressSnapshot: null,
                      preferredShippingServiceId: null,
                      status: 'active',
                      trustScore: product.trustScore,
                      verifiedBadge: product.verifiedBadge,
                      averageRating: product.averageRating,
                      reviewCount: product.reviewCount,
                      isAvailable: true,
                      createdAt: null,
                      updatedAt: null,
                      shopName: shop.name,
                      shopDisplayAddress: shop.displayAddress,
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm border border-border">
            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Chưa có sản phẩm</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Cửa hàng này hiện tại chưa có sản phẩm nào đang bán. Vui lòng quay lại sau!
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ShopDetail;
