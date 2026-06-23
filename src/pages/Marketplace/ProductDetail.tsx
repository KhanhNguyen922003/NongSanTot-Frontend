import { Loader2, MapPin, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sellerProductPaths } from '@/constants/routes';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useAddCartItemMutation } from '@/queries/carts/useCarts';
import { useOpenProductConversationMutation } from '@/queries/messaging/useMessaging';
import { useProductDetailQuery, useProductsQuery } from '@/queries/products/useProducts';
import { useCreateMyReviewMutation, useMyReviewEligibilityQuery, useProductReviewsQuery } from '@/queries/reviews/useReviews';
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
  const createReview = useCreateMyReviewMutation();
  const [addCartMessage, setAddCartMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const { data: product, isLoading, isError, error } = useProductDetailQuery(productId ?? '');
  const { data: products = [] } = useProductsQuery();
  const { data: reviewData } = useProductReviewsQuery(productId ?? '');
  const { data: reviewEligibility } = useMyReviewEligibilityQuery(productId ?? '', !!user);

  const isMyOwnProduct = product?.shopOwnerId && user?.id === product.shopOwnerId;
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
      <main className="container px-3 py-6 sm:px-4">
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
      <main className="container px-3 py-6 sm:px-4">
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
  const reviewSummary = reviewData?.summary;
  const reviewItems = reviewData?.items ?? [];
  const effectiveAverageRating = reviewSummary?.averageRating ?? rating;
  const effectiveReviewCount = reviewSummary?.reviewCount ?? reviewCount;
  const canWriteReview = !!user && !!reviewEligibility?.canReview;

  const submitReview = async () => {
    if (!user) {
      navigate(`/dang-nhap?next=${encodeURIComponent(`/san-pham/${product.id}`)}`);
      return;
    }
    try {
      await createReview.mutateAsync({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setAddCartMessage({ type: 'success', text: 'Đã gửi review thành công.' });
      setReviewComment('');
      setReviewRating(5);
    } catch (reviewError) {
      setAddCartMessage({
        type: 'error',
        text: getApiErrorMessage(reviewError, 'Không thể gửi review.'),
      });
    }
  };
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
    <main className="container space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
      <Card className="rounded-lg shadow-card">
        <CardContent className="grid gap-5 p-4 sm:gap-6 sm:p-5 md:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border bg-slate-50">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full min-h-[220px] w-full object-cover sm:min-h-[280px] md:min-h-[300px]"
                />
              ) : (
                <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
                  Chưa có ảnh sản phẩm
                </div>
              )}
            </div>
            {galleryImages.length > 1 ? (
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
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
                      <img src={image} alt="" className="h-14 w-full object-cover sm:h-20" />
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
                Nhà bán:{' '}
                <Link
                  to={`/cua-hang/${product.shopId}`}
                  className="font-medium text-[#27272a] hover:underline"
                >
                  {product.shopName || 'Nông Sản Tốt'}
                </Link>
                {isMyOwnProduct ? (
                  <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Bạn là chủ shop
                  </span>
                ) : null}
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
              {effectiveReviewCount > 0 ? (
                <>
                  {Array.from({ length: Math.round(effectiveAverageRating) }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-1 text-sm text-muted-foreground">
                    ({effectiveReviewCount} đánh giá · {effectiveAverageRating.toFixed(1)}/5)
                  </span>
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

            {isMyOwnProduct ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <Button
                  className="w-full min-w-0 sm:w-auto sm:min-w-40"
                  onClick={() => navigate(sellerProductPaths.edit(product.id))}
                >
                  Chỉnh sửa sản phẩm
                </Button>
                <Button
                  variant="outline"
                  className="w-full min-w-0 gap-2 sm:w-auto sm:min-w-44"
                  onClick={() => navigate(sellerProductPaths.stock(product.id))}
                >
                  Quản lý tồn kho
                </Button>
                <Button
                  variant="ghost"
                  className="w-full min-w-0 sm:w-auto"
                  onClick={() => navigate(sellerProductPaths.orders(product.id))}
                >
                  Xem đơn hàng
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <Button
                  className="w-full min-w-0 sm:w-auto sm:min-w-40"
                  disabled={addCartItem.isPending || !canAddToCart}
                  onClick={() => void onAddToCart()}
                >
                  {addCartItem.isPending ? 'Đang thêm...' : !canAddToCart ? 'Hết hàng' : 'Thêm vào giỏ'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full min-w-0 gap-2 sm:w-auto sm:min-w-44"
                  disabled={openConversation.isPending}
                  onClick={() => void onMessageShop()}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate sm:whitespace-normal">
                    {openConversation.isPending ? 'Đang mở...' : 'Nhắn tin shop / Trả giá'}
                  </span>
                </Button>
              </div>
            )}
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

            <Card className="rounded-lg border bg-white shadow-card">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Đánh giá sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 sm:grid-cols-[180px_1fr] sm:items-center">
                  <div>
                    <p className="text-3xl font-semibold text-primary">{effectiveAverageRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">{effectiveReviewCount} đánh giá</p>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {([5, 4, 3, 2, 1] as const).map((score) => {
                      const count = reviewSummary?.ratingCounts?.[score] ?? 0;
                      const percent = effectiveReviewCount ? (count / effectiveReviewCount) * 100 : 0;
                      return (
                        <div key={score} className="flex items-center gap-2">
                          <span className="w-6">{score}★</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {canWriteReview ? (
                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#27272a]">Viết review của bạn</p>
                      <Badge variant="outline">Chỉ đơn delivered mới được phép</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {([5, 4, 3, 2, 1] as const).map((score) => (
                        <Button
                          key={score}
                          type="button"
                          variant={reviewRating === score ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReviewRating(score)}
                        >
                          {score}★
                        </Button>
                      ))}
                    </div>
                    <FormTextarea
                      id="product-review-comment"
                      label="Nội dung"
                      rows={4}
                      placeholder="Bạn thấy sản phẩm thế nào?"
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                    />
                    <Button type="button" onClick={() => void submitReview()} disabled={createReview.isPending}>
                      {createReview.isPending ? 'Đang gửi...' : 'Gửi review'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {reviewEligibility?.reason || 'Bạn cần đăng nhập và có đơn delivered để viết review.'}
                  </p>
                )}

                <div className="space-y-3">
                  {reviewItems.length ? (
                    reviewItems.map((item) => (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-[#27272a]">{item.reviewerName || 'Người mua ẩn danh'}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ ngày'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: item.rating }).map((_, index) => (
                              <Star key={index} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        {item.comment ? <p className="mt-3 whitespace-pre-line text-sm text-[#27272a]">{item.comment}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sản phẩm chưa có review nào.</p>
                  )}
                </div>
              </CardContent>
            </Card>
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
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
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