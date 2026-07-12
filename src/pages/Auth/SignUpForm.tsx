import { useState, useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { auth } from "../../../firebase.config";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import { AuthPageChrome } from "@/components/auth/AuthPageChrome";
import { FormInput } from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhoneOtpAuth } from "@/hooks/usePhoneOtpAuth";
import {
  signUpSchema,
  smsOtpCodeSchema,
  type SignUpFormValues,
} from "@/lib/auth/authSchemas";
import { getRecaptchaWidgetSize, isRecaptchaVisible } from "@/lib/auth/recaptcha";
import { queryKeys } from "@/constants/queryKeys";
import { queryClient } from "@/queries";
import { fetchAuthMe, fetchPhoneExists } from "@/queries/Auth/useAuth";
import useAuthStore from "@/stores/auth.store";

const RECAPTCHA_CONTAINER_ID = "recaptcha-signup";

const SignUpForm = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const {
    confirmationResult,
    sending,
    verifying,
    sendOtp,
    confirmOtp,
    resetOtpSession,
    captchaVerified,
  } = usePhoneOtpAuth(RECAPTCHA_CONTAINER_ID);
  const needsCaptchaCheck = getRecaptchaWidgetSize() === "normal";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    defaultValues: {
      fullName: "",
      phone: "",
      otp: "",
    },
    resolver: yupResolver(signUpSchema) as Resolver<SignUpFormValues>,
  });

  const setErr = (text: string) => setMessage({ type: "error", text });
  const setOk = (text: string) => setMessage({ type: "success", text });

  const onSendOtp = handleSubmit(async (values) => {
    setMessage(null);
    setValue("otp", "");
    resetOtpSession();

    const phoneExists = await fetchPhoneExists(values.phone);
    if (phoneExists) {
      setError("phone", {
        type: "manual",
        message: "Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.",
      });
      return;
    }

    if (needsCaptchaCheck && !captchaVerified) {
      setErr("Vui lòng hoàn tất reCAPTCHA trước khi gửi OTP.");
      return;
    }
    const res = await sendOtp(values.phone);
    if (res.ok === false) {
      setErr(res.message);
      return;
    }
    setOk("Đã gửi mã OTP. Vui lòng kiểm tra tin nhắn.");
    setCountdown(60);
  });

  const onVerifyComplete = async () => {
    setMessage(null);
    try {
      await smsOtpCodeSchema.validate({ otp: getValues("otp") });
    } catch (e) {
      if (e instanceof yup.ValidationError) {
        setError("otp", { message: e.errors[0] ?? "Mã OTP không hợp lệ" });
      }
      return;
    }
    const res = await confirmOtp(getValues("otp") ?? "");
    if (res.ok === false) {
      setErr(
        res.message.includes("(auth/invalid-verification-code)")
          ? "Mã OTP không hợp lệ. Vui lòng kiểm tra lại."
          : res.message,
      );
      return;
    }
    if (!auth.currentUser) {
      setErr("Không lấy được phiên đăng nhập sau OTP.");
      return;
    }
    const name = getValues("fullName")?.trim();
    if (name) {
      try {
        await updateProfile(auth.currentUser, { displayName: name });
      } catch (err) {
        const e = err as Error;
        setErr(e.message || "Không cập nhật được tên hiển thị.");
        return;
      }
    }

    const authMeData = await queryClient.fetchQuery({
      queryKey: queryKeys.authMe,
      queryFn: () => fetchAuthMe('signup'),
    });
    useAuthStore.getState().setUser(authMeData.user);
    setOk("Đăng ký thành công.");
    navigate("/", { replace: true });
  };

  const onChangePhone = () => {
    resetOtpSession();
    setCountdown(0);
    setMessage(null);
    setValue("otp", "");
    setError("otp", { message: undefined });
  };

  return (
    <AuthPageChrome>
      <Card className="w-full overflow-hidden rounded-lg border bg-white shadow-card">
        <CardHeader className="space-y-4 border-b border-primary/10 bg-white px-6 pb-4 pt-6 sm:px-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Tạo tài khoản mới
            </div>
            <div>
              <CardTitle className="text-2xl text-[#27272a]">Đăng ký</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Điền tên và số điện thoại, rồi xác thực qua OTP để mở tài khoản trong vài giây.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 pt-2">
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-2.5">
              <p className="text-xs font-medium text-muted-foreground">Bước 1</p>
              <p className="mt-1 text-xs font-semibold text-[#27272a]">Nhập thông tin</p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-2.5">
              <p className="text-xs font-medium text-muted-foreground">Bước 2</p>
              <p className="mt-1 text-xs font-semibold text-[#27272a]">Nhận OTP qua SMS</p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-2.5">
              <p className="text-xs font-medium text-muted-foreground">Bước 3</p>
              <p className="mt-1 text-xs font-semibold text-[#27272a]">Xác nhận & bắt đầu</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link
              to="/dang-nhap"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-6">
          {message ? (
            <AuthFormMessage type={message.type} text={message.text} />
          ) : null}

          <div className="space-y-4">
            <form className="space-y-4" onSubmit={onSendOtp} noValidate>
              <FormInput
                id="su-name"
                label="Tên hiển thị (tùy chọn)"
                placeholder="Nguyễn Văn A"
                disabled={!!confirmationResult}
                error={errors.fullName?.message}
                {...register("fullName")}
              />
              <FormInput
                id="su-phone"
                label="Số điện thoại"
                placeholder="0901234567"
                autoComplete="tel"
                disabled={!!confirmationResult}
                error={errors.phone?.message}
                {...register("phone")}
              />

              <div
                id={RECAPTCHA_CONTAINER_ID}
                className={
                  isRecaptchaVisible() && (!confirmationResult || countdown === 0)
                    ? "flex min-h-[78px] justify-center py-2"
                    : "hidden"
                }
              />

              {!confirmationResult || countdown === 0 ? (
                <>
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi mã…
                      </>
                    ) : confirmationResult ? (
                      "Gửi lại mã OTP"
                    ) : (
                      "Gửi mã OTP"
                    )}
                  </Button>
                  {needsCaptchaCheck && !captchaVerified ? (
                    <p className="text-xs text-muted-foreground">
                      Bạn cần tick "I'm not a robot" trước khi gửi OTP.
                    </p>
                  ) : null}
                </>
              ) : null}
            </form>

            {confirmationResult ? (
              <div className="space-y-4 border-t pt-4">
                <FormInput
                  id="su-otp"
                  label="Mã OTP"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6 chữ số"
                  autoComplete="one-time-code"
                  error={errors.otp?.message}
                  {...register("otp")}
                />
                <Button
                  type="button"
                  className="w-full"
                  disabled={verifying}
                  onClick={() => void onVerifyComplete()}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực…
                    </>
                  ) : (
                    "Xác thực OTP & hoàn tất"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  disabled={verifying} 
                  onClick={onChangePhone}
                >
                  Sửa lại thông tin đăng ký
                </Button>
                {countdown > 0 ? (
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Gửi lại mã sau {countdown}s
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <p className="border-t pt-4 text-center text-xs text-muted-foreground">
            Muốn mở cửa hàng bán nông sản? Sau khi đăng nhập, dùng{" "}
            <Link
              to="/dang-ky-ban-hang"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Đăng ký bán hàng
            </Link>{" "}
            trên trang chủ.
          </p>
        </CardContent>
      </Card>
    </AuthPageChrome>
  );
};

export default SignUpForm;
