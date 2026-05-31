import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/auth.store';

interface Props {
  children: ReactElement;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    const next = encodeURIComponent(location.pathname + (location.search || ''));
    return <Navigate to={`/dang-nhap?next=${next}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/thong-ke-cua-hang' : '/';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;
