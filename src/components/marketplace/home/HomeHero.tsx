import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroSlide1 from '@/assets/homepage/heroSlide.png';
import grid1 from '@/assets/homepage/Grid1_1.png';
import grid2 from '@/assets/homepage/Grid2_3.png';
import grid3 from '@/assets/homepage/Grid3.png';
import grid4 from '@/assets/homepage/Grid4.png';

const heroGridItems = [
  { id: 'grid-1', image: grid1, alt: 'Grocery delivery' },
  { id: 'grid-2', image: grid2, alt: 'Freshness in every sip' },
  { id: 'grid-3', image: grid3, alt: 'Not just meat' },
  { id: 'grid-4', image: grid4, alt: 'Fresh finds' },
];

export const HomeHero = () => {
  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border bg-white shadow-card">
        <img src={heroSlide1} alt="Thực phẩm xanh cùng bạn vun đắp sức khỏe mỗi ngày" className="h-[220px] w-full object-cover md:h-[360px]" />
        <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 items-center justify-between md:inset-x-6">
          <Button size="icon" variant="outline" className="pointer-events-auto h-9 w-9 rounded-full bg-white/90 text-foreground shadow-sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="pointer-events-auto h-9 w-9 rounded-full bg-white/90 text-foreground shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="h-0.5 w-8 rounded bg-primary" />
      </div>

      {/* Trên mobile chỉ giữ banner chính — lưới 4 ô chiếm dọc và ít giá trị khi màn nhỏ */}
      <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">
        {heroGridItems.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-lg border bg-white shadow-card">
            <img src={item.image} alt={item.alt} className="h-full w-full object-cover" />
          </article>
        ))}
      </div>
    </section>
  );
};
