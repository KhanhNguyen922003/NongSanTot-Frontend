import * as yup from 'yup';

export const phoneField = yup
  .string()
  .trim()
  .required('Vui lòng nhập số điện thoại')
  .matches(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)');

/** Bước gửi SMS đăng ký (OTP nhập sau, validate riêng bằng smsOtpCodeSchema) */
export const signUpSchema = yup.object({
  fullName: yup.string().trim().max(80).optional(),
  phone: phoneField,
  otp: yup.string().optional(),
});

export type SignUpFormValues = {
  fullName?: string;
  phone: string;
  otp?: string;
};

/** Bước nhập mã 6 số (đăng ký / đăng nhập) */
export const smsOtpCodeSchema = yup.object({
  otp: yup
    .string()
    .trim()
    .required('Nhập mã OTP')
    .length(6, 'Nhập đủ 6 chữ số')
    .matches(/^\d+$/, 'Chỉ nhập số'),
});

/** Đăng nhập: SĐT + OTP (OTP validate thêm khi bấm xác thực) */
export const signInOtpSchema = yup.object({
  phone: phoneField,
  otp: yup.string().optional(),
});

export type SignInOtpFormValues = {
  phone: string;
  otp?: string;
};

/** Tạo shop */
export const shopSchema = yup.object({
  shopName: yup.string().trim().min(2, 'Nhập tên cửa hàng').max(120).required(),
  description: yup.string().trim().max(1000).optional(),
  displayAddress: yup.string().trim().min(5, 'Nhập địa chỉ hiển thị').max(300).required(),
});

export type ShopFormValues = {
  shopName: string;
  description?: string;
  displayAddress: string;
};
