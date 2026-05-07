import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FormSelectOption = {
  value: string;
  label: string;
};

type FormSelectProps = {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  options: FormSelectOption[];
  error?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
};

export const FormSelect = ({
  id,
  label,
  value,
  placeholder,
  options,
  error,
  disabled,
  onValueChange,
}: FormSelectProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-[#27272a]">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder ?? "Chọn"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};
