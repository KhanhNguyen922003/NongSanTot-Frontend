import { cn } from '@/lib/utils';

export type AuthFormMessageProps = {
  type: 'success' | 'error';
  text: string;
};

export function AuthFormMessage({ type, text }: AuthFormMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-sm shadow-card',
        type === 'success'
          ? 'border-primary/20 bg-primary/5 text-primary'
          : 'border-red-200 bg-red-50 text-red-800',
      )}
    >
      {text}
    </div>
  );
}
