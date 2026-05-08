import { useEffect, useMemo, useState } from "react";
import { Edit2, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { VietnamAddressPicker } from "@/components/location/VietnamAddressPicker";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/stores/auth.store";
import {
  useAddressesByUserQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from "@/queries/addresses/useAddresses";
import type { Address, AddressBody } from "@/queries/addresses/types";
import type { VietnamAdministrativeSelection } from "@/queries/VietNamProvinceAPI";

export type AddressSelection = {
  id?: string;
  receiverName: string;
  receiverPhone: string;
  displayAddress: string;
  province?: string;
  ward?: string;
  detail?: string;
};

type AddressSelect2Props = {
  onChange: (value: AddressSelection) => void;
  isShowTitle?: boolean;
  userId?: string;
};

type AddressFormState = {
  label: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  ward: string;
  detail: string;
  displayAddress: string;
};

const emptyForm: AddressFormState = {
  label: "",
  receiverName: "",
  receiverPhone: "",
  province: "",
  ward: "",
  detail: "",
  displayAddress: "",
};

const buildDisplayAddress = (address: Pick<Address, "detail" | "ward" | "province">) =>
  [address.detail, address.ward, address.province].filter(Boolean).join(", ");

const toSelection = (address: Address): AddressSelection => ({
  id: address.id,
  receiverName: address.receiverName,
  receiverPhone: address.receiverPhone,
  displayAddress: buildDisplayAddress(address),
  province: address.province,
  ward: address.ward,
  detail: address.detail,
});

const toFormState = (address: Address): AddressFormState => ({
  label: address.label ?? "",
  receiverName: address.receiverName,
  receiverPhone: address.receiverPhone,
  province: address.province,
  ward: address.ward,
  detail: address.detail,
  displayAddress: buildDisplayAddress(address),
});

const AddressSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 rounded-md border bg-slate-50 p-3">
        <div className="h-4 w-4 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-3 w-64 max-w-full rounded bg-slate-200" />
        </div>
      </div>
    ))}
  </div>
);

