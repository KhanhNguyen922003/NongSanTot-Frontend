import { Input } from "@/components/ui/input";

type FormInputCurrencyProps = {
  id: string;
  label: string;
  value: number;
  error?: string;
  placeholder?: string;
  min?: number;
  onValueChange: (value: number) => void;
};

const normalizeCurrencyInput = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};

const formatCurrencyInput = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
};

export const FormInputCurrency = ({
  id,
  label,
  value,
  error,
  placeholder,
  min = 0,
  onValueChange,
}: FormInputCurrencyProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-[#27272a]">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          inputMode="numeric"
          value={formatCurrencyInput(value)}
          placeholder={placeholder}
          onChange={(event) => {
            const nextValue = normalizeCurrencyInput(event.target.value);
            onValueChange(Math.max(min, nextValue));
          }}
          aria-invalid={error ? true : undefined}
          className="pr-10"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          VND
        </span>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};
