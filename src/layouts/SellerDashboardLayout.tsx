import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Home, Menu, Store } from "lucide-react";
import { auth } from "../../firebase.config";
import { AuthPageChrome } from "@/components/auth/AuthPageChrome";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import {
  SellerDashboardSidebar,
  SellerSidebarCloseButton,
} from "@/components/seller/SellerDashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sellerHubPaths } from "@/constants/sellerHub";
import { getApiErrorMessage } from "@/core/api/getApiErrorMessage";
import { useMyShopsQuery } from "@/queries/shops/useMyShops";

const SellerDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [firebaseUser, setFirebaseUser] = useState<User | null | "pending">(
    "pending",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const canQueryShops =
    typeof firebaseUser === "object" && firebaseUser !== null;
  const {
    data: shop,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyShopsQuery(canQueryShops);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  if (firebaseUser === "pending") {
    return (
      <AuthPageChrome>
        <Card className="w-full max-w-3xl rounded-lg border bg-white shadow-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Đang kiểm tra phiên đăng nhập...
          </CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  if (firebaseUser === null) {
    return (
      <Navigate
        to={`/dang-nhap?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 py-8">
        <Card className="mx-auto max-w-3xl rounded-lg border bg-white shadow-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Đang tải dữ liệu cửa hàng...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 py-8">
        <Card className="mx-auto max-w-3xl rounded-lg border bg-white shadow-card">
          <CardContent className="space-y-3 py-8">
            <AuthFormMessage type="error" text={getApiErrorMessage(error)} />
            <Button className="w-full" onClick={() => void refetch()}>
              Thử tải lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 py-8">
        <Card className="mx-auto max-w-xl rounded-lg border bg-white shadow-card">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl text-[#27272a]">
              <Store className="h-5 w-5 text-primary" />
              Bạn chưa có cửa hàng
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tạo cửa hàng để vào khu vực quản lý sản phẩm, đơn bán và tin nhắn.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={() => void navigate(sellerHubPaths.shopSettings)}
            >
              Tạo cửa hàng ngay
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Về trang chợ
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden border-r border-slate-200 bg-white shadow-sm md:flex md:flex-col">
          <SellerDashboardSidebar shopName={shop.name} />
        </aside>

        {mobileNavOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              aria-label="Đóng menu"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[min(100vw-3rem,18rem)] md:hidden">
              <div className="relative h-full shadow-lg">
                <SellerSidebarCloseButton
                  onClose={() => setMobileNavOpen(false)}
                />
                <SellerDashboardSidebar
                  shopName={shop.name}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Mở menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#27272a]">
                {shop.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Khu vực người bán
              </p>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 text-xs" asChild>
              <Link to="/">Chợ</Link>
            </Button>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardLayout;
