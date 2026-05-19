import { fractionalUnitValues, unitOptionValues } from "@/constants/productUnit";
import * as yup from "yup";

export const productSchema = yup.object({
  categoryId: yup.string().trim().required("Vui lòng chọn danh mục"),
  name: yup
    .string()
    .trim()
    .min(3, "Tên sản phẩm quá ngắn")
    .max(160, "Tên sản phẩm quá dài")
    .required("Vui lòng nhập tên sản phẩm"),
  description: yup
    .string()
    .trim()
    .min(20, "Mô tả cần tối thiểu 20 ký tự")
    .max(4000, "Mô tả quá dài")
    .required("Vui lòng nhập mô tả"),
  origin: yup.string().trim().required("Vui lòng nhập xuất xứ"),
  price: yup
    .number()
    .typeError("Giá phải là số")
    .positive("Giá phải lớn hơn 0")
    .required("Vui lòng nhập giá"),
  stock: yup
    .number()
    .typeError("Nhập số lượng")
    .min(0, "Số lượng không được âm")
    .when("unit", {
      is: (unit: unknown) => fractionalUnitValues.includes(unit as (typeof fractionalUnitValues)[number]),
      then: (schema) => schema.required("Vui lòng nhập số lượng").moreThan(0, "Số lượng phải lớn hơn 0"),
      otherwise: (schema) => schema.required("Vui lòng nhập số lượng").integer("Đơn vị này chỉ nhập số nguyên"),
    }),
  unit: yup
    .string()
    .trim()
    .oneOf([...unitOptionValues], "Vui lòng chọn đơn vị tính hợp lệ")
    .max(20, "Đơn vị tính tối đa 20 ký tự")
    .required("Vui lòng nhập đơn vị tính"),
  mediaFiles: yup
    .array()
    .of(
      yup.object({
        url: yup.string().trim().required(),
        type: yup.mixed<"image" | "video">().oneOf(["image", "video"]).required(),
      }),
    )
    .min(1, "Vui lòng tải lên ít nhất 1 ảnh hoặc video")
    .required(),
  shippingMethods: yup
    .array()
    .of(yup.string().required())
    .min(1, "Chọn ít nhất 1 phương thức vận chuyển")
    .max(1, "Chỉ được chọn 1 phương thức vận chuyển")
    .required(),
  pickupAddressDisplay: yup.string().trim().required("Vui lòng chọn địa chỉ lấy hàng"),
  pickupReceiverName: yup.string().trim().required("Vui lòng nhập người nhận hàng"),
  pickupReceiverPhone: yup.string().trim().required("Vui lòng nhập số điện thoại nhận hàng"),
  preferredShippingServiceId: yup.string().when("shippingMethods", {
    is: (methods: unknown) => Array.isArray(methods) && methods[0] === "GHTK",
    then: (schema) => schema.trim().required("Chọn cách giao qua GHTK"),
    otherwise: (schema) => schema.trim().optional(),
  }),
  growthDiary: yup
    .array()
    .of(
      yup.object({
        stageName: yup.string().trim().required("Nhập tên giai đoạn"),
        logDate: yup.string().trim().required("Chọn ngày của giai đoạn"),
        description: yup
          .string()
          .trim()
          .max(2000, "Mô tả giai đoạn quá dài")
          .optional(),
        mediaFiles: yup
          .array()
          .of(
            yup.object({
              url: yup.string().trim().required(),
              type: yup.mixed<"image" | "video">().oneOf(["image", "video"]).required(),
            }),
          )
          .min(1, "Mỗi giai đoạn cần ít nhất 1 ảnh")
          .required(),
      }),
    )
    .optional()
    .default([]),
});

export const unitOptions = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "mg", label: "Milligram (mg)" },
  { value: "tấn", label: "Tấn" },
  { value: "tạ", label: "Tạ" },
  { value: "yến", label: "Yến" },
  { value: "quả", label: "Quả" },
  { value: "trái", label: "Trái" },
  { value: "củ", label: "Củ" },
  { value: "bó", label: "Bó" },
  { value: "cây", label: "Cây" },
  { value: "con", label: "Con" },
  { value: "miếng", label: "Miếng" },
  { value: "khay", label: "Khay" },
  { value: "hộp", label: "Hộp" },
  { value: "thùng", label: "Thùng" },
  { value: "sọt", label: "Sọt" },
  { value: "rổ", label: "Rổ" },
  { value: "túi", label: "Túi" },
  { value: "gói", label: "Gói" },
  { value: "chai", label: "Chai" },
  { value: "lọ", label: "Lọ" },
  { value: "lon", label: "Lon" },
  { value: "lốc", label: "Lốc" },
  { value: "bao", label: "Bao" },
  { value: "set", label: "Set" },
  { value: "chục", label: "Chục" },
];

export const shippingOptions = [
  { id: "GHTK", label: "Giao qua GHTK" },
  { id: "SELF_DELIVERY", label: "Tôi tự giao cho khách" },
];

export type ProductFormValues = yup.InferType<typeof productSchema>;
