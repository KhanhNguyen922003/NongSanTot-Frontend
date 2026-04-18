import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HomeHeroProps = {
  imageUrl: string;
};

export const HomeHero = ({ imageUrl }: HomeHeroProps) => {
  return (
    <section className="relative overflow-hidden rounded-lg border bg-white shadow-card">
      <img src={imageUrl} alt="Banner nông sản" className="h-[320px] w-full object-cover md:h-[388px]" />
      <div className="pointer-events-none absolute inset-x-6 top-1/2 flex -translate-y-1/2 items-center justify-between">
        <Button size="icon" variant="outline" className="pointer-events-auto rounded-full bg-white">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="outline" className="pointer-events-auto rounded-full bg-white">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center justify-center gap-2 py-3">
        <span className="h-0.5 w-4 rounded bg-black/10" />
        <span className="h-0.5 w-6 rounded bg-primary" />
        <span className="h-0.5 w-4 rounded bg-black/10" />
      </div>
    </section>
  );
};
