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
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const size = getRecaptchaWidgetSize();
    recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, { size });
    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, [recaptchaContainerId]);

  const getVerifier = useCallback(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: getRecaptchaWidgetSize(),
      });
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
  };
}
