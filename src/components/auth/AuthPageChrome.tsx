import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type AuthPageChromeProps = {
  children: ReactNode;
};

export function AuthPageChrome({ children }: AuthPageChromeProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f6f2e9] via-[#fdfbf7] to-[#f0ebe0]">
      <header className="border-b border-primary/10 bg-white/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-primary transition hover:opacity-80">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              N
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

      <main className="container flex justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </main>
    </div>
  );
}
