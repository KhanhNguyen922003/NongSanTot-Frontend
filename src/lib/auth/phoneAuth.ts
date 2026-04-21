/**
 * Chuẩn hóa số điện thoại Việt Nam sang E.164 (+84...).
 */
export function normalizePhoneToE164(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').trim();
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('0')) return `+84${cleaned.slice(1)}`;
  if (cleaned.startsWith('84')) return `+${cleaned}`;
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}
