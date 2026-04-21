import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type FormInputProps = Omit<InputProps, 'id'> & {
  id: string;
  label: string;
  error?: string;
};

/**
 * Gom label + input + lỗi validate (react-hook-form) cho form auth / seller.
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({ label, error, id, className, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-[#27272a]">
        {label}
      </label>
      <Input ref={ref} id={id} className={cn(className)} aria-invalid={error ? true : undefined} {...props} />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});
FormInput.displayName = 'FormInput';
