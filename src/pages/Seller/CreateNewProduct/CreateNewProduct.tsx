import { useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { auth } from "../../../../firebase.config";
import ghtkLogo from "@/assets/Logo-GHTK-Slogan.webp";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import AddressSelect2, { type AddressSelection } from "@/components/common/AddressSelect2";
import DropzoneUpload, { type UploadedFile } from "@/components/common/Dropzone";
import ShippingServiceSelect from "@/components/common/ShippingServiceSelect";
import { FormInput } from "@/components/form/FormInput";
import { FormInputCurrency } from "@/components/form/FormInputCurrency";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SellerCreateProductOnboarding,
  hasSeenSellerCreateProductOnboarding,
} from "@/components/seller/SellerCreateProductOnboarding";
import { sellerHubPaths } from "@/constants/sellerHub";
import { getApiErrorMessage } from "@/core/api/getApiErrorMessage";
import { useCategoriesQuery } from "@/queries/categories/useCategories";
import { useCreateProductMutation } from "@/queries/products/useCreateProduct";
import { useMyShopsQuery } from "@/queries/shops/useMyShops";
import { ProductFormValues, productSchema, shippingOptions, unitOptions } from "./helper";

const SIGNIN_PATH = "/dang-nhap";
const STEP_LABELS = ["Thông tin cơ bản", "Ảnh / video", "Nhật ký (tuỳ chọn)", "Giao hàng & gửi bài"] as const;

