import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tag } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { NegotiationOffer } from '@/queries/messaging/types';
import {
  useAcceptNegotiationOfferMutation,
  useCreateNegotiationOfferMutation,
  useDeclineNegotiationOfferMutation,
  useCreateOrderFromOfferMutation,
} from '@/queries/messaging/useMessaging';
import { fractionalUnitValues } from '@/constants/productUnit';
import { formatCurrencyInput, normalizeCurrencyInput } from '@/components/messaging/currency';

interface OfferBlockProps {
  offer: NegotiationOffer;
  detailRole: 'buyer' | 'seller';
  conversationId: string;
  ordersByOfferId: Record<string, string>;
  productUnit: string;
}

const isFractionalUnit = (unit: string): boolean => {
  return fractionalUnitValues.includes(unit as typeof fractionalUnitValues[number]);
};

const MIN_QUANTITY_BY_UNIT: Record<string, number> = {
  g: 150,
  mg: 150000,
  kg: 0.15,
  'tấn': 0.00015,
  'tạ': 0.0015,
  'yến': 0.015,
};

const validateQuantity = (
  quantity: number,
  unit: string,
): { valid: boolean; warning?: string } => {
  const minThreshold = MIN_QUANTITY_BY_UNIT[unit];

  if (isFractionalUnit(unit)) {
    if (minThreshold && quantity < minThreshold) {
      return {
        valid: false,
        warning: `Số lượng quá ít. Tối thiểu: ${minThreshold} ${unit}`,
      };
    }
    return { valid: true };
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      valid: false,
      warning: `${unit} phải là số nguyên dương`,
    };
  }

  return { valid: true };
};

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

export const OfferBlock = (props: OfferBlockProps) => {
  const { offer, detailRole, conversationId, ordersByOfferId, productUnit } = props;
  const [counterOpen, setCounterOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [cPrice, setCPrice] = useState(String(offer.unitPrice));
  const [cQty, setCQty] = useState(String(offer.quantity));
  const [orderNote, setOrderNote] = useState('');
  const [counterError, setCounterError] = useState<string | null>(null);

  const acceptMu = useAcceptNegotiationOfferMutation(conversationId);
  const declineMu = useDeclineNegotiationOfferMutation(conversationId);
  const createOfferMu = useCreateNegotiationOfferMutation(conversationId);
  const orderMu = useCreateOrderFromOfferMutation(conversationId);

  const isMyTurn =
    offer.status === 'pending' && offer.awaitingParty && offer.awaitingParty === detailRole;
  const orderId = ordersByOfferId[offer.id];
  const parsedUnitPrice = useMemo(() => {
    const parsed = Number(cPrice);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [cPrice]);
  const parsedQuantity = useMemo(() => {
    const parsed = Number(cQty.replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [cQty]);
  const quantityValidation = useMemo(() => {
    if (!parsedQuantity) return { valid: false, warning: 'Số lượng không hợp lệ' };
    return validateQuantity(parsedQuantity, productUnit);
  }, [parsedQuantity, productUnit]);
  const isCounterValid = !!parsedUnitPrice && !!parsedQuantity && quantityValidation.valid;

  const onCounter = async () => {
    if (!isCounterValid) {
      setCounterError(quantityValidation.warning || 'Vui lòng nhập giá và số lượng hợp lệ');
      return;
    }
    await createOfferMu.mutateAsync({
      unitPrice: parsedUnitPrice!,
      quantity: parsedQuantity!,
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
        Giá đơn vị: <span className="font-semibold">{offer.unitPrice.toLocaleString('vi-VN')}đ</span>
      </p>
      <p>
        Số lượng: <span className="font-semibold">{offer.quantity} {productUnit}</span>
      </p>
      <p className="mt-1 text-muted-foreground">{offerStatusLabel(offer, detailRole)}</p>

      {isMyTurn && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" disabled={acceptMu.isPending} onClick={() => void acceptMu.mutateAsync(offer.id)}>
            {acceptMu.isPending ? '…' : 'Chấp nhận'}
          </Button>
          <Button size="sm" variant="outline" disabled={declineMu.isPending} onClick={() => void declineMu.mutateAsync(offer.id)}>
            Từ chối
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setCounterOpen(true)}>
            Đề xuất lại
          </Button>
        </div>
      )}

      {offer.status === 'accepted' && detailRole === 'seller' && !orderId && (
        <div className="mt-3">
          <Button size="sm" onClick={() => setOrderOpen(true)}>
            Tạo đơn cho khách
          </Button>
        </div>
      )}

      {orderId && (
        <p className="mt-2 text-xs text-muted-foreground">
          Đơn: <Link className="font-medium text-primary underline" to={`/don-hang/${orderId}`}>xem chi tiết</Link>
        </p>
      )}

      {/* Counter dialog */}
      <Dialog open={counterOpen} onOpenChange={setCounterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đề xuất lại</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-muted-foreground">Giá đơn vị</label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatCurrencyInput(cPrice)}
                onChange={(e) => {
                  setCPrice(normalizeCurrencyInput(e.target.value));
                  setCounterError(null);
                }}
                placeholder="Nhập giá (vd: 50000)"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Số lượng</label>
              <Input
                type="text"
                inputMode={isFractionalUnit(productUnit) ? 'decimal' : 'numeric'}
                value={cQty}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!isFractionalUnit(productUnit)) {
                    setCQty(value.replace(/[^\d]/g, ''));
                  } else {
                    setCQty(value.replace(/[^\d.]/g, ''));
                  }
                  setCounterError(null);
                }}
                placeholder={isFractionalUnit(productUnit) ? 'vd: 10 hoặc 10.5' : 'vd: 10'}
              />
              {quantityValidation.warning ? (
                <p className="mt-1 text-xs text-amber-600">{quantityValidation.warning}</p>
              ) : null}
            </div>
            {counterError ? <p className="text-xs text-red-600">{counterError}</p> : null}
            <Button className="w-full" disabled={createOfferMu.isPending} onClick={() => void onCounter()}>
              Gửi đề xuất
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo đơn từ thảo luận</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-muted-foreground">Ghi chú (tuỳ chọn)</label>
              <Input value={orderNote} onChange={e => setOrderNote(e.target.value)} />
            </div>
            <Button className="w-full" disabled={orderMu.isPending} onClick={() => void onCreateOrder()}>
              Gửi đơn cho khách
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
