import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sellerHubPaths } from "@/constants/sellerHub";

/**
 * Hội thoại với khách — nền tảng cho chat và (dự kiến) trả giá trong thread.
 */
const SellerMessagesPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#27272a]">Tin nhắn khách hàng</h1>
        <p className="text-sm text-muted-foreground">
          Trò chuyện với người mua; sau này có thể gắn đề nghị giá (trả giá) ngay trong
          cuộc hội thoại.
        </p>
      </div>

      <Card className="rounded-lg border bg-white shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-[#27272a]">
            <MessageCircle className="h-5 w-5 text-primary" />
            Hội thoại
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Backend đã có model cuộc hội thoại và tin nhắn. Khi bạn triển khai API gửi/nhận
            tin, danh sách hội thoại và khung soạn tin sẽ đặt tại đây.
          </p>
          <p>
            Tính năng <strong className="text-[#27272a]">trả giá</strong> có thể thiết kế
            như tin nhắn có kiểu đặc biệt (ví dụ đề nghị giá + sản phẩm) hoặc kèm nút
            chấp nhận / từ chối — không cần tách app mới.
          </p>
          <p>
            Số tin chưa đọc từ khách hiển thị trên{" "}
            <Link className="font-medium text-primary hover:underline" to={sellerHubPaths.overview}>
              Tổng quan
            </Link>{" "}
            và trên sidebar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerMessagesPage;
