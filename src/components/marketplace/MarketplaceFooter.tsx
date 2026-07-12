import { Mail, MapPin, Phone, ArrowRight, FileVideoCamera } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const customerLinks = [
  { label: 'Câu hỏi thường gặp', href: '#' },
  { label: 'Trung tâm hỗ trợ', href: '#' },
  { label: 'Hướng dẫn đặt hàng', href: '#' },
  { label: 'Hướng dẫn bán hàng', href: '#' },
  { label: 'Liên hệ Nông Sản Tốt', href: '#' },
];

const aboutLinks = [
  { label: 'Giới thiệu', href: '#' },
  { label: 'Tuyển dụng', href: '#' },
  { label: 'Chính sách bảo mật', href: '#' },
  { label: 'Điều kiện vận chuyển', href: '#' },
  { label: 'Chính sách đổi trả', href: '#' },
];

const paymentMethods = [
  'Thẻ tín dụng',
  'Thẻ ghi nợ',
  'Ví điện tử',
  'Thanh toán khi nhận hàng',
  'Chuyển khoản ngân hàng',
];

const socialLinks = [
  { icon: FileVideoCamera, href: '#', label: 'Facebook' },
  { icon: FileVideoCamera, href: '#', label: 'Instagram' },
  { icon: FileVideoCamera, href: '#', label: 'LinkedIn' },
];

export function MarketplaceFooter() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setSubscribeStatus('loading');
    // Simulate subscription
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <footer className="mt-12 bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Newsletter Section */}
      <div className="border-b bg-white">
        <div className="container py-8 md:py-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="text-xl font-bold text-[#27272a]">Nhận thông tin khuyến mãi</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Đăng ký nhận email để cập nhật sản phẩm mới và ưu đãi độc quyền
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribeStatus === 'loading'}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={subscribeStatus === 'loading' || !email.trim()}
                className="px-6"
              >
                {subscribeStatus === 'success' ? '✓' : <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>
          {subscribeStatus === 'success' && (
            <p className="mt-3 text-sm text-green-600">Cảm ơn bạn đã đăng ký!</p>
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-5 md:gap-6">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <p className="text-lg font-bold leading-none text-primary">
                Nông Sản <span className="text-secondary">Tốt</span>
              </p>
              <p className="text-xs text-muted-foreground">Nông sản online</p>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-[#27272a]">
              Từ nông trại đến bàn ăn, mang nông sản tươi sạch và đặc sản vùng miền.
            </p>
            <div className="space-y-2 text-xs text-[#27272a]">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Tổng đài hỗ trợ</p>
                  <p className="text-muted-foreground">1900 1234 (miễn phí)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">support@nongsantot.vn</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Địa chỉ</p>
                  <p className="text-muted-foreground">Hà Nội, Việt Nam</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Service Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-[#27272a]">Dịch vụ khách hàng</h4>
            <ul className="space-y-2.5">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary hover:font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-[#27272a]">Về chúng tôi</h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary hover:font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-[#27272a]">Thanh toán</h4>
            <ul className="space-y-2">
              {paymentMethods.map((method) => (
                <li key={method} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary/40" />
                  {method}
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-[#27272a]">Kết nối với chúng tôi</h4>
            <div className="flex gap-3 mb-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-muted-foreground transition-all hover:bg-primary hover:text-white hover:border-primary"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#27272a]">Tải ứng dụng</p>
              <div className="flex flex-col gap-2">
                <button className="flex h-10 items-center gap-2 rounded border border-gray-300 bg-white px-3 hover:border-gray-400 transition-colors">
                  <span className="text-xs font-semibold">App Store</span>
                </button>
                <button className="flex h-10 items-center gap-2 rounded border border-gray-300 bg-white px-3 hover:border-gray-400 transition-colors">
                  <span className="text-xs font-semibold">Google Play</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t bg-white">
        <div className="container py-6">
          <div className="grid gap-4 md:grid-cols-2 md:items-center md:justify-between">
            <p className="text-xs text-muted-foreground">
              © 2026 Nông Sản Tốt. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Điều khoản dịch vụ
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Trung tâm bảo mật
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
