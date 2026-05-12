import { Loader2, MapPin, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useAddCartItemMutation } from '@/queries/carts/useCarts';
import { useOpenProductConversationMutation } from '@/queries/messaging/useMessaging';
import { useProductDetailQuery, useProductsQuery } from '@/queries/products/useProducts';
import useAuthStore from '@/stores/auth.store';
import { useMessengerDockStore } from '@/stores/messengerDock.store';

const shippingMethodLabel = (method: string) => {
  if (method === 'GHTK') return 'Giao qua Giao Hàng Tiết Kiệm COD';
  if (method === 'SELF_DELIVERY') return 'Shop tự giao';
  return method;
};

const ProductDetail = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const user = useAuthStore((state) => state.user);
  const openMessengerEntry = useMessengerDockStore((s) => s.openEntry);
  const addCartItem = useAddCartItemMutation();
  const openConversation = useOpenProductConversationMutation();
  const [addCartMessage, setAddCartMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { data: product, isLoading, isError, error } = useProductDetailQuery(productId ?? '');
  const { data: products = [] } = useProductsQuery();

  const relatedProducts = useMemo(() => products.filter((item) => item.id !== productId).slice(0, 4), [productId, products]);

  const galleryImages = useMemo(() => {
    const raw = [product?.coverImage, ...(product?.images ?? [])].filter(
      (src): src is string => typeof src === 'string' && src.length > 0,
    );
    return [...new Set(raw)];
  }, [product?.coverImage, product?.images]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    setActiveImage(galleryImages[0] ?? null);
  }, [galleryImages]);

  if (isLoading) {
    return (
      <main className="container py-8">
        <Card className="rounded-lg shadow-card">
          <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải chi tiết sản phẩm...
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="container py-8">
        <Card className="rounded-lg shadow-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              {getApiErrorMessage(error, 'Không tìm thấy sản phẩm hoặc sản phẩm chưa được duyệt.')}
            </p>
            <Button asChild>
              <Link to="/">Quay về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const mainImage = activeImage || product.coverImage || product.images?.[0];
  const unit = product.unit?.trim() || 'kg';
  const hasVerifiedDiary = !!product.verifiedBadge || (product.trustScore ?? 0) >= 80;
  const canAddToCart = product.stock > 0;
  const rating = product.averageRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const starCount = reviewCount > 0 ? Math.round(rating) : 0;
  const onAddToCart = async () => {
    setAddCartMessage(null);
    if (!user) {
      navigate(`/dang-nhap?next=${encodeURIComponent(`/san-pham/${product.id}`)}`);
      return;
    }

    if (!canAddToCart) {
      setAddCartMessage({ type: 'error', text: 'Sản phẩm đã hết hàng. Bạn vẫn có thể nhắn tin shop để hỏi lô mới.' });
      return;
    }

    try {
      await addCartItem.mutateAsync({
        productId: product.id,
        quantity: 1,
      });
      setAddCartMessage({
        type: 'success',
        text: 'Đã thêm vào giỏ.',
      });
    } catch (addError) {
      setAddCartMessage({
        type: 'error',
        text: getApiErrorMessage(addError, 'Không thể thêm sản phẩm vào giỏ hàng.'),
      });
    }
  };

  const onMessageShop = async () => {
    setAddCartMessage(null);
    if (!user) {
      navigate(`/dang-nhap?next=${encodeURIComponent(`/san-pham/${product.id}`)}`);
      return;
    }
    try {
      const conv = await openConversation.mutateAsync(product.id);
      openMessengerEntry({
        conversationId: conv.id,
        expandHref: `/tro-chuyen/${conv.id}`,
        title: product.shopName ?? 'Shop',
        subtitle: product.name,
      });
    } catch (err) {
      setAddCartMessage({
        type: 'error',
        text: getApiErrorMessage(err, 'Không mở được hội thoại với shop.'),
      });
    }
  };

  return (
    <main className="container space-y-6 py-6">
      <Card className="rounded-lg shadow-card">
        <CardContent className="grid gap-6 p-5 md:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border bg-slate-50">
              {mainImage ? (
                <img src={mainImage} alt={product.name} className="h-full min-h-[300px] w-full object-cover" />
              ) : (
                <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
                  Chưa có ảnh sản phẩm
                </div>
              )}
            </div>
            {galleryImages.length > 1 ? (
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.slice(0, 8).map((image) => {
                  const selected = mainImage === image;
                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`overflow-hidden rounded-md border-2 p-0 transition ${
                        selected ? 'border-primary ring-1 ring-primary/30' : 'border-transparent hover:border-muted'
                      }`}
                      aria-label="Xem ảnh"
                      aria-pressed={selected}
                    >
                      <img src={image} alt="" className="h-20 w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {product.categoryName ? (
                  <Badge variant="outline" className="font-normal">
                    {product.categoryName}
                  </Badge>
                ) : null}
                {hasVerifiedDiary ? (
                  <Badge variant="success">Uy tín tốt trên chợ</Badge>
                ) : (
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    Uy tín trên chợ: {Math.round(product.trustScore ?? 0)}/100 điểm
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-semibold text-[#27272a] md:text-3xl">{product.name}</h1>
              <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {product.shopDisplayAddress || product.origin}
              </div>
              <p className="text-sm text-muted-foreground">
                Nhà bán: <span className="font-medium text-[#27272a]">{product.shopName || 'Nông Sản Tốt'}</span>
              </p>
            </div>

            <div className="rounded-lg border bg-[#f8faf8] p-4">
              <p className="text-3xl font-semibold text-primary">
                {product.price.toLocaleString('vi-VN')}đ
                <span className="text-lg font-medium text-muted-foreground"> / {unit}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Còn {product.stock.toLocaleString('vi-VN')} {unit}
                {!canAddToCart ? (
                  <span className="ml-2 font-medium text-amber-700">· Đang hết hàng</span>
                ) : product.stock <= 10 ? (
                  <span className="ml-2 font-medium text-amber-700">· Số lượng còn ít</span>
                ) : null}
              </p>
            </div>

            <div className="flex items-center gap-1 text-secondary">
              {starCount > 0 ? (
                <>
                  {Array.from({ length: starCount }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-1 text-sm text-muted-foreground">({reviewCount} đánh giá)</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Chưa có đánh giá</span>
              )}
            </div>

            <p className="whitespace-pre-line text-sm leading-6 text-[#27272a]">{product.description}</p>

            <div className="flex flex-wrap gap-2">
              {hasVerifiedDiary ? (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Có nhật ký canh tác xác thực
                </Badge>
              ) : null}
              {(product.shippingMethods ?? []).map((method) => (
                <Badge key={method} variant="outline">
                  {shippingMethodLabel(method)}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="min-w-40"
                disabled={addCartItem.isPending || !canAddToCart}
                onClick={() => void onAddToCart()}
              >
                {addCartItem.isPending ? 'Đang thêm...' : !canAddToCart ? 'Hết hàng' : 'Thêm vào giỏ'}
              </Button>
              <Button
                variant="outline"
                className="min-w-44 gap-2"
                disabled={openConversation.isPending}
                onClick={() => void onMessageShop()}
              >
                <MessageCircle className="h-4 w-4" />
                {openConversation.isPending ? 'Đang mở...' : 'Nhắn tin shop / Trả giá'}
              </Button>
            </div>
            {addCartMessage ? (
              <div className="space-y-2">
                <AuthFormMessage type={addCartMessage.type} text={addCartMessage.text} />
                {addCartMessage.type === 'success' ? (
                  <p className="text-sm">
                    <Link to="/gio-hang" className="font-medium text-primary underline underline-offset-2">
                      Mở giỏ hàng
                    </Link>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Nhật ký canh tác</CardTitle>
        </CardHeader>
        <CardContent>
          {product.growthDiary?.length ? (
            <div className="space-y-4 border-l-2 border-primary/30 pl-4">
              {product.growthDiary.map((diary) => (
                <div key={diary.id} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {diary.logDate ? new Date(diary.logDate).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
                  </p>
                  <p className="text-sm font-medium text-[#27272a]">
                    Giai đoạn {diary.stageOrder}: {diary.stageName}
                  </p>
                  <p className="text-sm text-[#27272a]">{diary.description || 'Không có mô tả.'}</p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                    {(diary.images ?? []).map((image) => (
                      <img key={image} src={image} alt={diary.stageName} className="h-24 w-full rounded-md object-cover" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sản phẩm chưa có nhật ký canh tác.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Sản phẩm liên quan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProductDetail;