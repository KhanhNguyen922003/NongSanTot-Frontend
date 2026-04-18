import { Outlet } from 'react-router-dom';
import { MarketplaceFooter } from '@/components/marketplace/MarketplaceFooter';
import { MarketplaceNavbar } from '@/components/marketplace/MarketplaceNavbar';

const MarketplaceLayout = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <MarketplaceNavbar />
      <Outlet />
      <MarketplaceFooter />
    </div>
  );
};

export default MarketplaceLayout;
