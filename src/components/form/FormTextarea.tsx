import * as React from "react";
import { cn } from "@/lib/utils";

type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string;
};

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ id, label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium text-[#27272a]">
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);

FormTextarea.displayName = "FormTextarea";
