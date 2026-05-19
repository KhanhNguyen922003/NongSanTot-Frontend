import type { ChatMessage } from '@/queries/messaging/types';
import useAuthStore from '@/stores/auth.store';
import { OfferBlock } from '@/components/messaging/OfferBlock';

interface MessageBubbleProps {
  m: ChatMessage;
  detailRole: 'buyer' | 'seller';
  conversationId: string;
  ordersByOfferId: Record<string, string>;
  productUnit: string;
  otherLastReadAt: string | null | undefined;
}

export const MessageBubble = (props: MessageBubbleProps) => {
  const { m, detailRole, conversationId, ordersByOfferId, productUnit, otherLastReadAt } = props;
  const user = useAuthStore((s) => s.user);
  const mine = user?.id === m.senderId;
  const showSeen =
    mine && m.kind === 'text' && otherHasSeenMessage(otherLastReadAt, m.createdAt);
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
        className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-[#27272a]'
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

const otherHasSeenMessage = (otherReadAt: string | null | undefined, messageCreatedAt: string | null) => {
  if (!otherReadAt || !messageCreatedAt) return false;
  const a = new Date(otherReadAt).getTime();
  const b = new Date(messageCreatedAt).getTime();
  return Number.isFinite(a) && Number.isFinite(b) && a >= b;
};
