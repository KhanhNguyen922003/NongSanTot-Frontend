import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { ImagePlus, Loader2, Store } from "lucide-react";
import { auth } from "../../../firebase.config";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import { AuthPageChrome } from "@/components/auth/AuthPageChrome";
import { FormInput } from "@/components/form/FormInput";
import { VietnamAddressPicker } from "@/components/location/VietnamAddressPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/getApiErrorMessage";
import {
  uploadShopLogoAndGetUrl,
  validateShopLogoFile,
} from "@/lib/firebase/shopLogoStorage";
import { shopSchema, type ShopFormValues } from "@/lib/auth/authSchemas";
import { authPaths } from "@/constants/routes";
import { sellerHubPaths } from "@/constants/sellerHub";
import { queryKeys } from "@/constants/queryKeys";
import { queryClient } from "@/queries";
import { fetchAuthMe } from "@/queries/Auth/useAuth";
import { useCreateShopMutation } from "@/queries/shops/useCreateShop";
import { useMyShopsQuery } from "@/queries/shops/useMyShops";
import type { VietnamAdministrativeSelection } from "@/queries/VietNamProvinceAPI";
import useAuthStore from "@/stores/auth.store";

const SELLER_REGISTER_PATH = sellerHubPaths.shopSettings;

const CreateShopForm = () => {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState<User | null | "pending">(
    "pending",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [addressSelection, setAddressSelection] =
    useState<VietnamAdministrativeSelection | null>(null);

  const canQueryShops =
    typeof firebaseUser === "object" && firebaseUser !== null;
  const {
    data: myShops,
    isLoading: myShopsLoading,
    isError: myShopsError,
    error: myShopsErr,
  } = useMyShopsQuery(canQueryShops);
  const createShop = useCreateShopMutation();
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<ShopFormValues>({
    resolver: yupResolver(shopSchema) as Resolver<ShopFormValues>,
    defaultValues: { shopName: "", description: "", displayAddress: "" },
  });

  const logoPreviewUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile],
  );

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        navigate(`${authPaths.signIn}?next=${encodeURIComponent(SELLER_REGISTER_PATH)}`, {
          replace: true,
        });
      }
    });
    return () => unsub();
  }, [navigate]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setLogoError(null);

    if (!firebaseUser || firebaseUser === "pending") {
      setSubmitError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        setIsUploadingLogo(true);
        logoUrl = await uploadShopLogoAndGetUrl(firebaseUser.uid, logoFile);
      }

      await createShop.mutateAsync({
        name: values.shopName.trim(),
        description: values.description?.trim() || undefined,
        logo: logoUrl,
        displayAddress: values.displayAddress.trim(),
        province: addressSelection?.province?.name,
        ward: addressSelection?.ward?.name,
        detail: addressSelection?.detail.trim() || undefined,
      });

      const authMeData = await queryClient.fetchQuery({
        queryKey: queryKeys.authMe,
        queryFn: () => fetchAuthMe(),
      });
      setUser(authMeData.user);

      navigate(sellerHubPaths.overview);
    } catch (err) {
      const message = getApiErrorMessage(err);
      const fallbackMessage =
        message === "Unknown error" ? "Không thể tạo cửa hàng." : message;
      setSubmitError(fallbackMessage);
      if (logoFile) {
        setLogoError(fallbackMessage);
      }
    } finally {
      setIsUploadingLogo(false);
    }
  });

  const onChangeLogoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setLogoFile(null);
      setLogoError(null);
      return;
    }

    const validationError = validateShopLogoFile(file);
    if (validationError) {
      setLogoFile(null);
      setLogoError(validationError);
      return;
    }

    setLogoError(null);
    setLogoFile(file);
  };

  if (firebaseUser === "pending") {
    return (
      <AuthPageChrome>
        <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
          <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang kiểm tra đăng nhập…
          </CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  if (firebaseUser === null) {
    return (
      <AuthPageChrome>
        <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Đang chuyển đến trang đăng nhập…
          </CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  if (myShopsLoading) {
    return (
      <AuthPageChrome>
        <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
          <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải thông tin cửa hàng…
          </CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  if (myShopsError) {
    return (
      <AuthPageChrome>
        <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
          <CardContent className="space-y-3 py-6">
            <AuthFormMessage
              type="error"
              text={getApiErrorMessage(myShopsErr)}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void navigate(-1)}
            >
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  const existing = myShops;
  if (existing) {
    return (
      <AuthPageChrome>
        <Card className="w-full max-w-md rounded-lg border bg-white shadow-card">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 text-primary">
              <Store className="h-6 w-6" />
              <CardTitle className="text-xl text-[#27272a]">
                Cửa hàng của bạn
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Bạn đã có cửa hàng:{" "}
              <span className="font-medium text-foreground">
                {existing.name}
              </span>
              .
            </p>
            {!existing.isActive && (
              <p className="text-sm text-amber-800">
                Cửa hàng đang tạm ngưng hiển thị. Sửa trạng thái từ trang quản
                lý nếu cần.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={() => void navigate(sellerHubPaths.overview)}
            >
              Vào bảng điều khiển
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link
                to="/"
                className="text-primary underline-offset-4 hover:underline"
              >
                Quay về trang chủ
              </Link>
            </p>
          </CardContent>
        </Card>
      </AuthPageChrome>
    );
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-3xl rounded-lg border bg-white shadow-card">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Store className="h-6 w-6" />
            <CardTitle className="text-xl text-[#27272a]">
              Đăng ký bán hàng
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Tạo cửa hàng trên Nông Sản Tốt. Bạn đã đăng nhập; điền thông tin
            shop để tiếp tục.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {submitError ? (
              <AuthFormMessage type="error" text={submitError} />
            ) : null}
            <FormInput
              id="shop-name"
              label="Tên cửa hàng"
              placeholder="Vườn rau nhà Lan"
              error={form.formState.errors.shopName?.message}
              {...form.register("shopName")}
            />
            <FormInput
              id="shop-description"
              label="Mô tả cửa hàng (tùy chọn)"
              placeholder="Chuyên nông sản sạch, không thuốc trừ sâu,...."
              error={form.formState.errors.description?.message}
              {...form.register("description")}
            />
            <div className="space-y-2">
              <label
                htmlFor="shop-logo"
                className="flex items-center gap-2 text-sm font-medium text-[#27272a]"
              >
                <ImagePlus className="h-4 w-4 text-primary" />
                Logo cửa hàng (tùy chọn)
              </label>
              <Input
                id="shop-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onChangeLogoFile}
              />
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt="Xem trước logo"
                  className="h-20 w-20 rounded-md border object-cover"
                />
              ) : null}
              {logoError ? (
                <p className="text-xs text-red-600">{logoError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ảnh JPG/PNG/WEBP, tối đa 3MB. Ảnh sẽ được lưu trên
                  Cloudinary.
                </p>
              )}
            </div>
            <VietnamAddressPicker
              label="Địa chỉ hiển thị"
              description="Chọn tỉnh, huyện, xã rồi nhập thêm địa chỉ chi tiết để tạo chuỗi hiển thị cho cửa hàng."
              error={form.formState.errors.displayAddress?.message}
              onChange={(value) => {
                setAddressSelection(value);
                form.setValue("displayAddress", value.displayAddress, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={
                form.formState.isSubmitting ||
                createShop.isPending ||
                isUploadingLogo
              }
            >
              {form.formState.isSubmitting ||
              createShop.isPending ||
              isUploadingLogo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingLogo ? "Đang tải logo…" : "Đang gửi…"}
                </>
              ) : (
                "Tạo cửa hàng"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link
                to="/"
                className="text-primary underline-offset-4 hover:underline"
              >
                Quay về trang chủ
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateShopForm;
