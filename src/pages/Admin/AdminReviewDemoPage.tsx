import { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { useAdminProductsQuery, useAdminUsersQuery } from '@/queries/admin/useAdmin';
import { useCreateDemoReviewMutation } from '@/queries/reviews/useReviews';

const ratingOptions = [5, 4, 3, 2, 1].map((value) => ({ value: String(value), label: `${value} sao` }));

const AdminReviewDemoPage = () => {
  const { data: users = [], isLoading: usersLoading, isError: usersError, error: usersFetchError } = useAdminUsersQuery('buyer');
  const { data: products = [], isLoading: productsLoading, isError: productsError, error: productsFetchError } = useAdminProductsQuery('active');
  const createDemoReview = useCreateDemoReviewMutation();

  const [buyerId, setBuyerId] = useState('');
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!buyerId && users.length) setBuyerId(users[0].id);
  }, [buyerId, users]);

  useEffect(() => {
    if (!productId && products.length) setProductId(products[0].id);
  }, [productId, products]);

  const selectedProduct = useMemo(() => products.find((item) => item.id === productId) ?? null, [productId, products]);
  const selectedUser = useMemo(() => users.find((item) => item.id === buyerId) ?? null, [buyerId, users]);

  const isBusy = usersLoading || productsLoading;

  if (isBusy) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải dữ liệu demo...
        </CardContent>
      </Card>
    );
  }

  if (usersError || productsError || !users.length || !products.length) {
    return (
      <p className="text-sm text-red-600">
        {getApiErrorMessage(usersFetchError ?? productsFetchError, 'Không thể tải dữ liệu demo review.')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Demo review nội bộ</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Chọn buyer, chọn sản phẩm và tạo review demo. API sẽ sinh một đơn delivered giả lập để giữ business flow nhất quán.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              id="demo-buyer"
              label="Buyer"
              value={buyerId}
              onValueChange={setBuyerId}
              placeholder="Chọn user"
              options={users.map((user) => ({ value: user.id, label: `${user.fullName} - ${user.phone}` }))}
            />
            <FormSelect
              id="demo-product"
              label="Sản phẩm"
              value={productId}
              onValueChange={setProductId}
              placeholder="Chọn sản phẩm"
              options={products.map((product) => ({ value: product.id, label: `${product.name} - ${product.shopName ?? 'Chưa rõ shop'}` }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <FormSelect
              id="demo-rating"
              label="Số sao"
              value={rating}
              onValueChange={setRating}
              options={ratingOptions}
            />
            <FormTextarea
              id="demo-comment"
              label="Nội dung review"
              rows={4}
              placeholder="Sản phẩm ngon, giao nhanh, đóng gói đẹp..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          {selectedUser || selectedProduct ? (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {selectedUser ? <Badge variant="outline">Buyer: {selectedUser.fullName}</Badge> : null}
              {selectedProduct ? <Badge variant="outline">Product: {selectedProduct.name}</Badge> : null}
            </div>
          ) : null}

          <Button
            type="button"
            onClick={() =>
              createDemoReview.mutate({
                buyerId,
                productId,
                rating: Number(rating),
                comment: comment.trim() || undefined,
              })
            }
            disabled={createDemoReview.isPending || !buyerId || !productId}
          >
            {createDemoReview.isPending ? 'Đang tạo...' : 'Tạo review demo'}
          </Button>

          {createDemoReview.isSuccess ? (
            <p className="text-sm text-emerald-700">Đã tạo review demo thành công.</p>
          ) : null}
          {createDemoReview.isError ? (
            <p className="text-sm text-red-600">
              {getApiErrorMessage(createDemoReview.error, 'Không thể tạo review demo.')}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviewDemoPage;