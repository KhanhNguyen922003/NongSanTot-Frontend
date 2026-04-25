import { AxiosError } from 'axios';

/**
 * Lấy message từ response Nest (hoặc fallback) khi gọi API thất bại.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as { message: string | string[] }).message;
      if (Array.isArray(msg)) return msg.join(', ');
      if (typeof msg === 'string') return msg;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
