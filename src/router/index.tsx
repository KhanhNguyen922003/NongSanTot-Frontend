import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Marketplace/Home';
import ProductDetail from '@/pages/Marketplace/ProductDetail';
import SignUpForm from '@/pages/Auth/SignUpForm';
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
        path: '/products/:productId',
        element: <ProductDetail />,
      },
    ],
  },
  {
    path: '/signup',
    element: <SignUpForm />,
  },
  {
    path: '/farmer/dashboard',
    element: <FarmerDashboard />,
  },
  // Thêm các route khác ở đây
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
