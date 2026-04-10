const customerLinks = ['Câu hỏi thường gặp', 'Trung tâm hỗ trợ', 'Hướng dẫn đặt hàng', 'Hướng dẫn bán hàng', 'Liên hệ Xanh Hi'];
const aboutLinks = ['Giới thiệu', 'Tuyển dụng', 'Chính sách bảo mật', 'Điều kiện vận chuyển', 'Chính sách đổi trả'];

export function MarketplaceFooter() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 border-b pb-6 md:grid-cols-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase">Dịch vụ khách hàng</h4>
            <ul className="space-y-2 text-sm text-[#27272a]">
              {customerLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase">Về Xanh Hi</h4>
            <ul className="space-y-2 text-sm text-[#27272a]">
              {aboutLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase">Thanh toán</h4>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="h-8 rounded border bg-gray-50" />
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase">Tải ứng dụng</h4>
            <div className="flex gap-3">
              <div className="h-20 w-20 rounded border bg-gray-100" />
              <div className="space-y-2">
                <div className="h-9 w-28 rounded bg-black" />
                <div className="h-9 w-28 rounded bg-black" />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4 text-xs text-[#27272a]">
          <p className="mb-2 font-semibold uppercase">Xanh Hi - Chợ nông sản online</p>
          <p>Từ nông trại đến bàn ăn, Xanh Hi mang nông sản tươi sạch và đặc sản vùng miền tới người dùng với trải nghiệm mua sắm nhanh và minh bạch.</p>
        </div>
      </div>
    </footer>
  );
}
