import { Bell, CircleHelp, Globe, LogIn, Search, ShoppingCart, UserPlus, LogOut, User } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase.config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyCartQuery } from '@/queries/carts/useCarts';
import { useCategoriesQuery } from '@/queries/categories/useCategories';
import { useProductsQuery } from '@/queries/products/useProducts';
import { sellerHubPaths } from '@/constants/sellerHub';
import useAuthStore from '@/stores/auth.store';

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

export function MarketplaceNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuthStore();
  const { data: cartData } = useMyCartQuery(!!user);
  const cartCount = cartData?.items.length ?? 0;
  const isMarketplacePage = location.pathname === '/';
  const initialKeyword = useMemo(
    () => (isMarketplacePage ? searchParams.get('q') || '' : ''),
    [isMarketplacePage, searchParams],
  );
  const [keyword, setKeyword] = useState(initialKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const canRecommend = debouncedKeyword.trim().length >= 2;
  const { data: recommendProducts = [], isLoading: isLoadingRecommend } = useProductsQuery(
    {
      q: debouncedKeyword.trim() || undefined,
    },
    canRecommend,
  );
  const { data: categories = [] } = useCategoriesQuery();

  const recommendedCategories = useMemo(() => {
    const normalized = debouncedKeyword.trim().toLowerCase();
    if (normalized.length < 2) return [];
    return categories
      .filter((item) => item.name.toLowerCase().includes(normalized))
      .slice(0, 4);
  }, [categories, debouncedKeyword]);

  const recommendedProducts = useMemo(
    () => recommendProducts.slice(0, 6),
    [recommendProducts],
  );

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchBoxRef.current) return;
      if (searchBoxRef.current.contains(event.target as Node)) return;
      setIsSearchFocused(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const handleSubmitSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(isMarketplacePage ? searchParams : undefined);
    if (keyword.trim()) {
      next.set('q', keyword.trim());
    } else {
      next.delete('q');
    }
    next.delete('page');

    if (isMarketplacePage) {
      setSearchParams(next);
      setIsSearchFocused(false);
      return;
    }

    navigate({
      pathname: '/',
      search: next.toString(),
    });
    setIsSearchFocused(false);
  };

  const handleSelectRecommendation = (nextSearchParams: URLSearchParams) => {
    navigate({
      pathname: '/',
      search: nextSearchParams.toString(),
    });
    setIsSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="border-b bg-[#f7f7f7] text-xs">
        <div className="container flex h-9 items-center justify-between">
          <div className="flex items-center gap-3 text-[#27272a]">
            <span>Kênh người bán</span>
            <span className="h-3 w-px bg-gray-300" />
            <span>Trở thành người bán Nông Sản Tốt</span>
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
          <p className="text-2xl font-bold leading-none text-primary">Nông Sản <span className="text-secondary">Tốt</span></p>
          <p className="text-xs text-secondary">Nông sản online</p>
        </Link>

        <div ref={searchBoxRef} className="relative flex-1">
          <form
            onSubmit={handleSubmitSearch}
            className="flex h-12 items-center rounded-xl border bg-white px-2"
          >
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
          <Input
            className="border-0 shadow-none focus-visible:ring-0"
            placeholder="Tìm kiếm sản phẩm"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          <Button type="submit" size="icon" variant="secondary" className="h-9 w-10 rounded-md">
            <Search className="h-4 w-4" />
          </Button>
          </form>

          {isSearchFocused && keyword.trim().length >= 2 ? (
            <div className="absolute left-0 right-0 top-[52px] z-40 rounded-lg border bg-white p-2 shadow-lg">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                Gợi ý tìm kiếm
              </p>
              {isLoadingRecommend ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">Đang tìm gợi ý...</p>
              ) : (
                <div className="space-y-1">
                  {recommendedCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => {
                        const next = new URLSearchParams();
                        next.set('categorySlug', category.slug);
                        next.set('q', keyword.trim());
                        handleSelectRecommendation(next);
                      }}
                    >
                      <span>Danh mục: {category.name}</span>
                      <span className="text-xs text-muted-foreground">/{category.slug}</span>
                    </button>
                  ))}
                  {recommendedProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => {
                        const next = new URLSearchParams();
                        next.set('q', product.name);
                        handleSelectRecommendation(next);
                      }}
                    >
                      <span className="truncate pr-2">{product.name}</span>
                      <span className="text-xs text-primary">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                    </button>
                  ))}
                  {!recommendedCategories.length && !recommendedProducts.length ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">
                      Chưa có gợi ý phù hợp.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 hover:bg-transparent">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="h-8 w-8 rounded-full border border-gray-200 object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground border border-primary/20">
                      {getInitials(user.fullName)}
                    </span>
                  )}
                  <span className="hidden text-[#27272a] font-medium sm:inline-block">{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/#"><User className="mr-2 h-4 w-4" />Hồ sơ</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/don-mua">Đơn mua</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={sellerHubPaths.sellOrders}>Đơn bán</Link>
                </DropdownMenuItem>
                <div className="my-1 h-px bg-gray-200" />
                <DropdownMenuItem onClick={() => void handleLogout()} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" className="gap-2">
                <Link to="/dang-ky" className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Đăng ký
                </Link>
              </Button>
              <Button asChild variant="ghost" className="gap-2">
                <Link to="/dang-nhap" className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Link>
              </Button>
            </>
          )}
          <span className="mx-1 h-6 w-px bg-gray-200" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {cartCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0">
              <div className="p-4">
                <p className="mb-3 text-sm font-semibold text-[#27272a]">Giỏ hàng của bạn</p>
                {cartCount === 0 ? (
                  <p className="text-sm text-muted-foreground">Giỏ hàng trống.</p>
                ) : (
                  <div className="space-y-2">
                    {cartData?.items.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 rounded-md border p-2">
                        {item.productCoverImage || item.productImages?.[0] ? (
                          <img
                            src={item.productCoverImage || item.productImages?.[0]}
                            alt={item.productName || 'product'}
                            className="h-11 w-11 rounded object-cover"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded bg-slate-100" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#27272a]">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x {(item.productPrice ?? 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    ))}
                    {cartCount > 5 ? (
                      <Badge variant="outline">và {cartCount - 5} sản phẩm khác</Badge>
                    ) : null}
                  </div>
                )}
                <Button asChild className="mt-4 w-full">
                  <Link to="/gio-hang">Xem giỏ hàng</Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
