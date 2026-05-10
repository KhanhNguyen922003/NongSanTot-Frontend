import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sellerHubPaths } from "@/constants/sellerHub";
import { cn } from "@/lib/utils";
import { useShopDashboardQuery } from "@/queries/shops/useShopDashboard";

const navItemClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-primary/10 text-primary"
      : "text-[#27272a] hover:bg-slate-100",
  );

type SellerDashboardSidebarProps = {
  shopName: string;
  onNavigate?: () => void;
};

export const SellerDashboardSidebar = ({
  shopName,
  onNavigate,
}: SellerDashboardSidebarProps) => {
  const { data: dashboard } = useShopDashboardQuery(true);

  const unread = dashboard?.unreadBuyerMessages ?? 0;
  const pending = dashboard?.ordersByStatus?.pending ?? 0;

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <Link
          to={sellerHubPaths.overview}
          onClick={handleClick}
          className="flex items-center gap-2 font-semibold text-[#27272a]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </span>
          <span className="min-w-0 truncate leading-tight">{shopName}</span>
        </Link>
        <p className="mt-2 text-xs text-muted-foreground">Khu vực người bán</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavLink
          to={sellerHubPaths.overview}
          end
          onClick={handleClick}
          className={({ isActive }) => navItemClass(isActive)}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Tổng quan
        </NavLink>
        <NavLink
          to={sellerHubPaths.products}
          onClick={handleClick}
          className={({ isActive }) => navItemClass(isActive)}
        >
          <Package className="h-4 w-4 shrink-0" />
          Quản lý sản phẩm
        </NavLink>
        <NavLink
          to={sellerHubPaths.sellOrders}
          onClick={handleClick}
          className={({ isActive }) => navItemClass(isActive)}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" />
          <span className="flex flex-1 items-center justify-between gap-2">
            Đơn bán
            {pending > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                {pending > 99 ? "99+" : pending}
              </span>
            )}
          </span>
        </NavLink>
        <NavLink
          to={sellerHubPaths.messages}
          onClick={handleClick}
          className={({ isActive }) => navItemClass(isActive)}
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="flex flex-1 items-center justify-between gap-2">
            Tin nhắn khách
            {unread > 0 && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </span>
        </NavLink>
        <NavLink
          to={sellerHubPaths.shopSettings}
          onClick={handleClick}
          className={({ isActive }) => navItemClass(isActive)}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Thông tin cửa hàng
        </NavLink>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <Button variant="outline" className="w-full" size="sm" asChild>
          <Link to="/" onClick={handleClick}>
            Về trang chợ
          </Link>
        </Button>
      </div>
    </div>
  );
};

/** Nút đóng dùng trong drawer mobile */
export const SellerSidebarCloseButton = ({
  onClose,
}: {
  onClose: () => void;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="absolute right-2 top-2 md:hidden"
    onClick={onClose}
    aria-label="Đóng menu"
  >
    <X className="h-5 w-5" />
  </Button>
);
