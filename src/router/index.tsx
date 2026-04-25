import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Marketplace/Home';
import ProductDetail from '@/pages/Marketplace/ProductDetail';
import SignUpForm from '@/pages/Auth/SignUpForm';
import SignInForm from '@/pages/Auth/SignInForm';
import CreateShopForm from '@/pages/Seller/CreateShopForm';
import FarmerDashboard from '@/pages/Dashboard/FarmerDashboard';
import MarketplaceLayout from '@/layouts/MarketplaceLayout';

const router = createBrowserRouter([
  {
    element: <MarketplaceLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/san-pham/:productId',
        element: <ProductDetail />,
      },
      {
        path: '/dang-ky-ban-hang',
        element: <CreateShopForm />,
      },
      {
        path: '/thong-ke-cua-hang',
        element: <FarmerDashboard />,
      },
    ],
  },
  {
    path: '/dang-ky',
    element: <SignUpForm />,
  },
  {
    path: '/dang-nhap',
    element: <SignInForm />,
  },
  // Thêm các route khác ở đây
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