const AddressSelect2 = ({ onChange, isShowTitle = true, userId: userIdProp }: AddressSelect2Props) => {
  const currentUser = useAuthStore((state) => state.user);
  const userId = userIdProp ?? currentUser?.id ?? null;
  const { data: addresses, isLoading, isError } = useAddressesByUserQuery(userId);
  const createAddress = useCreateAddressMutation(userId);
  const updateAddress = useUpdateAddressMutation(userId);
  const deleteAddress = useDeleteAddressMutation(userId);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formState, setFormState] = useState<AddressFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const isMutating = createAddress.isPending || updateAddress.isPending || deleteAddress.isPending;

  const selectedAddress = useMemo(
    () => addresses?.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  useEffect(() => {
    if (!selectedAddressId && addresses?.length) {
      const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      setSelectedAddressId(defaultAddress.id);
      onChange(toSelection(defaultAddress));
    }
  }, [addresses, onChange, selectedAddressId]);

  const resetForm = () => {
    setEditingAddress(null);
    setFormState(emptyForm);
    setFormError(null);
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setShowForm(false);
    resetForm();
    onChange(toSelection(address));
  };

  const handleShowAddNew = () => {
    setSelectedAddressId(null);
    setShowForm(true);
    resetForm();
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddressId(null);
    setShowForm(true);
    setEditingAddress(address);
    setFormError(null);
    setFormState(toFormState(address));
  };

  const handleAddressPickerChange = (selection: VietnamAdministrativeSelection) => {
    setFormState((prev) => ({
      ...prev,
      province: selection.province?.name ?? prev.province,
      ward: selection.ward?.name ?? prev.ward,
      detail: selection.detail,
      displayAddress: selection.displayAddress,
    }));
  };

  const validateForm = () => {
    if (!userId) return "Bạn cần đăng nhập để lưu địa chỉ.";
    if (!formState.receiverName.trim()) return "Vui lòng nhập tên người nhận.";
    if (!formState.receiverPhone.trim()) return "Vui lòng nhập số điện thoại.";
    if (!formState.province.trim()) return "Vui lòng chọn tỉnh/thành phố.";
    if (!formState.ward.trim()) return "Vui lòng chọn xã/phường.";
    if (!formState.detail.trim()) return "Vui lòng nhập địa chỉ chi tiết.";
    return null;
  };

  const buildBody = (): AddressBody => ({
    userId: userId ?? "",
    label: formState.label.trim() || "Địa chỉ",
    receiverName: formState.receiverName.trim(),
    receiverPhone: formState.receiverPhone.trim(),
    province: formState.province.trim(),
    ward: formState.ward.trim(),
    detail: formState.detail.trim(),
    isDefault: addresses?.length === 0,
  });

  const handleSaveAddress = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    const body = buildBody();
    const savedAddress = editingAddress
      ? await updateAddress.mutateAsync({ id: editingAddress.id, body })
      : await createAddress.mutateAsync(body);
    setSelectedAddressId(savedAddress.id);
    onChange(toSelection(savedAddress));
    setShowForm(false);
    resetForm();
  };

  const handleDeleteAddress = async (address: Address) => {
    const confirmed = window.confirm("Bạn có chắc muốn xoá địa chỉ này?");
    if (!confirmed) return;
    await deleteAddress.mutateAsync(address.id);
    if (selectedAddressId === address.id) {
      setSelectedAddressId(null);
    }
  };

  return (
    <div className="relative space-y-4 rounded-lg border bg-white p-4">
      {isMutating ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : null}

      {isShowTitle ? (
        <div className="inline-flex items-center gap-2 text-sm font-medium text-[#27272a]">
          <MapPin className="h-4 w-4 text-primary" />
          Địa chỉ của bạn
        </div>
      ) : null}

      {!userId ? <AuthFormMessage type="error" text="Bạn cần đăng nhập để chọn địa chỉ." /> : null}
      {isError ? <AuthFormMessage type="error" text="Không thể tải danh sách địa chỉ." /> : null}
      {formError ? <AuthFormMessage type="error" text={formError} /> : null}

      {isLoading ? (
        <AddressSkeleton />
      ) : (
        <div className="space-y-3">
          {addresses?.map((address) => {
            const isSelected = selectedAddressId === address.id;
            return (
              <div
                key={address.id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                  isSelected ? "border-primary bg-primary/5" : "bg-slate-50 hover:bg-slate-100"
                }`}
                onClick={() => handleSelectAddress(address)}
              >
                <input
                  type="radio"
                  name="address"
                  checked={isSelected}
                  readOnly
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-[#27272a]">
                    {address.receiverName} - {address.receiverPhone}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{buildDisplayAddress(address)}</p>
                  {address.label ? <p className="mt-1 text-xs text-primary">{address.label}</p> : null}
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleEditAddress(address);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDeleteAddress(address);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary">
        <input
          type="radio"
          name="address"
          checked={showForm && !selectedAddress}
          onChange={handleShowAddNew}
        />
        <Plus className="h-4 w-4" />
        Sử dụng địa chỉ mới
      </label>

      {showForm ? (
        <div className="space-y-4 rounded-lg bg-slate-50 p-4">
          <div className="font-semibold text-[#27272a]">
            {editingAddress ? "Chỉnh sửa địa chỉ" : "Sử dụng địa chỉ mới"}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#27272a]">Nhãn địa chỉ</label>
              <Input
                value={formState.label}
                onChange={(event) => setFormState((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="Ví dụ: Vườn nhà, kho lấy hàng..."
              />
            </div>
            <div />
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#27272a]">Người nhận</label>
              <Input
                value={formState.receiverName}
                onChange={(event) => setFormState((prev) => ({ ...prev, receiverName: event.target.value }))}
                placeholder="Tên người nhận hàng"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#27272a]">Số điện thoại</label>
              <Input
                value={formState.receiverPhone}
                onChange={(event) => setFormState((prev) => ({ ...prev, receiverPhone: event.target.value }))}
                placeholder="Số điện thoại nhận hàng"
              />
            </div>
          </div>

          {editingAddress ? (
            <div className="rounded-md border bg-white px-3 py-2 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Địa chỉ hiện tại</p>
              <p className="mt-1">{formState.displayAddress || buildDisplayAddress(editingAddress)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Chọn lại bên dưới nếu muốn đổi địa giới.</p>
            </div>
          ) : null}

          <VietnamAddressPicker
            label="Địa chỉ"
            description="Chọn tỉnh/xã và nhập địa chỉ chi tiết. Không dùng quận/huyện theo địa giới mới."
            onChange={handleAddressPickerChange}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void handleSaveAddress()} disabled={isMutating}>
              {editingAddress ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AddressSelect2;
