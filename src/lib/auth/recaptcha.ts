/**
 * Production: hiển thị reCAPTCHA (normal) để giảm abuse.
 * Development: invisible để dev nhanh hơn.
 *
 * Ghi đè tùy ý: `VITE_RECAPTCHA_SIZE=normal` hoặc `invisible` trong `.env`.
 */
export function getRecaptchaWidgetSize(): 'normal' | 'invisible' {
  const explicit = import.meta.env.VITE_RECAPTCHA_SIZE as string | undefined;
  if (explicit === 'normal' || explicit === 'invisible') {
    return explicit;
  }
  return import.meta.env.PROD ? 'normal' : 'invisible';
}

export function isRecaptchaVisible(): boolean {
  return getRecaptchaWidgetSize() === 'normal';
}
