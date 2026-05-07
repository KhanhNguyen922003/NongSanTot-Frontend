import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock3,
  Home,
  ImageIcon,
  MapPin,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import { auth } from "../../../firebase.config";
import { AuthPageChrome } from "@/components/auth/AuthPageChrome";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/core/api/getApiErrorMessage";
import { useDeactivateMyShopMutation } from "@/queries/shops/useDeactivateShop";
import { useMyShopsQuery } from "@/queries/shops/useMyShops";
import { useUpdateMyShopMutation } from "@/queries/shops/useUpdateShop";

const SIGNIN_PATH = "/dang-nhap";
const SELLER_REGISTER_PATH = "/dang-ky-ban-hang";

const formatDate = (value: string | null) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState<User | null | "pending">(
    "pending",
  );

  const canQueryShops =
    typeof firebaseUser === "object" && firebaseUser !== null;
  const {
    data: myShops,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMyShopsQuery(canQueryShops);
  const deactivateShop = useDeactivateMyShopMutation();
  const updateShop = useUpdateMyShopMutation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        navigate(`${SIGNIN_PATH}?next=${encodeURIComponent("/thong-ke-cua-hang")}`, {
          replace: true,
        });
      }
    });

    return () => unsub();
  }, [navigate]);

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
      <AuthPageChrome>
        <Card className="w-full max-w-3xl rounded-lg border bg-white shadow-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Đang chuyển đến trang đăng nhập...
          </CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card className="rounded-lg border bg-white shadow-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Đang tải dữ liệu cửa hàng...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Card className="rounded-lg border bg-white shadow-card">
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

  const shop = myShops;
  if (!shop) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Card className="rounded-lg border bg-white shadow-card">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl text-[#27272a]">
              <Store className="h-5 w-5 text-primary" />
              Bạn chưa có cửa hàng
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tạo cửa hàng để bắt đầu bán hàng, quản lý sản phẩm và theo dõi đơn.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => void navigate(SELLER_REGISTER_PATH)}>
              Tạo cửa hàng ngay
            </Button>
            <Button variant="outline" className="w-full" onClick={() => void navigate("/")}>
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isInactive = shop.isActive === false;
  const actionDisabled = deactivateShop.isPending || updateShop.isPending;

  const handleToggleShopStatus = async () => {
    try {
      if (isInactive) {
        await updateShop.mutateAsync({ isActive: true });
        return;
      }

      const confirmed = window.confirm(
        "Tạm đóng cửa hàng? Shop sẽ ngừng hiển thị với người mua.",
      );
      if (!confirmed) return;
      await deactivateShop.mutateAsync();
    } catch {
      // Error is handled by mutation state and top-level fallback UX.
    }
  };

  const ratingText =
    typeof shop.rating === "number" ? shop.rating.toFixed(1) : "Chưa có";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#27272a]">Tổng quan cửa hàng</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi trạng thái shop và thao tác nhanh các tác vụ quản trị.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void refetch()}
          disabled={isFetching || actionDisabled}
        >
          {isFetching ? "Đang làm mới..." : "Làm mới dữ liệu"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-lg border bg-white shadow-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-3 text-xl text-[#27272a]">
              <span className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                {shop.name}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isInactive
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isInactive ? "Tạm ngưng" : "Đang hoạt động"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={`Logo ${shop.name}`}
                  className="h-24 w-24 rounded-lg border object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-slate-50 text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-2 text-sm">
                <p className="text-muted-foreground">
                  {shop.description || "Chưa có mô tả cửa hàng."}
                </p>
                <p className="flex items-center gap-2 text-[#27272a]">
                  <MapPin className="h-4 w-4 text-primary" />
                  {shop.displayAddress || "Chưa cập nhật địa chỉ hiển thị"}
                </p>
                <p className="flex items-center gap-2 text-[#27272a]">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Cập nhật gần nhất: {formatDate(shop.updatedAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={isInactive ? "default" : "outline"}
                onClick={() => void handleToggleShopStatus()}
                disabled={actionDisabled}
              >
                {actionDisabled
                  ? "Đang xử lý..."
                  : isInactive
                    ? "Mở lại cửa hàng"
                    : "Tạm đóng cửa hàng"}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dang-ky-ban-hang">Đi tới màn hình thông tin shop</Link>
              </Button>
              <Button asChild>
                <Link to="/dang-tin-san-pham">Đăng sản phẩm mới</Link>
              </Button>
            </div>

            {(deactivateShop.isError || updateShop.isError) && (
              <AuthFormMessage
                type="error"
                text={getApiErrorMessage(
                  deactivateShop.error ?? updateShop.error,
                  "Không thể cập nhật trạng thái cửa hàng.",
                )}
              />
            )}

            {isInactive && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Cửa hàng đang tạm ngưng hiển thị với người mua. Bạn có thể mở
                  lại bất cứ lúc nào.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-white shadow-card">
          <CardHeader>
            <CardTitle className="text-lg text-[#27272a]">Sức khỏe shop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-muted-foreground">Đánh giá trung bình</span>
              <span className="flex items-center gap-1 font-semibold text-[#27272a]">
                <Star className="h-4 w-4 text-amber-500" />
                {ratingText}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-muted-foreground">Logo cửa hàng</span>
              <span className="font-semibold text-[#27272a]">
                {shop.logo ? "Đã cập nhật" : "Chưa có"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-muted-foreground">Địa chỉ hiển thị</span>
              <span className="font-semibold text-[#27272a]">
                {shop.displayAddress ? "Đã cập nhật" : "Chưa có"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-muted-foreground">Trạng thái duyệt</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Sẵn sàng bán
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerDashboard;
