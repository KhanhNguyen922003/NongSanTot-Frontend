import { DollarSign, Package, AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { fractionalUnitValues } from '@/constants/productUnit';

interface PriceProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (unitPrice: number, quantity: number) => Promise<void>;
  isLoading?: boolean;
  productUnit?: string;
  currentPrice?: number;
  dialogTitle?: string;
  submitLabel?: string;
}

const formatPriceInput = (value: string): string => {
  // Remove non-digit characters except decimal
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  
  if (parts.length > 2) {
    return formatPriceInput(parts.slice(0, 2).join('.'));
  }
  
  // Format integer part with thousand separators
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (parts.length === 2) {
    return `${integerPart},${parts[1].substring(0, 2)}`;
  }
  
  return integerPart;
};

const parsePriceInput = (value: string): number => {
  return Number(value.replace(/\./g, '').replace(',', '.'));
};

// Check if a unit is fractional (can have decimal values)
const isFractionalUnit = (unit: string): boolean => {
  return fractionalUnitValues.includes(unit as typeof fractionalUnitValues[number]);
};

// Minimum quantity thresholds for shipping logistics (GHTK compatibility)
const MIN_QUANTITY_BY_UNIT: Record<string, number> = {
  'g': 150, // Minimum 150g for GHTK
  'mg': 150000, // Minimum 150000mg (= 150g)
  'kg': 0.15, // Minimum 0.15kg (= 150g)
  'tấn': 0.00015, // Minimum 0.00015 tấn (= 150g)
  'tạ': 0.0015, // Minimum 0.0015 tạ (= 150g)
  'yến': 0.015, // Minimum 0.015 yến (= 150g)
};

// Validate quantity based on unit type
const validateQuantity = (
  quantity: number,
  unit: string
): { valid: boolean; warning?: string } => {
  const minThreshold = MIN_QUANTITY_BY_UNIT[unit];

  // For fractional units, check for minimum threshold and reasonable max ranges
  if (isFractionalUnit(unit)) {
    if (minThreshold && quantity < minThreshold) {
      let minWarning = `${minThreshold} ${unit}`;
      if (unit === 'g') {
        minWarning = `${minThreshold}g (vận chuyển cần tối thiểu)`;
      } else if (unit === 'mg') {
        minWarning = `${minThreshold}mg = ${minThreshold / 1000}g`;
      }
      return {
        valid: false,
        warning: `Số lượng quá ít. Tối thiểu: ${minWarning}`,
      };
    }

    if (unit === 'g' && quantity > 10000) {
      return {
        valid: true,
        warning: `${quantity.toLocaleString('vi-VN')}g = ${(quantity / 1000).toLocaleString('vi-VN')}kg - rất nhiều!`,
      };
    }
    if (unit === 'mg' && quantity > 1000000) {
      return {
        valid: true,
        warning: `${quantity.toLocaleString('vi-VN')}mg = ${(quantity / 1000000).toLocaleString('vi-VN')}kg - rất nhiều!`,
      };
    }
    if ((unit === 'tấn' || unit === 'tạ' || unit === 'yến') && quantity > minThreshold && quantity < 0.1) {
      return {
        valid: true,
        warning: `${quantity} ${unit} - rất ít!`,
      };
    }
    return { valid: true };
  }

  // For discrete units (quả, cây, con, etc), must be positive integer
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      valid: false,
      warning: `${unit} phải là số nguyên dương`,
    };
  }

  // Check for reasonable range for discrete units
  if (quantity > 100000) {
    return {
      valid: true,
      warning: `${quantity.toLocaleString('vi-VN')} ${unit} - rất nhiều!`,
    };
  }

  return { valid: true };
};