const CreateNewProduct = () => {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState<User | null | "pending">("pending");
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedShippingServiceId, setSelectedShippingServiceId] = useState<string>("1");
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const createProduct = useCreateProductMutation();
  const { data: categories = [] } = useCategoriesQuery();

  const canQueryShops = typeof firebaseUser === "object" && firebaseUser !== null;
  const { data: myShops, isLoading: myShopsLoading, isError: myShopsError } = useMyShopsQuery(canQueryShops);

  const form = useForm<ProductFormValues>({
    resolver: yupResolver(productSchema) as Resolver<ProductFormValues>,
    mode: "onBlur",
    defaultValues: {
      categoryId: "",
      name: "",
      description: "",
      origin: "",
      price: 0,
      stock: 0,
      unit: "kg",
      mediaFiles: [],
      shippingMethods: ["GHTK"],
      pickupAddressDisplay: "",
      pickupReceiverName: "",
      pickupReceiverPhone: "",
      preferredShippingServiceId: "1",
      growthDiary: [],
    },
  });

  const diaryFieldArray = useFieldArray({
    control: form.control,
    name: "growthDiary",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        navigate(`${SIGNIN_PATH}?next=${encodeURIComponent("/dang-tin-san-pham")}`, {
          replace: true,
        });
      }
    });
    return () => unsub();
  }, [navigate]);

  const selectedShop = useMemo(() => myShops || null, [myShops]);
  const selectedShippingMethod = form.watch("shippingMethods")?.[0];

  useEffect(() => {
    if (!selectedShop || hasSeenSellerCreateProductOnboarding()) return;
    setOnboardingOpen(true);
  }, [selectedShop]);

  useEffect(() => {
    if (selectedShippingMethod !== "GHTK") return;
    const cur = form.getValues("preferredShippingServiceId");
    if (!cur) {
      form.setValue("preferredShippingServiceId", "1", { shouldValidate: true });
      setSelectedShippingServiceId("1");
    }
  }, [selectedShippingMethod, form]);

  const updatePickupAddress = (address: AddressSelection) => {
    form.setValue("pickupAddressDisplay", address.displayAddress, { shouldValidate: true });
    form.setValue("pickupReceiverName", address.receiverName, { shouldValidate: true });
    form.setValue("pickupReceiverPhone", address.receiverPhone, { shouldValidate: true });
  };

  const validateCurrentStep = async () => {
    if (currentStep === 0) return form.trigger(["categoryId", "name", "description", "origin", "price", "stock", "unit"]);
    if (currentStep === 1) return form.trigger(["mediaFiles"]);
    if (currentStep === 2) {
      const rows = form.getValues("growthDiary") ?? [];
      if (rows.length === 0) return true;
      return form.trigger(["growthDiary"]);
    }
    if (form.getValues("shippingMethods")?.[0] === "GHTK") {
      return form.trigger([
        "shippingMethods",
        "pickupAddressDisplay",
        "pickupReceiverName",
        "pickupReceiverPhone",
        "preferredShippingServiceId",
      ]);
    }
    return form.trigger([
      "shippingMethods",
      "pickupAddressDisplay",
      "pickupReceiverName",
      "pickupReceiverPhone",
    ]);
  };

  const moveNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;
    setCurrentStep((prev) => Math.min(prev + 1, STEP_LABELS.length - 1));
  };

  const moveBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const skipDiaryAndContinue = () => {
    form.setValue("growthDiary", [], { shouldValidate: true });
    diaryFieldArray.replace([]);
    form.clearErrors("growthDiary");
    setCurrentStep(3);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!selectedShop) {
      setSubmitMessage({ type: "error", text: "Bạn cần có cửa hàng trước khi đăng sản phẩm." });
      return;
    }

    const payload = {
      categoryId: values.categoryId || undefined,
      name: values.name.trim(),
      description: values.description.trim(),
      origin: values.origin.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
      unit: values.unit.trim(),
      images: values.mediaFiles.filter((item) => item.type === "image").map((item) => item.url),
      videos: values.mediaFiles.filter((item) => item.type === "video").map((item) => item.url),
      shippingMethods: values.shippingMethods.slice(0, 1),
      pickupAddress: {
        displayAddress: values.pickupAddressDisplay,
        receiverName: values.pickupReceiverName,
        receiverPhone: values.pickupReceiverPhone,
      },
      preferredShippingServiceId:
        values.shippingMethods[0] === "GHTK" && values.preferredShippingServiceId
          ? Number(values.preferredShippingServiceId)
          : undefined,
      isAvailable: true,
      growthDiary:
        values.growthDiary.length > 0
          ? values.growthDiary.map((item) => ({
              stageName: item.stageName.trim(),
              logDate: item.logDate,
              description: item.description?.trim() || null,
              images: item.mediaFiles.filter((media) => media.type === "image").map((media) => media.url),
            }))
          : undefined,
    };

    try {
      const created = await createProduct.mutateAsync(payload);
      setSubmitMessage(null);
      setCreatedProductId(created.id);
    } catch (error) {
      setSubmitMessage({ type: "error", text: getApiErrorMessage(error, "Không thể tạo sản phẩm.") });
    }
  });

  if (firebaseUser === "pending" || myShopsLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang chuẩn bị màn hình đăng sản phẩm...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (firebaseUser === null) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Đang chuyển tới trang đăng nhập...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (myShopsError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <AuthFormMessage type="error" text="Không thể tải thông tin cửa hàng. Vui lòng thử lại." />
      </div>
    );
  }

  if (!selectedShop) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bạn chưa có cửa hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Hãy tạo cửa hàng trước khi đăng sản phẩm mới.
            </p>
            <Button asChild className="w-full">
              <Link to="/dang-ky-ban-hang">Tạo cửa hàng</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentStep + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-28">
      <Card className="rounded-lg border bg-white shadow-card">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl text-[#27272a]">Đăng sản phẩm mới</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cửa hàng: <span className="font-medium text-foreground">{selectedShop.name}</span>. Điền đủ các bước bên dưới rồi gửi bài — bài sẽ chờ duyệt trước khi lên chợ.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Bước {currentStep + 1}/{STEP_LABELS.length}</span>
              <span>{STEP_LABELS[currentStep]}</span>
            </div>
            <div className="h-2 overflow-hidden rounded bg-slate-100">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {submitMessage ? <AuthFormMessage type={submitMessage.type} text={submitMessage.text} /> : null}

            {currentStep === 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Controller
                    name="categoryId"
                    control={form.control}
                    render={({ field }) => (
                      <FormSelect
                        id="categoryId"
                        label="Danh mục"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={categories.map((item) => ({ value: item.id, label: item.name }))}
                        placeholder="Chọn danh mục"
                        error={form.formState.errors.categoryId?.message}
                      />
                    )}
                  />
                  <Controller
                    name="unit"
                    control={form.control}
                    render={({ field }) => (
                      <FormSelect
                        id="unit"
                        label="Đơn vị tính"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={unitOptions}
                        placeholder="Chọn đơn vị tính"
                        error={form.formState.errors.unit?.message}
                      />
                    )}
                  />
                </div>

                <FormInput
                  id="name"
                  label="Tên sản phẩm"
                  placeholder="Ví dụ: Bơ sáp Đắk Lắk loại 1"
                  error={form.formState.errors.name?.message}
                  {...form.register("name")}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormInput
                    id="origin"
                    label="Xuất xứ"
                    placeholder="Đắk Lắk"
                    error={form.formState.errors.origin?.message}
                    {...form.register("origin")}
                  />
                  <Controller
                    name="price"
                    control={form.control}
                    render={({ field }) => (
                      <FormInputCurrency
                        id="price"
                        label="Giá (VND)"
                        value={Number(field.value || 0)}
                        onValueChange={field.onChange}
                        error={form.formState.errors.price?.message}
                        placeholder="Nhập giá bán"
                      />
                    )}
                  />
                  <FormInput
                    id="stock"
                    label="Số lượng đang bán"
                    type="number"
                    min={0}
                    step="0.1"
                    error={form.formState.errors.stock?.message}
                    {...form.register("stock")}
                  />
                </div>

                <FormTextarea
                  id="description"
                  label="Mô tả sản phẩm"
                  rows={6}
                  placeholder="Mô tả chi tiết nguồn gốc, chất lượng, cách bảo quản, chứng nhận..."
                  error={form.formState.errors.description?.message}
                  {...form.register("description")}
                />
              </>
            ) : null}

            {currentStep === 1 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#27272a]">Hình ảnh / video sản phẩm</label>
                <Controller
                  name="mediaFiles"
                  control={form.control}
                  render={({ field }) => (
                    <DropzoneUpload
                      displayType="IMAGE AND VIDEO"
                      maxFiles={8}
                      isHavingCover
                      defaultFiles={field.value as UploadedFile[]}
                      onChange={field.onChange}
                    />
                  )}
                />
                {form.formState.errors.mediaFiles ? (
                  <p className="text-xs text-red-600">{form.formState.errors.mediaFiles.message as string}</p>
                ) : null}
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#27272a]">Nhật ký canh tác (tuỳ chọn)</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Thêm ảnh theo từng giai đoạn giúp khách yên tâm hơn. Không có cũng vẫn đăng bài được.
                    </p>
                  </div>
                  <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={skipDiaryAndContinue}>
                    Bỏ qua bước này
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    diaryFieldArray.append({ stageName: "", logDate: "", description: "", mediaFiles: [] })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm một giai đoạn
                </Button>

                {diaryFieldArray.fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Bạn có thể nhấn &quot;Tiếp tục&quot; để sang bước giao hàng, hoặc thêm giai đoạn ở trên.
                  </p>
                ) : null}

                {diaryFieldArray.fields.map((item, index) => (
                  <div key={item.id} className="space-y-3 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Giai đoạn {index + 1}</p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => diaryFieldArray.remove(index)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                    <FormInput
                      id={`growthDiary-stage-${index}`}
                      label="Tên giai đoạn"
                      placeholder="Tên giai đoạn (VD: Ươm mầm)"
                      error={form.formState.errors.growthDiary?.[index]?.stageName?.message}
                      {...form.register(`growthDiary.${index}.stageName`)}
                    />
                    <FormInput
                      id={`growthDiary-date-${index}`}
                      label="Thời điểm giai đoạn"
                      type="date"
                      error={form.formState.errors.growthDiary?.[index]?.logDate?.message}
                      {...form.register(`growthDiary.${index}.logDate`)}
                    />
                    <FormTextarea
                      id={`growthDiary-description-${index}`}
                      label="Mô tả"
                      rows={3}
                      placeholder="Mô tả quá trình chăm sóc..."
                      error={form.formState.errors.growthDiary?.[index]?.description?.message}
                      {...form.register(`growthDiary.${index}.description`)}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#27272a]">Ảnh giai đoạn</label>
                      <Controller
                        name={`growthDiary.${index}.mediaFiles`}
                        control={form.control}
                        render={({ field }) => (
                          <DropzoneUpload
                            displayType="IMAGE"
                            maxFiles={5}
                            defaultFiles={field.value as UploadedFile[]}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      {form.formState.errors.growthDiary?.[index]?.mediaFiles ? (
                        <p className="text-xs text-red-600">
                          {form.formState.errors.growthDiary?.[index]?.mediaFiles?.message as string}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {currentStep === 3 ? (
              <>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[#27272a]">Cách giao hàng</p>
                  <Controller
                    name="shippingMethods"
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {shippingOptions.map((method) => {
                          const checked = field.value?.[0] === method.id;
                          return (
                            <label
                              key={method.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition ${
                                checked ? "border-primary bg-primary/5" : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="shippingMethod"
                                checked={checked}
                                onChange={() => {
                                  field.onChange([method.id]);
                                  if (method.id !== "GHTK") {
                                    setSelectedShippingServiceId("");
                                    form.setValue("preferredShippingServiceId", "");
                                  }
                                }}
                              />
                              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                <span>{method.label}</span>
                                {method.id === "GHTK" ? (
                                  <img src={ghtkLogo} alt="GHTK" className="h-5 w-auto object-contain" />
                                ) : null}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  />
                  {form.formState.errors.shippingMethods ? (
                    <p className="text-xs text-red-600">{form.formState.errors.shippingMethods.message as string}</p>
                  ) : null}
                </div>

                <AddressSelect2 onChange={updatePickupAddress} />
                {form.formState.errors.pickupAddressDisplay ? (
                  <p className="text-xs text-red-600">{form.formState.errors.pickupAddressDisplay.message}</p>
                ) : null}

                {selectedShippingMethod === "GHTK" ? (
                  <Controller
                    name="preferredShippingServiceId"
                    control={form.control}
                    render={({ field }) => (
                      <ShippingServiceSelect
                        value={field.value || selectedShippingServiceId}
                        onSelectService={(service) => {
                          const nextValue = String(service.serviceId);
                          setSelectedShippingServiceId(nextValue);
                          field.onChange(nextValue);
                        }}
                      />
                    )}
                  />
                ) : (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-muted-foreground">
                    Bạn chọn <span className="font-medium text-foreground">tự giao cho khách</span>. Phần chọn dịch vụ GHTK
                    không dùng ở bước này.
                  </div>
                )}

                <div className="rounded-lg border bg-slate-50 p-4 text-sm">
                  <p className="mb-2 font-medium text-[#27272a]">Xem nhanh trước khi đăng</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>- Tên: {form.watch("name") || "Chưa nhập"}</li>
                    <li>- Giá: {Number(form.watch("price") || 0).toLocaleString("vi-VN")} VND</li>
                    <li>- Ảnh / video: {form.watch("mediaFiles")?.length || 0} tệp</li>
                    <li>- Nhật ký: {form.watch("growthDiary")?.length ? `${form.watch("growthDiary")?.length} giai đoạn` : "Không thêm"}</li>
                  </ul>
                </div>
              </>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:flex-nowrap sm:gap-3 sm:px-4 sm:py-3">
          <Button type="button" variant="outline" size="sm" className="shrink-0 text-xs sm:text-sm" onClick={() => void navigate(sellerHubPaths.overview)}>
            Về trang quản lý
          </Button>
          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-initial sm:gap-3">
            <Button type="button" variant="outline" size="sm" className="text-xs sm:text-sm" onClick={moveBack} disabled={currentStep === 0}>
              Quay lại
            </Button>
            {currentStep < STEP_LABELS.length - 1 ? (
              <Button type="button" size="sm" className="text-xs sm:text-sm" onClick={() => void moveNext()}>
                Tiếp tục
              </Button>
            ) : (
              <Button type="button" size="sm" className="text-xs sm:text-sm" onClick={() => void onSubmit()} disabled={form.formState.isSubmitting || createProduct.isPending}>
                {form.formState.isSubmitting || createProduct.isPending ? "Đang tạo..." : "Đăng sản phẩm"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <SellerCreateProductOnboarding open={onboardingOpen} onOpenChange={setOnboardingOpen} />

      <Dialog
        open={!!createdProductId}
        onOpenChange={(open) => {
          if (!open) setCreatedProductId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đã gửi bài đăng</DialogTitle>
            <DialogDescription className="text-left text-sm">
              Bài của bạn đang chờ duyệt. Khi được duyệt, sản phẩm sẽ hiện trên chợ cho người mua.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" asChild>
              <Link to={sellerHubPaths.overview}>Về trang quản lý</Link>
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to={sellerHubPaths.products}>Danh sách sản phẩm</Link>
            </Button>
            {createdProductId ? (
              <Button type="button" asChild>
                <Link to={`/san-pham/${createdProductId}`}>Xem trang sản phẩm</Link>
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateNewProduct;
