import { Link, Navigate } from "react-router-dom";
import { Loader2, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sellerHubPaths } from "@/constants/sellerHub";
import { getApiErrorMessage } from "@/core/api/getApiErrorMessage";
import { useMyConversationsQuery } from "@/queries/messaging/useMessaging";
import { useMessengerDockStore } from "@/stores/messengerDock.store";
import useAuthStore from "@/stores/auth.store";

const SellerMessagesPage = () => {
  const isAuthenticated = !!useAuthStore((state) => state.user);
  const q = useMyConversationsQuery(isAuthenticated);
  const openMessengerEntry = useMessengerDockStore((s) => s.openEntry);

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/dang-nhap?next=${encodeURIComponent(sellerHubPaths.messages)}`}
        replace
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#27272a]">Tin nhắn khách hàng</h1>
        <p className="text-sm text-muted-foreground">
          Bấm hội thoại để mở khung chat góc màn hình; dùng &quot;Trang đầy đủ&quot; khi cần giao diện
          rộng.
        </p>
      </div>

      <Card className="rounded-lg border bg-white shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-[#27272a]">
            <MessageCircle className="h-5 w-5 text-primary" />
            Hội thoại
          </CardTitle>
        </CardHeader>
        <CardContent>
          {q.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải...
            </div>
          ) : q.isError ? (
            <p className="text-sm text-red-600">{getApiErrorMessage(q.error, 'Không tải được.')}</p>
          ) : (q.data?.seller ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có khách nhắn tin. Đơn và trả giá sẽ hiện ở đây khi có người mua liên hệ.
            </p>
          ) : (
            <ul className="divide-y">
              {(q.data?.seller ?? []).map((c) => {
                const lastReadLabel = c.lastReadAt
                  ? (() => {
                      try {
                        return new Date(c.lastReadAt).toLocaleString('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        });
                      } catch {
                        return null;
                      }
                    })()
                  : null;
                return (
                <li key={c.id}>
                  <div className="flex items-stretch gap-1 rounded-md px-2 -mx-2 py-2 transition-colors hover:bg-muted/40">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() =>
                        openMessengerEntry({
                          conversationId: c.id,
                          expandHref: `${sellerHubPaths.messages}/${c.id}`,
                          title: c.buyerHint || 'Khách',
                          subtitle: c.productName ?? 'Sản phẩm',
                        })
                      }
                    >
                      <p className="flex flex-wrap items-center gap-2 font-medium text-[#27272a]">
                        <span>
                          {c.buyerHint || 'Khách'} · {c.productName ?? 'Sản phẩm'}
                        </span>
                        {(c.unreadCount ?? 0) > 0 ? (
                          <Badge className="bg-red-500 text-[10px] text-white hover:bg-red-500">
                            {(c.unreadCount ?? 0) > 99 ? '99+' : c.unreadCount}
                          </Badge>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.lastMessage || '…'}
                      </p>
                      {lastReadLabel ? (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Bạn đã xem đến: {lastReadLabel}
                        </p>
                      ) : null}
                    </button>
                    <Link
                      className="shrink-0 self-center rounded border px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5"
                      to={`${sellerHubPaths.messages}/${c.id}`}
                    >
                      Trang đầy đủ
                    </Link>
                  </div>
                </li>
              );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerMessagesPage;
