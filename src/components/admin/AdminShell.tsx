import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Loader2, ShieldCheck } from 'lucide-react';
import { auth } from '../../../firebase.config';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthMeQuery } from '@/queries/Auth/useAuth';
import useAuthStore from '@/stores/auth.store';

const adminLinks = [
  { to: '/admin', label: 'Tổng quan' },
  { to: '/admin/san-pham-duyet', label: 'Duyệt sản phẩm' },
];

const AdminShell = () => {
  const location = useLocation();
  const [firebaseUser, setFirebaseUser] = useState<User | null | 'pending'>('pending');
  const { data, isLoading, isError, error } = useAuthMeQuery(typeof firebaseUser === 'object' && firebaseUser !== null);
  const cachedUser = useAuthStore((state) => state.user);
  const user = data?.user ?? cachedUser;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setFirebaseUser(nextUser);
    });
    return () => unsub();
  }, []);

  if (firebaseUser === 'pending') {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang kiểm tra phiên đăng nhập...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (isLoading && !user) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang kiểm tra quyền admin...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || user?.role !== 'admin') {
    const message = error instanceof Error ? error.message : 'Tài khoản này không có quyền admin.';
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <AuthFormMessage type="error" text={message} />
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Quay về trang chủ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-card md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#27272a]">Admin Nông Sản Tốt</h1>
            <p className="text-sm text-muted-foreground">{user.fullName} · {user.phone}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {adminLinks.map((link) => (
            <Button
              key={link.to}
              asChild
              variant={location.pathname === link.to ? 'default' : 'outline'}
              size="sm"
            >
              <Link to={link.to}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default AdminShell;
