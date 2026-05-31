import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type AuthPageChromeProps = {
  children: ReactNode;
};

export function AuthPageChrome({ children }: AuthPageChromeProps) {
  return (
    <div className="relative min-h-screen bg-[#f6f2e9]">
      <div className="absolute inset-0 bg-[url('/assets/login-background.avif')] bg-cover bg-center opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-[#fdfbf7]/90 to-[#f0ebe0]/95" />

      <div className="relative">
        <header className="border-b border-primary/10 bg-white">
          <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2 text-primary transition hover:opacity-80">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                N
              </span>
              <span className="text-lg font-semibold tracking-tight text-[#27272a]">
                Nông Sản <span className="text-secondary">Tốt</span>
              </span>
            </Link>
            <Button asChild variant="ghost" size="sm" className="text-[#27272a]">
              <Link to="/">Về trang chủ</Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 sm:px-6 lg:py-12">
          <div className="mx-auto w-full max-w-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
