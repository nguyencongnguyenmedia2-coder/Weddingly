"use client";

import * as React from "react";
import {
  Image as ImageIcon,
  Plus,
  Heart,
  Folder,
  UploadCloud,
  Sparkles,
  Trash2,
  Edit2,
  FileImage,
  Link as LinkIcon,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { WeddingStore, GalleryPhoto } from "@/lib/wedding-store";

export default function GalleryPage() {
  const [activeAlbum, setActiveAlbum] = React.useState("Tất cả");
  const [photos, setPhotos] = React.useState<GalleryPhoto[]>([]);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [editingPhoto, setEditingPhoto] = React.useState<GalleryPhoto | null>(null);

  // Form states for Add / Edit
  const [uploadMode, setUploadMode] = React.useState<"file" | "url">("file");
  const [imagePreview, setImagePreview] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [album, setAlbum] = React.useState("Pre-wedding");
  const [fileError, setFileError] = React.useState("");

  const albums = ["Tất cả", "Pre-wedding", "Engagement", "Wedding", "Family", "Friends", "Honeymoon"];

  const loadPhotos = React.useCallback(() => {
    setPhotos(WeddingStore.getPhotos());
  }, []);

  React.useEffect(() => {
    loadPhotos();
    const handleUpdate = () => loadPhotos();
    window.addEventListener("wedding_store_updated", handleUpdate);
    return () => window.removeEventListener("wedding_store_updated", handleUpdate);
  }, [loadPhotos]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Dung lượng ảnh tối đa 5MB để đảm bảo tốc độ tải");
      return;
    }

    setFileError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview.trim()) {
      setFileError("Vui lòng tải lên ảnh hoặc nhập URL ảnh");
      return;
    }

    if (editingPhoto) {
      WeddingStore.updatePhoto(editingPhoto.id, {
        album,
        caption: caption || "Ảnh kỷ niệm",
        url: imagePreview,
      });
      setEditingPhoto(null);
    } else {
      WeddingStore.addPhoto({
        album,
        url: imagePreview,
        caption: caption || "Ảnh kỷ niệm",
        isFavorite: false,
      });
      setIsUploadOpen(false);
    }

    setImagePreview("");
    setCaption("");
    setFileError("");
  };

  const openEditModal = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setImagePreview(photo.url);
    setCaption(photo.caption);
    setAlbum(photo.album);
    setUploadMode("url");
  };

  const toggleFavorite = (id: string, currentFav: boolean) => {
    WeddingStore.updatePhoto(id, { isFavorite: !currentFav });
  };

  const handleDelete = (id: string) => {
    WeddingStore.deletePhoto(id);
    loadPhotos();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa ảnh thành công!" }));
    }
  };

  const filtered = activeAlbum === "Tất cả" ? photos : photos.filter((p) => p.album === activeAlbum);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Thư viện & Album ảnh cưới (Gallery)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Lưu trữ hình ảnh pre-wedding, ăn hỏi và phóng sự ngày cưới với độ phân giải cao ({photos.length} hình ảnh)
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
          onClick={() => {
            setEditingPhoto(null);
            setImagePreview("");
            setCaption("");
            setFileError("");
            setUploadMode("file");
            setIsUploadOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Tải ảnh mới</span>
        </Button>
      </div>

      {/* Album Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {albums.map((alb) => (
          <button
            key={alb}
            onClick={() => setActiveAlbum(alb)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              activeAlbum === alb
                ? "bg-[#8B5E5A] text-white shadow-sm"
                : "bg-white text-[#6B5E5B] border border-[#EADBCE] hover:bg-[#F5EFE7] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#A69591]"
            }`}
          >
            {alb} {alb === "Tất cả" ? `(${photos.length})` : `(${photos.filter((p) => p.album === alb).length})`}
          </button>
        ))}
      </div>

      {/* Photo Masonry Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-[#EADBCE] dark:text-[#3A302E] mb-3" />
          <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Chưa có bức ảnh nào trong album {activeAlbum}
          </h3>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1 mb-4">
            Hãy tải lên những tấm ảnh đẹp nhất của bạn từ máy tính
          </p>
          <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}>
            <UploadCloud className="h-4 w-4" />
            <span>Tải ảnh đầu tiên</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-[20px] bg-white border border-[#EADBCE] shadow-sm hover:shadow-xl transition-all dark:bg-[#221C1B] dark:border-[#3A302E]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 relative">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Floating Action Buttons */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-md p-1.5 rounded-full">
                  <button
                    onClick={() => toggleFavorite(photo.id, photo.isFavorite)}
                    className="p-1.5 text-white hover:text-[#B44A4A] transition-colors rounded-full"
                    title={photo.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        photo.isFavorite ? "fill-[#B44A4A] text-[#B44A4A]" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => openEditModal(photo)}
                    className="p-1.5 text-white hover:text-[#D6BE91] transition-colors rounded-full"
                    title="Chỉnh sửa thông tin ảnh"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-1.5 text-white hover:text-red-400 transition-colors rounded-full"
                    title="Xoá ảnh"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                    {photo.caption}
                  </p>
                  <span className="text-[10px] text-[#A69591]">{photo.album}</span>
                </div>
                <Badge variant={photo.isFavorite ? "champagne" : "default"}>
                  {photo.isFavorite ? "Yêu thích" : photo.album}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit Photo Modal */}
      <Modal
        isOpen={isUploadOpen || !!editingPhoto}
        onClose={() => {
          setIsUploadOpen(false);
          setEditingPhoto(null);
        }}
        title={editingPhoto ? "Chỉnh sửa ảnh kỷ niệm" : "Tải ảnh mới vào Album cưới"}
      >
        <form onSubmit={handleSavePhoto} className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-[#F5EFE7] p-1 dark:bg-[#2A2321]">
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                uploadMode === "file"
                  ? "bg-white text-[#2C2422] shadow-sm dark:bg-[#221C1B] dark:text-[#F5EFE7]"
                  : "text-[#6B5E5B] dark:text-[#A69591]"
              }`}
            >
              <FileImage className="h-3.5 w-3.5" />
              <span>Tải file từ máy tính</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                uploadMode === "url"
                  ? "bg-white text-[#2C2422] shadow-sm dark:bg-[#221C1B] dark:text-[#F5EFE7]"
                  : "text-[#6B5E5B] dark:text-[#A69591]"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Nhập đường dẫn URL</span>
            </button>
          </div>

          {/* Upload Input */}
          {uploadMode === "file" ? (
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                Chọn ảnh từ máy tính (JPG, PNG, WebP)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#EADBCE] border-dashed rounded-[16px] hover:border-[#8B5E5A] transition-colors bg-[#FFFDF9] dark:bg-[#1C1716] dark:border-[#3A302E]">
                <div className="space-y-2 text-center">
                  <UploadCloud className="mx-auto h-8 w-8 text-[#8B5E5A]" />
                  <div className="flex text-xs text-[#6B5E5B] dark:text-[#A69591] justify-center">
                    <label className="relative cursor-pointer rounded-md font-semibold text-[#8B5E5A] hover:underline focus-within:outline-none">
                      <span>Bấm để duyệt ảnh trên thiết bị</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-[#A69591]">Dung lượng tối đa 5MB</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                Đường dẫn hình ảnh (Image URL) <span className="text-[#B44A4A]">*</span>
              </label>
              <Input
                value={imagePreview}
                onChange={(e) => setImagePreview(e.target.value)}
                placeholder="VD: https://images.unsplash.com/..."
                className="mt-1"
              />
            </div>
          )}

          {fileError && <p className="text-xs text-[#B44A4A] font-medium">{fileError}</p>}

          {/* Preview */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-[#EADBCE] max-h-48 bg-neutral-100 dark:border-[#3A302E]">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-44 object-cover"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Chọn Album</label>
            <select
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white p-2.5 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
            >
              <option value="Pre-wedding">Pre-wedding</option>
              <option value="Engagement">Lễ đính hôn (Engagement)</option>
              <option value="Wedding">Ngày thành hôn (Wedding)</option>
              <option value="Family">Gia đình hai họ (Family)</option>
              <option value="Friends">Bạn bè (Friends)</option>
              <option value="Honeymoon">Tuần trăng mật (Honeymoon)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Chú thích ảnh</label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="VD: Nụ cười hạnh phúc nhất"
              className="mt-1"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsUploadOpen(false);
                setEditingPhoto(null);
              }}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              {editingPhoto ? "Lưu thay đổi" : "Lưu ảnh vào album"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
