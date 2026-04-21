import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { Loader2, Store } from 'lucide-react';
import { auth } from '../../../firebase.config';
import { AuthPageChrome } from '@/components/auth/AuthPageChrome';
import { FormInput } from '@/components/form/FormInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { shopSchema, type ShopFormValues } from '@/lib/auth/authSchemas';

const SELLER_REGISTER_PATH = '/seller/register';

const CreateShopForm = () => {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState<User | null | 'pending'>('pending');

  const form = useForm<ShopFormValues>({
    resolver: yupResolver(shopSchema) as Resolver<ShopFormValues>,
    defaultValues: { shopName: '', displayAddress: '' },
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        navigate(`/signin?next=${encodeURIComponent(SELLER_REGISTER_PATH)}`, { replace: true });
      }
    });
    return () => unsub();
  }, [navigate]);

  const onSubmit = form.handleSubmit(async (values) => {
    // TODO: React Query mutation tạo shop trên backend + đồng bộ vai trò người bán
    console.info('Create shop', { ...values, uid: auth.currentUser?.uid });
    navigate('/farmer/dashboard');
  });

  if (firebaseUser === 'pending') {
    return (
      <AuthPageChrome>
        <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
          <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang kiểm tra đăng nhập…
          </CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  if (firebaseUser === null) {
    return (
      <AuthPageChrome>
        <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Đang chuyển đến trang đăng nhập…</CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  return (
    <AuthPageChrome>
      <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Store className="h-6 w-6" />
            <CardTitle className="text-xl text-[#27272a]">Đăng ký bán hàng</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Tạo cửa hàng trên Xanh Hi. Bạn đã đăng nhập; điền thông tin shop để tiếp tục.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <FormInput
              id="shop-name"
              label="Tên cửa hàng"
              placeholder="Vườn rau nhà Lan"
              error={form.formState.errors.shopName?.message}
              {...form.register('shopName')}
            />
            <FormInput
              id="shop-address"
              label="Địa chỉ hiển thị"
              placeholder="Xã ..., huyện ..., tỉnh ..."
              error={form.formState.errors.displayAddress?.message}
              {...form.register('displayAddress')}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi…
                </>
              ) : (
                'Tạo cửa hàng'
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/" className="text-primary underline-offset-4 hover:underline">
                Quay về trang chủ
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthPageChrome>
  );
};

export default CreateShopForm;
