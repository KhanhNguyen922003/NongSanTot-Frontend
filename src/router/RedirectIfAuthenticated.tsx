import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/stores/auth.store';

const RedirectIfAuthenticated = ({ children }: { children: ReactElement }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return children;
  const home = user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/thong-ke-cua-hang' : '/';
  return <Navigate to={home} replace />;
};

export default RedirectIfAuthenticated;
