import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Home from "@/pages/Marketplace/Home";
import ProductDetail from "@/pages/Marketplace/ProductDetail";
import ShopDetail from "@/pages/Marketplace/ShopDetail";
import CartPage from "@/pages/Marketplace/CartPage";
import CheckoutPage from "@/pages/Orders/CheckoutPage";
import BuyOrdersPage from "@/pages/Orders/BuyOrdersPage";
import SellOrdersPage from "@/pages/Orders/SellOrdersPage";
import SellerConfirmOrderPage from "@/pages/Orders/SellerConfirmOrderPage";
import OrderDetailPage from "@/pages/Orders/OrderDetailPage";
import SignUpForm from "@/pages/Auth/SignUpForm";
import SignInForm from "@/pages/Auth/SignInForm";
import CreateShopForm from "@/pages/Seller/CreateShopForm";
import CreateNewProduct from "@/pages/Seller/CreateNewProduct/CreateNewProduct";
import FarmerDashboardHome from "@/pages/Dashboard/FarmerDashboardHome";
import SellerProductsPage from "@/pages/Dashboard/SellerProductsPage";
import SellerMessagesPage from "@/pages/Dashboard/SellerMessagesPage";
import ConversationThreadPage from "@/pages/Messaging/ConversationThreadPage";
import SellerDashboardLayout from "@/layouts/SellerDashboardLayout";
import MarketplaceLayout from "@/layouts/MarketplaceLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminUsersPage from "@/pages/Admin/AdminUsersPage";
import AdminProductsPage from "@/pages/Admin/AdminProductsPage";
import AdminProductDetailPage from "@/pages/Admin/AdminProductDetailPage";
import AdminShopsPage from "@/pages/Admin/AdminShopsPage";

const router = createBrowserRouter([
  {
    path: "/don-ban",
    element: <Navigate to="/thong-ke-cua-hang/don-ban" replace />,
  },
  {
    path: "/thong-ke-cua-hang",
    element: <SellerDashboardLayout />,
    children: [
      {
        index: true,
        element: <FarmerDashboardHome />,
      },
      {
        path: "san-pham",
        element: <SellerProductsPage />,
      },
      {
        path: "don-ban",
        element: <SellOrdersPage />,
      },
      {
        path: "tin-nhan",
        children: [
          { index: true, element: <SellerMessagesPage /> },
          { path: ":conversationId", element: <ConversationThreadPage /> },
        ],
      },
    ],
  },
  {
    element: <MarketplaceLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/san-pham/:productId",
        element: <ProductDetail />,
      },
      {
        path: "/cua-hang/:shopId",
        element: <ShopDetail />,
      },
      {
        path: "/gio-hang",
        element: <CartPage />,
      },
      {
        path: "/dat-hang",
        element: <CheckoutPage />,
      },
      {
        path: "/tro-chuyen",
        children: [
          { index: true, element: <Navigate to="/" replace /> },
          { path: ":conversationId", element: <ConversationThreadPage /> },
        ],
      },
      {
        path: "/don-mua",
        element: <BuyOrdersPage />,
      },
      {
        path: "/don-hang/:orderId",
        element: <OrderDetailPage />,
      },
      {
        path: "/quan-ly-don/don-mua/xac-nhan-don-hang/:orderId",
        element: <SellerConfirmOrderPage />,
      },
      {
        path: "/dang-ky-ban-hang",
        element: <CreateShopForm />,
      },
      {
        path: "/dang-tin-san-pham",
        element: <CreateNewProduct />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'shops',
        element: <AdminShopsPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'products/:productId',
        element: <AdminProductDetailPage />,
      },
      {
        path: 'san-pham-duyet',
        element: <Navigate to="/admin/products" replace />,
      },
      {
        path: 'san-pham-duyet/:productId',
        element: <AdminProductDetailPage />,
      },
    ],
  },
  {
    path: "/dang-ky",
    element: <SignUpForm />,
  },
  {
    path: "/dang-nhap",
    element: <SignInForm />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
