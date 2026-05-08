const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  import.meta.env.VITE_CLOUDINARY_PRESET_NAME;
const CLOUDINARY_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || "shops/logo";

const SHOP_LOGO_MAX_SIZE_BYTES = 3 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildPublicId = (uid: string) => {
  const safeUid = slugify(uid || "anonymous");
  return `${safeUid}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

export const validateShopLogoFile = (file: File): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Logo chỉ hỗ trợ JPG, PNG hoặc WEBP.";
  }

  if (file.size > SHOP_LOGO_MAX_SIZE_BYTES) {
    return "Logo tối đa 3MB.";
  }

  return null;
};

export const uploadShopLogoAndGetUrl = async (uid: string, file: File) => {
  const error = validateShopLogoFile(file);
  if (error) {
    throw new Error(error);
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Thiếu cấu hình Cloudinary. Kiểm tra VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_FOLDER);
  formData.append("public_id", buildPublicId(uid));

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Upload logo lên Cloudinary thất bại.";
    try {
      const data = (await response.json()) as {
        error?: { message?: string };
      };
      if (data.error?.message) {
        errorMessage = `Cloudinary: ${data.error.message}`;
      }
    } catch {
      // ignore parse error and keep default message
    }

    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as {
    secure_url?: string;
  };
  if (!payload.secure_url) {
    throw new Error("Cloudinary không trả về URL ảnh.");
  }

  return payload.secure_url;
};
