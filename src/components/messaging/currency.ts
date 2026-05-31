export const normalizeCurrencyInput = (raw: string) => raw.replace(/[^\d]/g, '');

export const formatCurrencyInput = (value: string | number): string => {
  if (value === '' || value == null) return '';
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return '';
  return new Intl.NumberFormat('vi-VN').format(parsed);
};
