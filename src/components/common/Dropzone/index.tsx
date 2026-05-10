import { useMemo, useState } from "react";
import axios from "axios";
import { ImagePlus, Loader2, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UploadedFile = {
  url: string;
  type: "image" | "video";
};

type DropzoneUploadProps = {
  displayType: "IMAGE" | "VIDEO" | "IMAGE AND VIDEO";
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  defaultFiles?: UploadedFile[];
  isHavingCover?: boolean;
};

const resolveAccept = (displayType: DropzoneUploadProps["displayType"]) => {
  if (displayType === "IMAGE") return "image/*";
  if (displayType === "VIDEO") return "video/*";
  return "image/*,video/*";
};

const getFileKind = (mime: string): UploadedFile["type"] =>
  mime.startsWith("video/") ? "video" : "image";

const uploadToCloudinary = async (file: File) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;
  if (!cloudName || !uploadPreset) {
    throw new Error("Thiếu cấu hình Cloudinary (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_PRESET_NAME).");
  }
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  const response = await axios.post(cloudinaryUrl, formData);
  return response.data.secure_url as string;
};

const DropzoneUpload = ({
  displayType,
  onChange,
  maxFiles = 6,
  defaultFiles = [],
  isHavingCover = false,
}: DropzoneUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>(defaultFiles);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canUploadMore = files.length < maxFiles;

  const hintText = useMemo(() => {
    if (displayType === "IMAGE") return "Chọn hình ảnh (JPG, PNG, WEBP...)";
    if (displayType === "VIDEO") return "Chọn video (MP4, MOV...)";
    return "Chọn hình ảnh hoặc video";
  }, [displayType]);

  const applyFiles = (nextFiles: UploadedFile[]) => {
    setFiles(nextFiles);
    onChange(nextFiles);
  };

  const onPickFiles = async (picked: FileList | null) => {
    if (!picked?.length) return;
    setError(null);
    const selectedFiles = Array.from(picked);
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Chỉ được tối đa ${maxFiles} tệp.`);
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        selectedFiles.map(async (file) => ({
          url: await uploadToCloudinary(file),
          type: getFileKind(file.type),
        })),
      );
      applyFiles([...files, ...uploaded]);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload thất bại";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block rounded-md border border-dashed p-4 text-center">
        <input
          type="file"
          multiple
          accept={resolveAccept(displayType)}
          className="hidden"
          disabled={!canUploadMore || isUploading}
          onChange={(event) => {
            void onPickFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          {displayType === "VIDEO" ? <Video className="h-6 w-6 text-primary" /> : <ImagePlus className="h-6 w-6 text-primary" />}
          <p>{hintText}</p>
          {!canUploadMore ? <p>Đã đạt giới hạn {maxFiles} tệp.</p> : null}
          {isUploading ? (
            <p className="inline-flex items-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải tệp...
            </p>
          ) : null}
        </div>
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {files.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {files.map((file, index) => (
            <div key={`${file.url}-${index}`} className="relative overflow-hidden rounded-md border bg-slate-50">
              {isHavingCover && index === 0 ? (
                <span className="absolute left-2 top-2 z-10 rounded bg-primary px-2 py-1 text-[10px] text-white">Ảnh bìa</span>
              ) : null}
              {file.type === "video" ? (
                <video src={file.url} controls className="h-32 w-full object-cover" />
              ) : (
                <img src={file.url} alt={`Uploaded ${index + 1}`} className="h-32 w-full object-cover" />
              )}
              <div className="absolute bottom-2 right-2">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  onClick={() => applyFiles(files.filter((item) => item.url !== file.url))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default DropzoneUpload;
