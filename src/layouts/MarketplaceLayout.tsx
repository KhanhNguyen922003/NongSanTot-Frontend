import { Outlet } from 'react-router-dom';
import { MessengerDock } from '@/components/messaging/MessengerDock';
import { MarketplaceFooter } from '@/components/marketplace/MarketplaceFooter';
import { MarketplaceNavbar } from '@/components/marketplace/MarketplaceNavbar';

const MarketplaceLayout = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <MarketplaceNavbar />
      <Outlet />
      <MarketplaceFooter />
      <MessengerDock />
    </div>
  );
};

export default MarketplaceLayout;
