import type { ReactNode } from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type AuthPageChromeProps = {
  children: ReactNode;
};

export function AuthPageChrome({ children }: AuthPageChromeProps) {
  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-white">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Nông Sản <span className="text-secondary">Tốt</span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="text-[#27272a]">
            <Link to="/">Về trang chủ</Link>
          </Button>
        </div>
      </header>

      <main className="container flex justify-center px-4 py-10">{children}</main>
    </div>
  );
}
