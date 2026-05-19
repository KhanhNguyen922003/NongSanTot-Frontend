import { Loader2, LogIn, MessageCircle, Search, ShoppingCart, UserPlus, LogOut, User } from 'lucide-react';
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
import { useMyConversationsQuery } from '@/queries/messaging/useMessaging';
import { useCategoriesQuery } from '@/queries/categories/useCategories';
import { useProductsQuery } from '@/queries/products/useProducts';
import { sellerHubPaths } from '@/constants/sellerHub';
import useAuthStore from '@/stores/auth.store';
import { useMessengerDockStore } from '@/stores/messengerDock.store';

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
  const convQuery = useMyConversationsQuery(!!user);
  const openMessengerEntry = useMessengerDockStore((s) => s.openEntry);

  const messengerPreviewRows = useMemo(() => {
    const buyer = (convQuery.data?.buyer ?? []).map((c) => ({
      id: c.id,
      title: c.shopName ?? 'Shop',
      subtitle: c.productName ?? 'Sản phẩm',
      last: c.lastMessage,
      updatedAt: c.updatedAt,
      unread: c.unreadCount ?? 0,
      expandHref: `/tro-chuyen/${c.id}`,
      tag: 'Mua' as const,
    }));
    const seller = (convQuery.data?.seller ?? []).map((c) => ({
      id: c.id,
      title: c.buyerHint ?? 'Khách',
      subtitle: c.productName ?? 'Sản phẩm',
      last: c.lastMessage,
      updatedAt: c.updatedAt,
      unread: c.unreadCount ?? 0,
      expandHref: `${sellerHubPaths.messages}/${c.id}`,
      tag: 'Bán' as const,
    }));
    return [...buyer, ...seller]
      .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))
      .slice(0, 12);
  }, [convQuery.data?.buyer, convQuery.data?.seller]);

  const messengerUnreadTotal = useMemo(() => {
    const b = convQuery.data?.buyer ?? [];
    const s = convQuery.data?.seller ?? [];
    return [...b, ...s].reduce((acc, c) => acc + (c.unreadCount ?? 0), 0);
  }, [convQuery.data?.buyer, convQuery.data?.seller]);
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
    <header className="sticky top-0 z-40 border-b bg-white pt-[env(safe-area-inset-top)]">
      <div className="hidden border-b bg-[#f7f7f7] text-xs md:block">
      </div>

      <div className="container flex flex-wrap items-center gap-x-4 gap-y-3 py-3 md:h-20 md:flex-nowrap md:items-center md:gap-6 md:py-0">
        <Link to="/" className="order-1 min-w-0 shrink-0 md:min-w-[140px]">
          <p className="text-xl font-bold leading-none text-primary md:text-2xl">
            Nông Sản <span className="text-secondary">Tốt</span>
          </p>
          <p className="text-[10px] text-secondary md:text-xs">Nông sản online</p>
        </Link>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-1 text-sm md:order-3 md:ml-0 md:gap-2">
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
                {user.role === 'seller' ? (
                  <DropdownMenuItem asChild>
                    <Link to={sellerHubPaths.sellOrders}>Đơn bán</Link>
                  </DropdownMenuItem>
                ) : null}
                <div className="my-1 h-px bg-gray-200" />
                <DropdownMenuItem onClick={() => void handleLogout()} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-1 px-2 sm:gap-2 sm:px-3">
                <Link to="/dang-ky" className="inline-flex items-center gap-1 sm:gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Đăng ký</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="gap-1 px-2 sm:gap-2 sm:px-3">
                <Link to="/dang-nhap" className="inline-flex items-center gap-1 sm:gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
              </Button>
            </>
          )}
          <span className="mx-0.5 hidden h-6 w-px bg-gray-200 sm:block" />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="relative text-primary" aria-label="Tin nhắn">
                  <MessageCircle className="h-5 w-5" />
                  {messengerUnreadTotal > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {messengerUnreadTotal > 99 ? '99+' : messengerUnreadTotal}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(100vw-2rem,22rem)] p-0">
                <div className="border-b px-3 py-2">
                  <p className="text-sm font-semibold text-[#27272a]">Tin nhắn</p>
                  <p className="text-xs text-muted-foreground">Chọn hội thoại</p>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {convQuery.isLoading ? (
                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải…
                    </div>
                  ) : convQuery.isError ? (
                    <p className="px-3 py-3 text-sm text-red-600">Không tải được danh sách.</p>
                  ) : messengerPreviewRows.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      Chưa có hội thoại. Mở từ sản phẩm → &quot;Nhắn tin shop&quot;.
                    </p>
                  ) : (
                    messengerPreviewRows.map((row) => (
                      <DropdownMenuItem
                        key={`${row.tag}-${row.id}`}
                        className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
                        onSelect={() => {
                          openMessengerEntry({
                            conversationId: row.id,
                            expandHref: row.expandHref,
                            title: row.title,
                            subtitle: `${row.tag === 'Mua' ? 'Mua · ' : 'Bán · '}${row.subtitle}`,
                          });
                        }}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="truncate font-medium text-[#27272a]">{row.title}</span>
                          <span className="flex shrink-0 items-center gap-1">
                            {row.unread > 0 ? (
                              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                {row.unread > 99 ? '99+' : row.unread}
                              </span>
                            ) : null}
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {row.tag}
                            </span>
                          </span>
                        </span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">{row.last || '…'}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <div className="border-t p-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={sellerHubPaths.messages}>Tin nhắn · khu bán</Link>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative" aria-label="Giỏ hàng">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {cartCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(100vw-2rem,24rem)] p-0 sm:w-96">
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

        <div ref={searchBoxRef} className="relative order-3 w-full min-w-0 md:order-2 md:flex-1">
          <form
            onSubmit={handleSubmitSearch}
            className="flex min-h-11 flex-col gap-2 rounded-xl border bg-white p-2 sm:h-12 sm:flex-row sm:items-center sm:gap-0 sm:px-2 sm:py-0"
          >
          <div className="hidden shrink-0 items-center sm:flex">
            <Select defaultValue="goods">
              <SelectTrigger className="h-9 w-[130px] border-0 shadow-none focus:ring-0 md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goods">Hàng hóa</SelectItem>
                <SelectItem value="shops">Cửa hàng</SelectItem>
              </SelectContent>
            </Select>
            <span className="mx-2 hidden h-6 w-px bg-gray-200 sm:block" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
          <Input
            className="min-w-0 flex-1 border-0 shadow-none focus-visible:ring-0"
            placeholder="Tìm kiếm sản phẩm"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          <Button type="submit" size="icon" variant="secondary" className="h-9 w-10 shrink-0 rounded-md">
            <Search className="h-4 w-4" />
          </Button>
          </div>
          </form>

          {isSearchFocused && keyword.trim().length >= 2 ? (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[min(70vh,24rem)] overflow-y-auto rounded-lg border bg-white p-2 shadow-lg sm:top-[52px] sm:mt-0">
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
      </div>

      <div className="border-y bg-[#f8faf8]">
        <div className="container flex items-center gap-3 overflow-x-auto py-2 text-xs [-ms-overflow-style:none] [scrollbar-width:none] md:h-11 md:py-0 [&::-webkit-scrollbar]:hidden">
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
