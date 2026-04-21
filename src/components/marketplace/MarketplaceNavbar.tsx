import { Bell, CircleHelp, Globe, LogIn, Search, ShoppingCart, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MarketplaceNavbar() {
  return (
    <header className="border-b bg-white">
      <div className="border-b bg-[#f7f7f7] text-xs">
        <div className="container flex h-9 items-center justify-between">
          <div className="flex items-center gap-3 text-[#27272a]">
            <span>Kênh người bán</span>
            <span className="h-3 w-px bg-gray-300" />
            <span>Trở thành người bán Xanh Hi</span>
            <span className="h-3 w-px bg-gray-300" />
            <span>Tải ứng dụng</span>
          </div>

          <div className="flex items-center gap-4 text-[#27272a]">
            <span className="inline-flex items-center gap-1"><Bell className="h-3.5 w-3.5" />Thông báo</span>
            <span className="inline-flex items-center gap-1"><CircleHelp className="h-3.5 w-3.5" />Hỗ trợ</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  Ngôn ngữ
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Tiếng Việt</DropdownMenuItem>
                <DropdownMenuItem>English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="container flex h-20 items-center justify-between gap-6">
        <Link to="/" className="min-w-[160px]">
          <p className="text-3xl font-bold leading-none text-primary">Xanh <span className="text-secondary">Hi</span></p>
          <p className="text-xs text-secondary">Nông sản online</p>
        </Link>

        <div className="flex h-12 flex-1 items-center rounded-xl border bg-white px-2">
          <Select defaultValue="goods">
            <SelectTrigger className="w-[150px] border-0 shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goods">Hàng hóa</SelectItem>
              <SelectItem value="shops">Cửa hàng</SelectItem>
            </SelectContent>
          </Select>
          <span className="mx-2 h-6 w-px bg-gray-200" />
          <Input className="border-0 shadow-none focus-visible:ring-0" placeholder="Tìm kiếm sản phẩm" />
          <Button size="icon" variant="secondary" className="h-9 w-10 rounded-md">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/signup" className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Đăng ký
            </Link>
          </Button>
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/signin" className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Link>
          </Button>
          <span className="mx-1 h-6 w-px bg-gray-200" />
          <Button size="icon" variant="ghost"><ShoppingCart className="h-5 w-5 text-primary" /></Button>
        </div>
      </div>

      <div className="border-y bg-[#f8faf8]">
        <div className="container flex h-11 items-center gap-4 text-xs">
          <span className="font-semibold text-primary">Cam kết</span>
          <span>100% hàng chất lượng</span>
          <span className="h-4 w-px bg-gray-300" />
          <span>Ship mọi đơn hàng</span>
          <span className="h-4 w-px bg-gray-300" />
          <span>Hoàn 200% nếu hàng kém</span>
          <span className="h-4 w-px bg-gray-300" />
          <span>Giao hàng nhanh</span>
        </div>
      </div>
    </header>
  );
}
