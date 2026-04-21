import { useState } from 'react';
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
import { usePhoneOtpAuth } from '@/hooks/usePhoneOtpAuth';
import { signInOtpSchema, smsOtpCodeSchema, type SignInOtpFormValues } from '@/lib/auth/authSchemas';
import { isRecaptchaVisible } from '@/lib/auth/recaptcha';

const RECAPTCHA_CONTAINER_ID = 'recaptcha-signin';

const SignInForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '/';

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { confirmationResult, sending, verifying, sendOtp, confirmOtp, resetOtpSession } = usePhoneOtpAuth(RECAPTCHA_CONTAINER_ID);

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
    const res = await sendOtp(values.phone);
    if (res.ok === false) {
      setErr(res.message);
      return;
    }
    setOk('Đã gửi mã OTP. Vui lòng kiểm tra tin nhắn.');
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
    setOk('Đăng nhập thành công.');
    navigate(nextPath, { replace: true });
  };

  return (
    <AuthPageChrome>
      <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl text-[#27272a]">Đăng nhập</CardTitle>
          <p className="text-sm text-muted-foreground">
            Đăng nhập bằng mã OTP gửi qua SMS.{' '}
            <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Chưa có tài khoản? Đăng ký
            </Link>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {message ? <AuthFormMessage type={message.type} text={message.text} /> : null}

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
            <FormInput
              id="signin-phone"
              label="Số điện thoại"
              placeholder="0901234567"
              autoComplete="tel"
              error={form.formState.errors.phone?.message}
              {...form.register('phone')}
            />

            <div
              id={RECAPTCHA_CONTAINER_ID}
              className={isRecaptchaVisible() ? 'flex min-h-[78px] justify-center py-2' : undefined}
            />

            <Button type="button" variant="secondary" className="w-full" disabled={sending} onClick={onSendOtp}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi mã…
                </>
              ) : (
                'Gửi mã OTP'
              )}
            </Button>

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
              </>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </AuthPageChrome>
  );
};

export default SignInForm;
