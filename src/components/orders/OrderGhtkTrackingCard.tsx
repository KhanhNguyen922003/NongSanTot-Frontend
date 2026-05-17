import { Loader2, RefreshCw, Truck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { queryKeys } from '@/constants/queryKeys';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import { queryClient } from '@/queries';
import { useOrderGhtkTrackingQuery } from '@/queries/orders/useOrders';

type Props = {
  orderId: string;
  shippingCode: string | null | undefined;
};

export function OrderGhtkTrackingCard({ orderId, shippingCode }: Props) {
  const code = shippingCode?.trim() ?? '';
  const q = useOrderGhtkTrackingQuery(orderId, { enabled: !!code });
  const lastSyncedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!q.isSuccess || !q.data || q.data.isMock) return;
    const t = q.dataUpdatedAt;
    if (lastSyncedAt.current === t) return;
    lastSyncedAt.current = t;
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.myBuyPrefix });
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
  }, [q.isSuccess, q.data, q.dataUpdatedAt, orderId]);

  if (!code) return null;

  return (
    <Card className="border-emerald-100 bg-emerald-50/30">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#27272a]">
          <Truck className="h-4 w-4 shrink-0 text-primary" />
          Theo dõi GHTK
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1"
          disabled={q.isFetching}
          onClick={() => void q.refetch()}
        >
          {q.isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Làm mới
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Mã tra cứu: <span className="font-mono font-medium text-foreground">{code}</span>
        </p>

        {q.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải trạng thái vận đơn…
          </div>
        ) : q.isError ? (
          <p className="text-sm text-red-600">{getApiErrorMessage(q.error, 'Không lấy được trạng thái GHTK.')}</p>
        ) : q.data ? (
          <div className="space-y-2 rounded-md border bg-white/80 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {q.data.isMock ? (
                <Badge variant="outline" className="text-amber-800">
                  Mô phỏng
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-primary/15 text-primary">
                  GHTK
                </Badge>
              )}
              {q.data.order.statusText ? (
                <span className="font-medium text-[#27272a]">{q.data.order.statusText}</span>
              ) : null}
            </div>
            {q.data.message ? <p className="text-xs text-muted-foreground">{q.data.message}</p> : null}
            <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
              {q.data.order.labelId ? (
                <>
                  <dt className="text-muted-foreground">Mã vận đơn</dt>
                  <dd className="font-mono">{q.data.order.labelId}</dd>
                </>
              ) : null}
              {q.data.order.partnerId ? (
                <>
                  <dt className="text-muted-foreground">Mã đối tác</dt>
                  <dd className="font-mono">{q.data.order.partnerId}</dd>
                </>
              ) : null}
              {q.data.order.pickDate ? (
                <>
                  <dt className="text-muted-foreground">Dự kiến lấy</dt>
                  <dd>{q.data.order.pickDate}</dd>
                </>
              ) : null}
              {q.data.order.deliverDate ? (
                <>
                  <dt className="text-muted-foreground">Dự kiến giao</dt>
                  <dd>{q.data.order.deliverDate}</dd>
                </>
              ) : null}
              {q.data.order.shipMoney != null && q.data.order.shipMoney !== '' ? (
                <>
                  <dt className="text-muted-foreground">Phí ship (GHTK)</dt>
                  <dd>{Number(q.data.order.shipMoney).toLocaleString('vi-VN')}đ</dd>
                </>
              ) : null}
              {q.data.order.message ? (
                <>
                  <dt className="col-span-full text-muted-foreground">Ghi chú</dt>
                  <dd className="col-span-full text-[#27272a]">{q.data.order.message}</dd>
                </>
              ) : null}
            </dl>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
