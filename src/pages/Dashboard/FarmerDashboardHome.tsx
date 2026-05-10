import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Banknote,
  Clock3,
  ImageIcon,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sellerHubPaths } from "@/constants/sellerHub";
import { getApiErrorMessage } from "@/core/api/getApiErrorMessage";
import { useDeactivateMyShopMutation } from "@/queries/shops/useDeactivateShop";
import { useMyShopsQuery } from "@/queries/shops/useMyShops";
import { useShopDashboardQuery } from "@/queries/shops/useShopDashboard";
import type { ShopDashboardOverview } from "@/queries/shops/types";
import { useUpdateMyShopMutation } from "@/queries/shops/useUpdateShop";

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

const formatVnd = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")}đ`;

const ORDER_STATUS_META: {
  key: keyof ShopDashboardOverview["ordersByStatus"];
  label: string;
}[] = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

const PRODUCT_STATUS_META: {
  key: keyof ShopDashboardOverview["productsByStatus"];
  label: string;
}[] = [
  { key: "active", label: "Đang bán" },
  { key: "pending_review", label: "Chờ duyệt" },
  { key: "draft", label: "Nháp" },
  { key: "rejected", label: "Bị từ chối" },
  { key: "archived", label: "Lưu trữ" },
];

/**
 * Trang tổng quan trong khu seller (đặt trong `SellerDashboardLayout`).
 */
const FarmerDashboardHome = () => {
  const {
    data: myShops,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useMyShopsQuery(true);
  const hasShop = Boolean(myShops);
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
    isFetching: isDashboardFetching,
  } = useShopDashboardQuery(hasShop);

  const deactivateShop = useDeactivateMyShopMutation();
  const updateShop = useUpdateMyShopMutation();

  if (isLoading || !myShops) {
    return (
      <Card className="rounded-lg border bg-white shadow-card">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Đang tải dữ liệu cửa hàng...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-lg border bg-white shadow-card">
        <CardContent className="space-y-3 py-8">
          <AuthFormMessage type="error" text={getApiErrorMessage(error)} />
          <Button className="w-full" onClick={() => void refetch()}>
            Thử tải lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  const shop = myShops;
  const isInactive = shop.isActive === false;
  const actionDisabled = deactivateShop.isPending || updateShop.isPending;
  const refreshing = isFetching || isDashboardFetching || actionDisabled;

  const handleRefreshAll = () => {
    void refetch();
    void refetchDashboard();
  };

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

  const o = dashboard?.ordersByStatus;
  const p = dashboard?.productsByStatus;
  const pendingOrders = o?.pending ?? 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#27272a]">Tổng quan cửa hàng</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi đơn hàng, sản phẩm, đánh giá và tin nhắn — thao tác nhanh các việc
            cần làm.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void handleRefreshAll()}
          disabled={refreshing}
        >
          {refreshing ? "Đang làm mới..." : "Làm mới dữ liệu"}
        </Button>
      </div>

      {isDashboardError && (
        <div className="mb-4">
          <AuthFormMessage
            type="error"
            text={getApiErrorMessage(
              dashboardError,
              "Không tải được bảng số liệu. Bạn vẫn xem được thông tin shop.",
            )}
          />
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="rounded-lg border bg-white shadow-card">
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Cần xác nhận</p>
              <p className="text-2xl font-bold text-[#27272a]">
                {dashboardLoading ? "…" : pendingOrders}
              </p>
              <Link
                to={sellerHubPaths.sellOrders}
                className="text-xs font-medium text-primary hover:underline"
              >
                Xem đơn bán →
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border bg-white shadow-card">
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Tin chưa đọc</p>
              <p className="text-2xl font-bold text-[#27272a]">
                {dashboardLoading ? "…" : (dashboard?.unreadBuyerMessages ?? 0)}
              </p>
              <Link
                to={sellerHubPaths.messages}
                className="text-xs font-medium text-primary hover:underline"
              >
                Vào tin nhắn →
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border bg-white shadow-card">
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <Star className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Đánh giá mới (7 ngày)
              </p>
              <p className="text-2xl font-bold text-[#27272a]">
                {dashboardLoading ? "…" : (dashboard?.newReviewsLast7Days ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">Theo sản phẩm của shop</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border bg-white shadow-card">
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Banknote className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Doanh thu ước tính (30 ngày)
              </p>
              <p className="truncate text-xl font-bold text-[#27272a]">
                {dashboardLoading
                  ? "…"
                  : formatVnd(dashboard?.revenueDeliveredLast30Days ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">Đơn trạng thái đã giao</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-lg border bg-white shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-[#27272a]">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Đơn hàng theo trạng thái
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                Tổng: {dashboardLoading ? "…" : (dashboard?.ordersTotal ?? 0)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {ORDER_STATUS_META.map(({ key, label }) => (
                  <li
                    key={key}
                    className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold tabular-nums text-[#27272a]">
                      {o?.[key] ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to={sellerHubPaths.sellOrders}>Quản lý đơn bán</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-white shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-[#27272a]">
              <Package className="h-4 w-4 text-primary" />
              Sản phẩm trên shop
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                Tổng: {dashboardLoading ? "…" : (dashboard?.productsTotal ?? 0)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {PRODUCT_STATUS_META.map(({ key, label }) => (
                  <li
                    key={key}
                    className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold tabular-nums text-[#27272a]">
                      {p?.[key] ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {!dashboardLoading &&
              (dashboard?.productsLowStockCount ?? 0) > 0 && (
                <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Có <strong>{dashboard?.productsLowStockCount}</strong> sản phẩm đang
                    hoạt động với tồn kho ≤ {dashboard?.lowStockThreshold ?? 10}.
                  </span>
                </div>
              )}
            <Button className="w-full" asChild>
              <Link to={sellerHubPaths.products}>Quản lý sản phẩm</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to={sellerHubPaths.newProduct}>Đăng sản phẩm mới</Link>
            </Button>
          </CardContent>
        </Card>
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
                <Link to={sellerHubPaths.shopSettings}>Thông tin & địa chỉ shop</Link>
              </Button>
              <Button asChild>
                <Link to={sellerHubPaths.newProduct}>Đăng sản phẩm mới</Link>
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
                  Cửa hàng đang tạm ngưng hiển thị với người mua. Bạn có thể mở lại bất
                  cứ lúc nào.
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

export default FarmerDashboardHome;
