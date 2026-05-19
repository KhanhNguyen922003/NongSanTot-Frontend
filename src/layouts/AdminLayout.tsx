import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { LayoutDashboard, Loader2, ShoppingBag, ShieldCheck, Store, Users } from 'lucide-react';
import { auth } from '../../firebase.config';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthMeQuery } from '@/queries/Auth/useAuth';
import useAuthStore from '@/stores/auth.store';

const adminLinks = [
	{ to: '/admin', label: 'Thống kê', icon: LayoutDashboard },
	{ to: '/admin/users', label: 'Quản lý người dùng', icon: Users },
	{ to: '/admin/shops', label: 'Quản lý cửa hàng', icon: Store },
	{ to: '/admin/products', label: 'Quản lý sản phẩm', icon: ShoppingBag },
];

const AdminLayout = () => {
	const location = useLocation();
	const [firebaseUser, setFirebaseUser] = useState<User | null | 'pending'>('pending');
	const { data, isLoading, isError, error } = useAuthMeQuery(typeof firebaseUser === 'object' && firebaseUser !== null);
	const cachedUser = useAuthStore((state) => state.user);
	const user = data?.user ?? cachedUser;

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (nextUser) => {
			setFirebaseUser(nextUser);
		});
		return () => unsub();
	}, []);

	if (firebaseUser === 'pending') {
		return (
			<div className="mx-auto w-full max-w-5xl px-4 py-8">
				<Card>
					<CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Đang kiểm tra phiên đăng nhập...
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!firebaseUser) {
		return <Navigate to={`/dang-nhap?next=${encodeURIComponent(location.pathname)}`} replace />;
	}

	if (isLoading && !user) {
		return (
			<div className="mx-auto w-full max-w-5xl px-4 py-8">
				<Card>
					<CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Đang kiểm tra quyền admin...
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError || user?.role !== 'admin') {
		const message = error instanceof Error ? error.message : 'Tài khoản này không có quyền admin.';
		return (
			<div className="mx-auto w-full max-w-3xl px-4 py-8">
				<AuthFormMessage type="error" text={message} />
				<Button asChild variant="outline" className="mt-4">
					<Link to="/">Quay về trang chủ</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f5f5f5]">
			<div className="mx-auto flex min-h-screen max-w-[1600px]">
				<aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-hidden border-r border-slate-200 bg-white shadow-sm lg:flex lg:flex-col">
					<div className="border-b p-5">
						<div className="flex items-center gap-3">
							<div className="rounded-2xl bg-primary/10 p-2 text-primary">
								<ShieldCheck className="h-5 w-5" />
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin Console</p>
								<h1 className="text-lg font-semibold text-[#27272a]">Nông Sản Tốt</h1>
							</div>
						</div>
					</div>

					<nav className="flex-1 space-y-1 p-3">
						{adminLinks.map((link) => {
							const Icon = link.icon;
							const active = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
							return (
								<Button
									key={link.to}
									asChild
									variant={active ? 'default' : 'ghost'}
									className="h-11 w-full justify-start gap-3 rounded-xl px-4"
								>
									<Link to={link.to}>
										<Icon className="h-4 w-4" />
										{link.label}
									</Link>
								</Button>
							);
						})}
					</nav>

					<div className="border-t p-4">
						<div className="rounded-xl bg-slate-50 p-4">
							<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tài khoản</p>
							<p className="mt-2 truncate text-sm font-medium text-[#27272a]">{user.fullName}</p>
							<p className="truncate text-sm text-muted-foreground">{user.phone}</p>
						</div>
					</div>
				</aside>

				<div className="min-w-0 flex-1 space-y-4 px-4 py-4 lg:px-6 lg:py-6">
					<div className="rounded-2xl border bg-white p-4 shadow-card lg:hidden">
						<div className="flex items-center gap-3">
							<div className="rounded-2xl bg-primary/10 p-2 text-primary">
								<ShieldCheck className="h-5 w-5" />
							</div>
							<div>
								<h1 className="text-lg font-semibold text-[#27272a]">Admin Nông Sản Tốt</h1>
								<p className="text-sm text-muted-foreground">{user.fullName} · {user.phone}</p>
							</div>
						</div>
						<div className="mt-4 flex flex-wrap gap-2">
							{adminLinks.map((link) => {
								const Icon = link.icon;
								const active = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
								return (
									<Button key={link.to} asChild variant={active ? 'default' : 'outline'} size="sm">
										<Link to={link.to}>
											<Icon className="mr-2 h-4 w-4" />
											{link.label}
										</Link>
									</Button>
								);
							})}
						</div>
					</div>

					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default AdminLayout;
