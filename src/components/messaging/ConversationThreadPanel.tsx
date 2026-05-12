import { Loader2, ArrowLeft, Tag, Minus, X, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../../firebase.config';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/core/api/getApiErrorMessage';
import {
  useAcceptNegotiationOfferMutation,
  useConversationActivitySubscription,
  useConversationDetailQuery,
  useConversationMessagesQuery,
  useCreateNegotiationOfferMutation,
  useCreateOrderFromOfferMutation,
  useDeclineNegotiationOfferMutation,
  useMarkConversationReadMutation,
  useSendChatMessageMutation,
} from '@/queries/messaging/useMessaging';
import type { ChatMessage, NegotiationOffer } from '@/queries/messaging/types';
import useAuthStore from '@/stores/auth.store';

const offerStatusLabel = (o: NegotiationOffer, viewer: 'buyer' | 'seller'): string => {
  if (o.status === 'accepted') return 'Đã chốt giá';
  if (o.status === 'declined') return 'Đã từ chối';
  if (o.status === 'superseded') return 'Đã có đề xuất mới';
  if (o.awaitingParty === 'buyer') {
    return viewer === 'buyer' ? 'Đang chờ bạn' : 'Đang chờ khách phản hồi';
  }
  if (o.awaitingParty === 'seller') {
    return viewer === 'seller' ? 'Đang chờ bạn' : 'Đang chờ shop phản hồi';
  }
  return 'Đang trao đổi';
};

const OfferBlock = (props: {
  offer: NegotiationOffer;
  detailRole: 'buyer' | 'seller';
  conversationId: string;
  ordersByOfferId: Record<string, string>;
  productUnit: string;
}) => {
  const { offer, detailRole, conversationId, ordersByOfferId, productUnit } = props;
  const [counterOpen, setCounterOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [cPrice, setCPrice] = useState(String(offer.unitPrice));
  const [cQty, setCQty] = useState(String(offer.quantity));
  const [orderNote, setOrderNote] = useState('');

  const acceptMu = useAcceptNegotiationOfferMutation(conversationId);
  const declineMu = useDeclineNegotiationOfferMutation(conversationId);
  const createOfferMu = useCreateNegotiationOfferMutation(conversationId);
  const orderMu = useCreateOrderFromOfferMutation(conversationId);

  const isMyTurn =
    offer.status === 'pending' && offer.awaitingParty && offer.awaitingParty === detailRole;
  const orderId = ordersByOfferId[offer.id];

  const onCounter = async () => {
    const unitPrice = Number(cPrice.replace(/\./g, '').replace(',', '.'));
    const quantity = Number(cQty.replace(',', '.'));
    if (!Number.isFinite(unitPrice) || !Number.isFinite(quantity)) return;
    await createOfferMu.mutateAsync({
      unitPrice,
      quantity,
      parentOfferId: offer.id,
    });
    setCounterOpen(false);
  };

  const onCreateOrder = async () => {
    await orderMu.mutateAsync({ offerId: offer.id, note: orderNote.trim() || undefined });
    setOrderOpen(false);
    setOrderNote('');
  };

  return (
    <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm">
      <div className="mb-2 flex items-center gap-2 font-medium text-primary">
        <Tag className="h-4 w-4" />
        Đề xuất giá
      </div>
      <p>
        Giá đơn vị:{' '}
        <span className="font-semibold">{offer.unitPrice.toLocaleString('vi-VN')}đ</span>
      </p>
      <p>
        Số lượng:{' '}
        <span className="font-semibold">
          {offer.quantity} {productUnit}
        </span>
      </p>
      <p className="mt-1 text-muted-foreground">{offerStatusLabel(offer, detailRole)}</p>

      {isMyTurn ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={acceptMu.isPending}
            onClick={() => void acceptMu.mutateAsync(offer.id)}
          >
            {acceptMu.isPending ? '…' : 'Chấp nhận'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={declineMu.isPending}
            onClick={() => void declineMu.mutateAsync(offer.id)}
          >
            Từ chối
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setCounterOpen(true)}>
            Đề xuất lại
          </Button>
        </div>
      ) : null}

      {offer.status === 'accepted' && detailRole === 'seller' && !orderId ? (
        <div className="mt-3">
          <Button size="sm" onClick={() => setOrderOpen(true)}>
            Tạo đơn cho khách
          </Button>
        </div>
      ) : null}

      {orderId ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Đơn:{' '}
          <Link className="font-medium text-primary underline" to={`/don-hang/${orderId}`}>
            xem chi tiết
          </Link>
        </p>
      ) : null}

      <Dialog open={counterOpen} onOpenChange={setCounterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đề xuất lại</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-muted-foreground">Giá đơn vị</label>
              <Input type="number" value={cPrice} onChange={(e) => setCPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Số lượng</label>
              <Input type="number" value={cQty} onChange={(e) => setCQty(e.target.value)} />
            </div>
            <Button
              className="w-full"
              disabled={createOfferMu.isPending}
              onClick={() => void onCounter()}
            >
              Gửi đề xuất
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo đơn từ thẻ đã thống nhất</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-muted-foreground">Ghi chú (tuỳ chọn)</label>
              <Input value={orderNote} onChange={(e) => setOrderNote(e.target.value)} />
            </div>
            <Button
              className="w-full"
              disabled={orderMu.isPending}
              onClick={() => void onCreateOrder()}
            >
              Gửi đơn cho khách
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const otherHasSeenMessage = (otherReadAt: string | null | undefined, messageCreatedAt: string | null) => {
  if (!otherReadAt || !messageCreatedAt) return false;
  const a = new Date(otherReadAt).getTime();
  const b = new Date(messageCreatedAt).getTime();
  return Number.isFinite(a) && Number.isFinite(b) && a >= b;
};

const MessageBubble = ({
  m,
  detailRole,
  conversationId,
  ordersByOfferId,
  productUnit,
  otherLastReadAt,
}: {
  m: ChatMessage;
  detailRole: 'buyer' | 'seller';
  conversationId: string;
  ordersByOfferId: Record<string, string>;
  productUnit: string;
  otherLastReadAt: string | null | undefined;
}) => {
  const user = useAuthStore((s) => s.user);
  const mine = user?.id === m.senderId;
  const showSeen = mine && m.kind === 'text' && otherHasSeenMessage(otherLastReadAt, m.createdAt);
  const seenByOtherLabel = detailRole === 'seller' ? 'Khách đã xem' : 'Shop đã xem';
  if (m.kind === 'offer' && m.offer) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <OfferBlock
            offer={m.offer}
            detailRole={detailRole}
            conversationId={conversationId}
            ordersByOfferId={ordersByOfferId}
            productUnit={productUnit}
          />
        </div>
      </div>
    );
  }
  return (
    <div className={`flex flex-col gap-0.5 ${mine ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 ${
          mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-[#27272a]'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm">{m.content}</p>
      </div>
      {showSeen ? (
        <span className="pr-1 text-[10px] text-muted-foreground">{seenByOtherLabel}</span>
      ) : null}
    </div>
  );
};

export type ConversationThreadPanelProps = {
  conversationId: string;
  variant: 'page' | 'dock';
  backHref?: string;
  dockTitle?: string;
  dockSubtitle?: string;
  expandHref?: string;
  onCloseDock?: () => void;
  onMinimizeDock?: () => void;
};

export function ConversationThreadPanel({
  conversationId,
  variant,
  backHref = '/',
  dockTitle,
  dockSubtitle,
  expandHref,
  onCloseDock,
  onMinimizeDock,
}: ConversationThreadPanelProps) {
  const location = useLocation();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isAuthenticated = !!auth.currentUser;

  const detailQuery = useConversationDetailQuery(conversationId, isAuthenticated);
  const messagesQuery = useConversationMessagesQuery(conversationId, isAuthenticated);
  const sendMu = useSendChatMessageMutation(conversationId);
  const markReadMu = useMarkConversationReadMutation(conversationId);

  useConversationActivitySubscription(conversationId);

  const [text, setText] = useState('');
  const [offerOpen, setOfferOpen] = useState(false);
  const [oPrice, setOPrice] = useState('');
  const [oQty, setOQty] = useState('1');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const createOfferMu = useCreateNegotiationOfferMutation(conversationId);

  const detail = detailQuery.data;
  const messages = messagesQuery.data ?? [];

  const productUnit = detail?.product?.unit || 'kg';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const ordersByOfferId = detail?.ordersByOfferId ?? {};
  const awaitingOrder = detail?.awaitingBuyerAddressOrder;

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
    [messages],
  );

  const lastMessageId = sortedMessages[sortedMessages.length - 1]?.id;

  const markReadDoneKeyRef = useRef<string | null>(null);

  useEffect(() => {
    markReadDoneKeyRef.current = null;
  }, [conversationId]);

  const markReadStaleKey = `${conversationId}:${lastMessageId ?? 'none'}:${sortedMessages.length}`;

  useEffect(() => {
    if (!detailQuery.isSuccess || !messagesQuery.isSuccess) return;
    if (markReadDoneKeyRef.current === markReadStaleKey) return;

    const t = window.setTimeout(() => {
      void markReadMu
        .mutateAsync()
        .then(() => {
          markReadDoneKeyRef.current = markReadStaleKey;
        })
        .catch(() => {});
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, detailQuery.isSuccess, messagesQuery.isSuccess, markReadStaleKey]);

  const myLastReadLabel = useMemo(() => {
    const raw = detail?.readReceipts?.myLastReadAt;
    if (!raw) return null;
    try {
      return new Date(raw).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return null;
    }
  }, [detail?.readReceipts?.myLastReadAt]);

  if (!isAuthenticated) {
    return (
      <Navigate to={`/dang-nhap?next=${encodeURIComponent(location.pathname)}`} replace />
    );
  }

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setToast(null);
    try {
      await sendMu.mutateAsync(t);
      setText('');
    } catch (e) {
      setToast({ type: 'error', text: getApiErrorMessage(e, 'Không gửi được tin nhắn.') });
    }
  };

  const handlePropose = async () => {
    const unitPrice = Number(oPrice.replace(/\./g, '').replace(',', '.'));
    const quantity = Number(oQty.replace(',', '.'));
    if (!Number.isFinite(unitPrice) || !Number.isFinite(quantity)) {
      setToast({ type: 'error', text: 'Nhập giá và số lượng hợp lệ.' });
      return;
    }
    setToast(null);
    try {
      await createOfferMu.mutateAsync({ unitPrice, quantity });
      setOfferOpen(false);
      setOPrice('');
      setOQty('1');
    } catch (e) {
      setToast({ type: 'error', text: getApiErrorMessage(e, 'Không gửi được đề xuất.') });
    }
  };

  if (detailQuery.isLoading || messagesQuery.isLoading) {
    if (variant === 'dock') {
      return (
        <div className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải…
        </div>
      );
    }
    return (
      <main className="container flex max-w-3xl items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải hội thoại...
      </main>
    );
  }

  if (detailQuery.isError || !detail) {
    if (variant === 'dock') {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-sm text-red-600">
          {getApiErrorMessage(detailQuery.error, 'Không tải được hội thoại.')}
        </div>
      );
    }
    return (
      <main className="container max-w-3xl py-10">
        <p className="text-sm text-red-600">
          {getApiErrorMessage(detailQuery.error, 'Không tải được hội thoại.')}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={backHref}>Quay lại</Link>
        </Button>
      </main>
    );
  }

  const headerTitle =
    dockTitle ??
    (detail.role === 'buyer' ? detail.shop.name : detail.buyer?.fullName || 'Khách hàng');
  const headerSubtitle =
    dockSubtitle ??
    (detail.role === 'buyer' ? 'Chat với shop' : 'Chat với người mua');

  const threadBody = (
    <>
      {variant === 'page' && detail.product ? (
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="flex gap-3 p-3">
            {detail.product.coverImage ? (
              <img
                src={detail.product.coverImage}
                alt=""
                className="h-16 w-16 rounded-md border object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-md bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#27272a]">{detail.product.name}</p>
              <p className="text-sm text-muted-foreground">
                Giá niêm yết: {detail.product.price.toLocaleString('vi-VN')}đ / {productUnit}
              </p>
              <Link
                to={`/san-pham/${detail.product.id}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                Xem sản phẩm
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {variant === 'dock' && detail.product ? (
        <div className="shrink-0 border-b bg-muted/30 px-3 py-2 text-xs">
          <p className="truncate font-medium text-[#27272a]">{detail.product.name}</p>
          <Link to={`/san-pham/${detail.product.id}`} className="text-primary hover:underline">
            Xem sản phẩm
          </Link>
        </div>
      ) : null}

      {awaitingOrder && detail.role === 'buyer' ? (
        <div
          className={`rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 ${
            variant === 'dock' ? 'mx-3 mt-2 shrink-0' : ''
          }`}
        >
          Shop đã tạo đơn chờ bạn xác nhận địa chỉ.{' '}
          <Link className="font-semibold underline" to={`/don-hang/${awaitingOrder.id}`}>
            Xem đơn chờ
          </Link>
        </div>
      ) : null}

      {toast ? <AuthFormMessage type={toast.type} text={toast.text} /> : null}

      <Card
        className={
          variant === 'dock'
            ? 'flex min-h-0 flex-1 flex-col rounded-none border-0 shadow-none'
            : 'min-h-[360px]'
        }
      >
        <CardContent
          className={
            variant === 'dock'
              ? 'flex min-h-0 flex-1 flex-col p-0'
              : 'flex h-[min(62vh,520px)] flex-col p-0'
          }
        >
          <div
            className={
              variant === 'dock'
                ? 'min-h-0 flex-1 space-y-3 overflow-y-auto p-3'
                : 'flex-1 space-y-3 overflow-y-auto p-4'
            }
          >
            {sortedMessages.map((m) => (
              <MessageBubble
                key={m.id}
                m={m}
                detailRole={detail.role}
                conversationId={conversationId}
                ordersByOfferId={ordersByOfferId}
                productUnit={productUnit}
                otherLastReadAt={detail.readReceipts?.otherLastReadAt ?? null}
              />
            ))}
            <div ref={bottomRef} />
          </div>
          <div className={`border-t ${variant === 'dock' ? 'p-2' : 'p-3'}`}>
            {detail.product ? (
              <div className="mb-2 flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOfferOpen(true)}>
                  Đề xuất giá
                </Button>
              </div>
            ) : null}
            <div className="flex gap-2">
              <textarea
                className="min-h-[40px] flex-1 resize-none rounded-md border border-input bg-white px-3 py-2 text-sm"
                placeholder="Nhập tin nhắn..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <Button disabled={sendMu.isPending} onClick={() => void handleSend()}>
                Gửi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đề xuất giá &amp; số lượng</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-muted-foreground">Giá đơn vị mong muốn</label>
              <Input type="number" value={oPrice} onChange={(e) => setOPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Số lượng ({productUnit})</label>
              <Input type="number" value={oQty} onChange={(e) => setOQty(e.target.value)} />
            </div>
            <Button
              className="w-full"
              disabled={createOfferMu.isPending}
              onClick={() => void handlePropose()}
            >
              Gửi vào chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  if (variant === 'dock') {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col bg-white">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-[#0a7d42] px-2 py-2 text-white">
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-sm font-semibold">{headerTitle}</p>
            <p className="truncate text-[11px] text-white/85">
              {headerSubtitle}
              {myLastReadLabel ? ` · Bạn xem lúc ${myLastReadLabel}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {expandHref ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/15"
                asChild
              >
                <Link to={expandHref} aria-label="Mở toàn màn hình">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            {onMinimizeDock ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/15"
                onClick={onMinimizeDock}
                aria-label="Thu nhỏ"
              >
                <Minus className="h-4 w-4" />
              </Button>
            ) : null}
            {onCloseDock ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/15"
                onClick={onCloseDock}
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{threadBody}</div>
      </div>
    );
  }

  return (
    <main className="container max-w-3xl space-y-4 py-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to={backHref} aria-label="Quay lại">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-[#27272a]">{headerTitle}</h1>
          <p className="text-xs text-muted-foreground">{headerSubtitle}</p>
          {myLastReadLabel ? (
            <p className="text-[11px] text-muted-foreground">Bạn đã xem tin lúc {myLastReadLabel}</p>
          ) : null}
        </div>
      </div>
      {threadBody}
    </main>
  );
}
