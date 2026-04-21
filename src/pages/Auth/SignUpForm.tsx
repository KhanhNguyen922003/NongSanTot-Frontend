import { useState } from "react";
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
import { isRecaptchaVisible } from "@/lib/auth/recaptcha";

const RECAPTCHA_CONTAINER_ID = "recaptcha-signup";

const SignUpForm = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const {
    confirmationResult,
    sending,
    verifying,
    sendOtp,
    confirmOtp,
    resetOtpSession,
  } = usePhoneOtpAuth(RECAPTCHA_CONTAINER_ID);

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
    const res = await sendOtp(values.phone);
    if (res.ok === false) {
      setErr(res.message);
      return;
    }
    setOk("Đã gửi mã OTP. Vui lòng kiểm tra tin nhắn.");
  });

  const onVerifyComplete = async () => {
    setMessage(null);
    try {
      await smsOtpCodeSchema.validate({ otp: getValues("otp") });
    } catch (e) {
      console.log("error 0", e);
      if (e instanceof yup.ValidationError) {
        console.log("error 1", e.errors);
        setError("otp", { message: e.errors[0] ?? "Mã OTP không hợp lệ" });
      }
      return;
    }
    const res = await confirmOtp(getValues("otp") ?? "");
    console.log("res", res);
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

    console.log("auth.currentUser", auth.currentUser);
    setOk("Đăng ký thành công.");
    navigate("/", { replace: true });
  };

  return (
    <AuthPageChrome>
      <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl text-[#27272a]">Đăng ký</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tạo tài khoản bằng số điện thoại và mã OTP (Firebase).{" "}
            <Link
              to="/signin"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {message ? (
            <AuthFormMessage type={message.type} text={message.text} />
          ) : null}

          <div className="space-y-4">
            <form className="space-y-4" onSubmit={onSendOtp} noValidate>
              <FormInput
                id="su-name"
                label="Tên hiển thị (tùy chọn)"
                placeholder="Nguyễn Văn A"
                error={errors.fullName?.message}
                {...register("fullName")}
              />
              <FormInput
                id="su-phone"
                label="Số điện thoại"
                placeholder="0901234567"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <div
                id={RECAPTCHA_CONTAINER_ID}
                className={
                  isRecaptchaVisible()
                    ? "flex min-h-[78px] justify-center py-2"
                    : undefined
                }
              />

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
                ) : (
                  "Gửi mã OTP"
                )}
              </Button>
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
              </div>
            ) : null}
          </div>

          <p className="border-t pt-4 text-center text-xs text-muted-foreground">
            Muốn mở cửa hàng bán nông sản? Sau khi đăng nhập, dùng{" "}
            <Link
              to="/seller/register"
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
