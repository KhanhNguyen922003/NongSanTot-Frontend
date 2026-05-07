import { useState } from "react";
import { MapPin } from "lucide-react";
import { VietnamAddressPicker } from "@/components/location/VietnamAddressPicker";
import { Input } from "@/components/ui/input";

export type AddressSelection = {
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
};

const AddressSelect2 = ({ onChange, isShowTitle = true }: AddressSelect2Props) => {
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [displayAddress, setDisplayAddress] = useState("");
  const [province, setProvince] = useState<string | undefined>();
  const [ward, setWard] = useState<string | undefined>();
  const [detail, setDetail] = useState<string | undefined>();

  const emitChange = (next: Partial<AddressSelection>) => {
    const payload: AddressSelection = {
      receiverName: next.receiverName ?? receiverName,
      receiverPhone: next.receiverPhone ?? receiverPhone,
      displayAddress: next.displayAddress ?? displayAddress,
      province: next.province ?? province,
      ward: next.ward ?? ward,
      detail: next.detail ?? detail,
    };
    onChange(payload);
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {isShowTitle ? (
        <div className="inline-flex items-center gap-2 text-sm font-medium text-[#27272a]">
          <MapPin className="h-4 w-4 text-primary" />
          Địa chỉ lấy hàng
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#27272a]">Người nhận</label>
          <Input
            value={receiverName}
            onChange={(event) => {
              const value = event.target.value;
              setReceiverName(value);
              emitChange({ receiverName: value });
            }}
            placeholder="Tên người nhận hàng"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#27272a]">Số điện thoại</label>
          <Input
            value={receiverPhone}
            onChange={(event) => {
              const value = event.target.value;
              setReceiverPhone(value);
              emitChange({ receiverPhone: value });
            }}
            placeholder="Số điện thoại nhận hàng"
          />
        </div>
      </div>

      <VietnamAddressPicker
        label="Địa chỉ"
        description="Chọn tỉnh/xã và nhập địa chỉ chi tiết để lấy hàng."
        onChange={(selection) => {
          setDisplayAddress(selection.displayAddress);
          setProvince(selection.province?.name);
          setWard(selection.ward?.name);
          setDetail(selection.detail);
          emitChange({
            displayAddress: selection.displayAddress,
            province: selection.province?.name,
            ward: selection.ward?.name,
            detail: selection.detail,
          });
        }}
      />
    </div>
  );
};

export default AddressSelect2;
