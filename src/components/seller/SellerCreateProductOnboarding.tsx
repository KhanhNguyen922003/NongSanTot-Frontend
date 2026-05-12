import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'nongsantot-seller-create-product-onboarding';

export function hasSeenSellerCreateProductOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markSellerCreateProductOnboardingSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** 2 bước ngắn: chuẩn bị gì + quy trình đăng bài — cho nông dân / người bán nhỏ. */
export function SellerCreateProductOnboarding({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(0);

  const finish = () => {
    setStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          markSellerCreateProductOnboardingSeen();
          setStep(0);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 0 ? 'Trước khi đăng bán' : 'Cách đăng trên chợ'}</DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed">
            {step === 0 ? (
              <span>
                Bước 1/2 — Chuẩn bị sẵn giúp bạn đăng nhanh, không bị thiếu thông tin.
              </span>
            ) : (
              <span>Bước 2/2 — Chỉ vài bước, làm lần lượt từ trên xuống.</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 0 ? (
          <ul className="list-inside list-disc space-y-2 text-sm text-[#27272a]">
            <li>Ảnh rõ nông sản (có thể thêm video ngắn).</li>
            <li>Giá bán, số lượng còn, đơn vị (kg, thùng…).</li>
            <li>Mô tả rõ: nguồn gốc, cách bảo quản, thời vụ.</li>
            <li>Địa chỉ lấy hàng và người liên hệ khi ship.</li>
            <li className="list-none pl-0 text-muted-foreground">
              Nhật ký từng giai đoạn là <strong className="text-foreground">tuỳ chọn</strong> — có thì khách tin hơn.
            </li>
          </ul>
        ) : (
          <ol className="list-inside list-decimal space-y-2 text-sm text-[#27272a]">
            <li>Thông tin cơ bản</li>
            <li>Ảnh / video</li>
            <li>Nhật ký (bỏ qua được)</li>
            <li>Cách giao hàng và xem lại trước khi gửi</li>
          </ol>
        )}

        <p className="text-xs text-muted-foreground">
          Sau khi gửi, bài đăng chờ duyệt mới hiện trên chợ cho người mua.
        </p>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          {step === 0 ? (
            <>
              <Button type="button" variant="outline" onClick={finish}>
                Bỏ qua
              </Button>
              <Button type="button" onClick={() => setStep(1)}>
                Tiếp theo
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                Quay lại
              </Button>
              <Button type="button" onClick={finish}>
                Bắt đầu đăng bài
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
