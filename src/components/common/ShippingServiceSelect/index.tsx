import { Truck } from "lucide-react";
import { FormSelect, type FormSelectOption } from "@/components/form/FormSelect";

type ShippingService = {
  serviceId: number;
  serviceName: string;
  shippingFee: number;
};

type ShippingServiceSelectProps = {
  value?: string;
  onSelectService: (service: ShippingService) => void;
};

const services: ShippingService[] = [
  {
    serviceId: 1,
    serviceName: "GHTK - Tiêu chuẩn",
    shippingFee: 28000,
  },
  {
    serviceId: 2,
    serviceName: "GHTK - Hỏa tốc nội tỉnh",
    shippingFee: 42000,
  },
];

const options: FormSelectOption[] = services.map((service) => ({
  value: String(service.serviceId),
  label: `${service.serviceName} (${service.shippingFee.toLocaleString("vi-VN")}đ)`,
}));

const ShippingServiceSelect = ({ value, onSelectService }: ShippingServiceSelectProps) => {
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#27272a]">
        <Truck className="h-4 w-4 text-primary" />
        Dịch vụ vận chuyển
      </div>
      <FormSelect
        id="shipping-service"
        label="Chọn dịch vụ"
        value={value}
        placeholder="Chọn dịch vụ vận chuyển"
        options={options}
        onValueChange={(selectedValue) => {
          const service = services.find((item) => String(item.serviceId) === selectedValue);
          if (!service) return;
          onSelectService(service);
        }}
      />
    </div>
  );
};

export default ShippingServiceSelect;
