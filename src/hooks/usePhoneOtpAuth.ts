import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { getRecaptchaWidgetSize } from '@/lib/auth/recaptcha';
import { normalizePhoneToE164 } from '@/lib/auth/phoneAuth';

type SendOtpResult = { ok: true } | { ok: false; message: string };

type ConfirmOtpResult = { ok: true } | { ok: false; message: string };

/**
 * Gửi / xác thực OTP đăng nhập Firebase Phone Auth + reCAPTCHA (normal hoặc invisible theo env).
 */
export function usePhoneOtpAuth(recaptchaContainerId: string) {
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const size = getRecaptchaWidgetSize();
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size,
      callback: () => setCaptchaVerified(true),
      'expired-callback': () => setCaptchaVerified(false),
    });
    recaptchaRef.current = verifier;

    if (size === 'normal') {
      verifier.render().catch(console.error);
    }

    return () => {
      verifier.clear();
      recaptchaRef.current = null;
      // Dọn dẹp DOM phòng trường hợp React StrictMode unmount nhanh khi render() chưa xong
      const container = document.getElementById(recaptchaContainerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [recaptchaContainerId]);

  const getVerifier = useCallback(() => {
    if (!recaptchaRef.current) {
      const size = getRecaptchaWidgetSize();
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size,
        callback: () => setCaptchaVerified(true),
        'expired-callback': () => setCaptchaVerified(false),
      });
      recaptchaRef.current = verifier;
      if (size === 'normal') {
        verifier.render().catch(console.error);
      }
    }
    return recaptchaRef.current;
  }, [recaptchaContainerId]);

  const sendOtp = useCallback(
    async (phoneRaw: string): Promise<SendOtpResult> => {
      setSending(true);
      try {
        const phone = normalizePhoneToE164(phoneRaw);
        if (!phone.startsWith('+')) {
          return { ok: false, message: 'Số điện thoại không hợp lệ.' };
        }
        const verifier = getVerifier();
        const result = await signInWithPhoneNumber(auth, phone, verifier);
        setConfirmationResult(result);
        // Token captcha đã được tiêu thụ ở lần gửi OTP này.
        setCaptchaVerified(false);
        return { ok: true };
      } catch (e) {
        const err = e as Error;
        return { ok: false, message: err.message || 'Không gửi được mã OTP.' };
      } finally {
        setSending(false);
      }
    },
    [getVerifier],
  );

  const confirmOtp = useCallback(
    async (otpRaw: string): Promise<ConfirmOtpResult> => {
      if (!confirmationResult) {
        return { ok: false, message: 'Vui lòng gửi mã OTP trước.' };
      }
      const otp = otpRaw.trim();
      if (!/^\d{6}$/.test(otp)) {
        return { ok: false, message: 'Mã OTP gồm 6 chữ số.' };
      }
      setVerifying(true);
      try {
        await confirmationResult.confirm(otp);
        return { ok: true };
      } catch (e) {
        const err = e as Error;
        return { ok: false, message: err.message || 'Mã OTP không đúng.' };
      } finally {
        setVerifying(false);
      }
    },
    [confirmationResult],
  );

  const resetOtpSession = useCallback(() => {
    setConfirmationResult(null);
  }, []);

  return {
    confirmationResult,
    sending,
    verifying,
    sendOtp,
    confirmOtp,
    resetOtpSession,
    captchaVerified,
  };
}
