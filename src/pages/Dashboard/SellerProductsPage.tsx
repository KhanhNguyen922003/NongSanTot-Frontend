import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, PackagePlus, Pencil, Trash2 } from "lucide-react";
import { AppTable, type AppTableColumn } from "@/components/common/AppTable";
import { AuthFormMessage } from "@/components/auth/AuthFormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sellerHubPaths } from "@/constants/sellerHub";
import { getApiErrorMessage } from "@/core/api/getApiErrorMessage";
import { FormInput } from "@/components/form/FormInput";
import { FormTextarea } from "@/components/form/FormTextarea";
import type { Product } from "@/queries/products/types";
import {
  useArchiveSellerProductMutation,
  useSellerProductsQuery,
  useUpdateSellerProductMutation,
} from "@/queries/products/useSellerProducts";

const STATUS_LABEL: Record<Product["status"], string> = {
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  active: "Đang bán",
  rejected: "Từ chối",
  archived: "Đã lưu trữ",
};

const statusBadgeClass = (status: Product["status"]) => {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "pending_review":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-800";
    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

type EditFormState = {
  name: string;
  description: string;
  origin: string;
  price: string;
  stock: string;
  unit: string;
  tagsText: string;
  imagesText: string;
  videosText: string;
  isAvailable: boolean;
};

const emptyForm = (): EditFormState => ({
  name: "",
  description: "",
  origin: "",
  price: "",
  stock: "",
  unit: "kg",
  tagsText: "",
  imagesText: "",
  videosText: "",
  isAvailable: true,
});

const productToForm = (p: Product): EditFormState => ({
  name: p.name,
  description: p.description ?? "",
  origin: p.origin,
  price: String(p.price),
  stock: String(p.stock),
  unit: p.unit ?? "kg",
  tagsText: (p.tags ?? []).join(", "),
  imagesText: (p.images ?? []).join("\n"),
  videosText: (p.videos ?? []).join("\n"),
  isAvailable: p.isAvailable !== false,
});

const SellerProductsPage = () => {
  const { data: items = [], isLoading, isError, error, refetch } = useSellerProductsQuery();
  const updateProduct = useUpdateSellerProductMutation();
  const archiveProduct = useArchiveSellerProductMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<EditFormState>(() => emptyForm());
  const [baselineImages, setBaselineImages] = useState("");
  const [baselineVideos, setBaselineVideos] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);

  useEffect(() => {
    if (!editOpen) {
      setDialogError(null);
      setEditing(null);
      return;
    }
    if (editing) {
      const next = productToForm(editing);
      setForm(next);
      setBaselineImages(next.imagesText);
      setBaselineVideos(next.videosText);
    }
  }, [editOpen, editing]);

  const openEdit = (row: Product) => {
    if (row.status === "archived") return;
    setEditing(row);
    setEditOpen(true);
    setDialogError(null);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    setDialogError(null);
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim()) {
      setDialogError("Vui lòng nhập tên sản phẩm.");
      return;
    }
    if (!Number.isFinite(price) || price < 1) {
      setDialogError("Giá không hợp lệ (≥ 1).");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setDialogError("Tồn kho không hợp lệ.");
      return;
    }
    if (!form.unit.trim()) {
      setDialogError("Vui lòng nhập đơn vị.");
      return;
    }

    const tags = form.tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const imageLines = form.imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (form.imagesText.trim() !== baselineImages.trim()) {
      if (!imageLines.length) {
        setDialogError("Cần ít nhất một URL ảnh khi cập nhật danh sách ảnh.");
        return;
      }
    }

    const videoLines = form.videosText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateProduct.mutateAsync({
        productId: editing.id,
        body: {
          name: form.name.trim(),
          description: form.description.trim(),
          origin: form.origin.trim(),
          price,
          stock,
          unit: form.unit.trim(),
          isAvailable: form.isAvailable,
          tags: tags.length ? tags : undefined,
          images:
            form.imagesText.trim() !== baselineImages.trim()
              ? imageLines
              : undefined,
          videos:
            form.videosText.trim() !== baselineVideos.trim()
              ? videoLines.length
                ? videoLines
                : []
              : undefined,
        },
      });
      closeEdit();
    } catch (err) {
      setDialogError(getApiErrorMessage(err, "Không lưu được sản phẩm."));
    }
  };

  const handleArchive = (row: Product) => {
    if (row.status === "archived") return;
    const ok = window.confirm(
      `Lưu trữ sản phẩm "${row.name}"? SP sẽ không còn hiển thị khi bán và không chỉnh sửa được.`,
    );
    if (!ok) return;
    void archiveProduct.mutate(row.id);
  };

  const columns: AppTableColumn<Product>[] = [
      {
        id: "thumb",
        header: "",
        className: "w-14",
        cell: (row) =>
          row.coverImage ? (
            <img
              src={row.coverImage}
              alt=""
              className="h-11 w-11 rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-md border bg-slate-50 text-xs text-muted-foreground">
              —
            </div>
          ),
      },
      {
        id: "name",
        header: "Tên",
        cell: (row) => (
          <div className="max-w-[220px]">
            <p className="font-medium text-[#27272a] line-clamp-2">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.origin}</p>
          </div>
        ),
      },
      {
        id: "price",
        header: "Giá",
        headerClassName: "text-right",
        className: "text-right tabular-nums whitespace-nowrap",
        cell: (row) => `${Math.round(row.price).toLocaleString("vi-VN")}đ`,
      },
      {
        id: "stock",
        header: "Tồn",
        headerClassName: "text-right",
        className: "text-right tabular-nums whitespace-nowrap",
        cell: (row) => `${Number(row.stock).toLocaleString("vi-VN")} ${row.unit ?? ""}`,
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: (row) => (
          <Badge variant="outline" className={statusBadgeClass(row.status)}>
            {STATUS_LABEL[row.status]}
          </Badge>
        ),
      },
      {
        id: "avail",
        header: "Mở bán",
        cell: (row) => (row.isAvailable !== false ? "Có" : "Tắt"),
      },
      {
        id: "actions",
        header: "",
        className: "w-[120px] text-right",
        cell: (row) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={row.status === "archived"}
              onClick={() => openEdit(row)}
              aria-label="Sửa"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={row.status === "archived" || archiveProduct.isPending}
              onClick={() => handleArchive(row)}
              aria-label="Lưu trữ"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#27272a]">Quản lý sản phẩm</h1>
          <p className="text-sm text-muted-foreground">
            Xem, sửa thông tin và lưu trữ sản phẩm của cửa hàng. Sản phẩm bị từ chối khi
            sửa sẽ chuyển lại trạng thái chờ duyệt.
          </p>
        </div>
        <Button asChild>
          <Link to={sellerHubPaths.newProduct}>
            <PackagePlus className="mr-2 h-4 w-4" />
            Đăng sản phẩm mới
          </Link>
        </Button>
      </div>

      {isError && (
        <div className="mb-4">
          <AuthFormMessage
            type="error"
            text={getApiErrorMessage(error, "Không tải được danh sách sản phẩm.")}
          />
          <Button variant="outline" className="mt-2" onClick={() => void refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      <AppTable
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="Chưa có sản phẩm. Hãy đăng sản phẩm mới."
      />

      <Dialog open={editOpen} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa sản phẩm</DialogTitle>
          </DialogHeader>

          {dialogError ? <AuthFormMessage type="error" text={dialogError} /> : null}

          <div className="grid gap-4 py-2">
            <FormInput
              id="sp-name"
              label="Tên sản phẩm"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <FormTextarea
              id="sp-description"
              label="Mô tả"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <FormInput
              id="sp-origin"
              label="Xuất xứ"
              value={form.origin}
              onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                id="sp-price"
                label="Giá (VNĐ)"
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
              <FormInput
                id="sp-stock"
                label="Tồn kho"
                type="number"
                min={0}
                step="any"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
            <FormInput
              id="sp-unit"
              label="Đơn vị"
              placeholder="vd: kg, thùng, chục"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            />
            <FormInput
              id="sp-tags"
              label="Thẻ (phân cách bằng dấu phẩy)"
              value={form.tagsText}
              onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))}
            />
            <FormTextarea
              id="sp-images"
              label="Ảnh (mỗi dòng một URL)"
              rows={4}
              value={form.imagesText}
              onChange={(e) => setForm((f) => ({ ...f, imagesText: e.target.value }))}
            />
            <FormTextarea
              id="sp-videos"
              label="Video (mỗi dòng một URL, có thể để trống)"
              rows={2}
              value={form.videosText}
              onChange={(e) => setForm((f) => ({ ...f, videosText: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-[#27272a]">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isAvailable: e.target.checked }))
                }
              />
              Cho phép hiển thị / mở bán (khi đã được duyệt active)
            </label>
            {editing?.status === "rejected" && editing.rejectionReason ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800">
                Lý do từ chối trước đó: {editing.rejectionReason}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeEdit}>
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerProductsPage;