export function PriceProposalDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  productUnit = 'kg',
  currentPrice,
  dialogTitle = 'Đề xuất giá & số lượng',
  submitLabel = 'Gửi vào chat',
}: PriceProposalDialogProps) {
  const [priceInput, setPriceInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('1');
  const [error, setError] = useState<string | null>(null);

  // Validate quantity based on unit type
  const quantityValidation = useMemo(() => {
    if (!quantityInput || quantityInput === '.') return { valid: true };
    const qty = parseFloat(quantityInput.replace(',', '.'));
    if (!Number.isFinite(qty)) return { valid: false, warning: 'Số lượng không hợp lệ' };
    return validateQuantity(qty, productUnit);
  }, [quantityInput, productUnit]);

  const parsedPrice = useMemo(() => {
    if (!priceInput) return null;
    return parsePriceInput(priceInput);
  }, [priceInput]);

  const parsedQuantity = useMemo(() => {
    if (!quantityInput) return null;
    const qty = Number(quantityInput.replace(',', '.'));
    return Number.isFinite(qty) ? qty : null;
  }, [quantityInput]);

  const priceWarning = useMemo(() => {
    if (!parsedPrice || !currentPrice) return null;
    
    const percentChange = ((parsedPrice - currentPrice) / currentPrice) * 100;
    
    if (percentChange < -50) {
      return { type: 'error', text: 'Giá thấp hơn 50% - shop có thể từ chối' };
    }
    if (percentChange < -30) {
      return { type: 'warning', text: 'Giá thấp hơn 30%' };
    }
    if (percentChange > 50) {
      return { type: 'info', text: 'Giá cao hơn 50% giá gốc' };
    }
    
    return null;
  }, [parsedPrice, currentPrice]);

  const isValid =
    parsedPrice &&
    parsedPrice > 0 &&
    parsedQuantity &&
    parsedQuantity > 0 &&
    quantityValidation.valid;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setPriceInput('');
    } else {
      setPriceInput(formatPriceInput(value));
    }
    setError(null);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // For discrete units, only allow integers
    if (!isFractionalUnit(productUnit)) {
      const intValue = value.replace(/[^\d]/g, '');
      setQuantityInput(intValue);
      setError(null);
      return;
    }

    // For fractional units, allow decimals
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setQuantityInput(parts.slice(0, 2).join('.'));
      return;
    }

    setQuantityInput(cleaned);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Vui lòng nhập giá và số lượng hợp lệ');
      return;
    }

    try {
      await onSubmit(parsedPrice!, parsedQuantity!);
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  const handleReset = () => {
    setPriceInput('');
    setQuantityInput('1');
    setError(null);
  };

  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Giá đơn vị */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4 text-primary" />
              Giá đơn vị
            </label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Nhập giá (vd: 50.000)"
              value={priceInput}
              onChange={handlePriceChange}
              disabled={isLoading}
              className="text-sm"
            />
            {priceWarning && (
              <p
                className={`text-xs ${
                  priceWarning.type === 'error'
                    ? 'text-red-600'
                    : priceWarning.type === 'warning'
                      ? 'text-amber-600'
                      : 'text-blue-600'
                }`}
              >
                {priceWarning.text}
              </p>
            )}
            {parsedPrice && (
              <p className="text-xs text-muted-foreground">
                = {parsedPrice.toLocaleString('vi-VN')}đ
              </p>
            )}
          </div>

          {/* Số lượng */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Package className="h-4 w-4 text-primary" />
              Số lượng ({productUnit})
            </label>
            <Input
              type="text"
              inputMode={isFractionalUnit(productUnit) ? 'decimal' : 'numeric'}
              placeholder={isFractionalUnit(productUnit) ? 'vd: 10 hoặc 10.5' : 'vd: 10'}
              value={quantityInput}
              onChange={handleQuantityChange}
              disabled={isLoading}
              className="text-sm"
            />
            {quantityValidation.warning && (
              <div className="flex items-start gap-2">
                <AlertCircle className={`h-4 w-4 mt-0.5 shrink-0 ${quantityValidation.valid ? 'text-amber-600' : 'text-red-600'}`} />
                <p
                  className={`text-xs ${
                    quantityValidation.valid ? 'text-amber-600' : 'text-red-600'
                  }`}
                >
                  {quantityValidation.warning}
                </p>
              </div>
            )}
            {parsedQuantity && !quantityValidation.warning && (
              <p className="text-xs text-muted-foreground">
                = {parsedQuantity.toLocaleString('vi-VN')} {productUnit}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Tính toán tổng giá */}
          {parsedPrice && parsedQuantity && (
            <div className="rounded-md bg-primary/5 p-3">
              <p className="text-sm text-muted-foreground">Tổng giá</p>
              <p className="font-semibold text-primary">
                {(parsedPrice * parsedQuantity).toLocaleString('vi-VN')}đ
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Đang gửi…' : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
