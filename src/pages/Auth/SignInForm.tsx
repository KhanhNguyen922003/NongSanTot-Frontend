import { useState, useEffect } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { AuthFormMessage } from '@/components/auth/AuthFormMessage';
import { AuthPageChrome } from '@/components/auth/AuthPageChrome';
import { FormInput } from '@/components/form/FormInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authPaths } from '@/constants/routes';
import { sellerHubPaths } from '@/constants/sellerHub';
import { usePhoneOtpAuth } from '@/hooks/usePhoneOtpAuth';
import { signInOtpSchema, smsOtpCodeSchema, type SignInOtpFormValues } from '@/lib/auth/authSchemas';
import { getRecaptchaWidgetSize, isRecaptchaVisible } from '@/lib/auth/recaptcha';
import { queryKeys } from '@/constants/queryKeys';
import { queryClient } from '@/queries';
import { fetchAuthMe } from '@/queries/Auth/useAuth';
import useAuthStore from '@/stores/auth.store';

const RECAPTCHA_CONTAINER_ID = 'recaptcha-signin';

const SignInForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const { confirmationResult, sending, verifying, sendOtp, confirmOtp, resetOtpSession, captchaVerified } = usePhoneOtpAuth(RECAPTCHA_CONTAINER_ID);
  const needsCaptchaCheck = getRecaptchaWidgetSize() === 'normal';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const form = useForm<SignInOtpFormValues>({
    resolver: yupResolver(signInOtpSchema) as Resolver<SignInOtpFormValues>,
    defaultValues: { phone: '', otp: '' },
  });

  const setErr = (text: string) => setMessage({ type: 'error', text });
  const setOk = (text: string) => setMessage({ type: 'success', text });

  const onSendOtp = form.handleSubmit(async (values) => {
    setMessage(null);
    form.clearErrors('otp');
    form.setValue('otp', '');
    resetOtpSession();
    if (needsCaptchaCheck && !captchaVerified) {
      setErr('Vui lòng hoàn tất reCAPTCHA trước khi gửi OTP.');
      return;
    }
    const res = await sendOtp(values.phone);
    if (res.ok === false) {
      setErr(res.message);
      return;
    }
    setOk('Đã gửi mã OTP. Vui lòng kiểm tra tin nhắn.');
    setCountdown(60);
  });

  const onVerifyOtp = async () => {
    setMessage(null);
    try {
      await smsOtpCodeSchema.validate({ otp: form.getValues('otp') });
    } catch (e) {
      if (e instanceof yup.ValidationError) {
        form.setError('otp', { message: e.errors[0] ?? 'Mã OTP không hợp lệ' });
      }
      return;
    }
    const res = await confirmOtp(form.getValues('otp') ?? '');
    if (res.ok === false) {
      setErr(res.message);
      return;
    }
    const authMeData = await queryClient.fetchQuery({
      queryKey: queryKeys.authMe,
      queryFn: () => fetchAuthMe(),
    });
    useAuthStore.getState().setUser(authMeData.user);
    console.log("🚀 ~ file: SignInForm.tsx:122 ~ onVerifyOtp ~ authMeData:", authMeData);
    setOk('Đăng nhập thành công.');
    const safeNextPath = nextPath && nextPath !== authPaths.signIn ? nextPath : null;
    const dest = authMeData.user.role === 'admin'
      ? authPaths.adminDashboard
      : safeNextPath ?? (authMeData.user.role === 'seller' ? sellerHubPaths.overview : '/');
    navigate(dest, { replace: true });
  };

  const onChangePhone = () => {
    resetOtpSession();
    setCountdown(0);
    setMessage(null);
    form.setValue('otp', '');
    form.clearErrors('otp');
  };

  return (
    <AuthPageChrome>
      <Card className="w-full overflow-hidden rounded-lg border bg-white shadow-card">
        <CardHeader className="space-y-4 border-b border-primary/10 bg-white px-6 pb-4 pt-6 sm:px-6">
          <div className="space-y-3">
            <div>
              <CardTitle className="text-2xl text-[#27272a]">Đăng nhập</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Nhập số điện thoại và nhận OTP qua SMS. Sau khi xác thực, bạn sẽ được chuyển vào tài khoản.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 pt-2">
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-2.5">
              <p className="text-xs font-medium text-muted-foreground">Bước 1</p>
              <p className="mt-1 text-xs font-semibold text-[#27272a]">Nhập số điện thoại</p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-2.5">
              <p className="text-xs font-medium text-muted-foreground">Bước 2</p>
              <p className="mt-1 text-xs font-semibold text-[#27272a]">Nhận mã OTP</p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-2.5">
              <p className="text-xs font-medium text-muted-foreground">Bước 3</p>
              <p className="mt-1 text-xs font-semibold text-[#27272a]">Xác thực & vào chợ</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="font-medium text-primary underline-offset-4 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-6">
          {message ? <AuthFormMessage type={message.type} text={message.text} /> : null}

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
            <FormInput
              id="signin-phone"
              label="Số điện thoại"
              placeholder="0901234567"
              autoComplete="tel"
              disabled={!!confirmationResult}
              error={form.formState.errors.phone?.message}
              {...form.register('phone')}
            />

            <div
              id={RECAPTCHA_CONTAINER_ID}
              className={
                isRecaptchaVisible() && (!confirmationResult || countdown === 0)
                  ? 'flex min-h-[78px] justify-center py-2'
                  : 'hidden'
              }
            />

            {!confirmationResult || countdown === 0 ? (
              <>
                <Button type="button" variant="secondary" className="w-full" disabled={sending} onClick={onSendOtp}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi mã…
                    </>
                  ) : confirmationResult ? (
                    'Gửi lại mã OTP'
                  ) : (
                    'Gửi mã OTP'
                  )}
                </Button>
                {needsCaptchaCheck && !captchaVerified ? (
                  <p className="text-xs text-muted-foreground">Bạn cần tick "I'm not a robot" trước khi gửi OTP.</p>
                ) : null}
              </>
            ) : null}

            {confirmationResult ? (
              <>
                <FormInput
                  id="signin-otp"
                  label="Mã OTP"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6 chữ số"
                  autoComplete="one-time-code"
                  error={form.formState.errors.otp?.message}
                  {...form.register('otp')}
                />
                <Button type="button" className="w-full" disabled={verifying} onClick={() => void onVerifyOtp()}>
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực…
                    </>
                  ) : (
                    'Xác thực & đăng nhập'
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full" disabled={verifying} onClick={onChangePhone}>
                  Đổi số điện thoại
                </Button>
                {countdown > 0 ? (
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Gửi lại mã sau {countdown}s
                  </p>
                ) : null}
              </>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </AuthPageChrome>
  );
};

export default SignInForm;
