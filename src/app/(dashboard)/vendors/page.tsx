"use client";

import * as React from "react";
import {
  Store,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Heart,
  ExternalLink,
  Trash2,
  Edit2,
  DollarSign,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { formatCurrencyVND } from "@/lib/utils";
import { VendorService } from "@/services/vendor.service";
import { Vendor, VendorStatus } from "@/types/database";

export default function VendorsPage() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("Chụp ảnh");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [address, setAddress] = React.useState("");
  const [status, setStatus] = React.useState<VendorStatus>("BOOKED");
  const [notes, setNotes] = React.useState("");

  const loadVendors = React.useCallback(async () => {
    const list = await VendorService.getVendors();
    setVendors(list);
  }, []);

  React.useEffect(() => {
    loadVendors();
    const handleStoreChange = () => loadVendors();
    window.addEventListener("wedding_store_updated", handleStoreChange);
    return () => window.removeEventListener("wedding_store_updated", handleStoreChange);
  }, [loadVendors]);

  const handleToggleFavorite = async (id: string) => {
    await VendorService.toggleFavorite(id);
    loadVendors();
  };

  const handleDelete = async (id: string) => {
    await VendorService.deleteVendor(id);
    loadVendors();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa nhà cung cấp thành công!" }));
    }
  };

  const handleOpenAdd = () => {
    setName("");
    setCategory("Chụp ảnh");
    setPhone("");
    setEmail("");
    setPrice("");
    setRating(5);
    setAddress("");
    setStatus("BOOKED");
    setNotes("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category);
    setPhone(v.phone || "");
    setEmail(v.email || "");
    setPrice(String(v.price));
    setRating(v.rating || 5);
    setAddress(v.address || "");
    setStatus(v.status);
    setNotes(v.notes || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingVendor) {
      await VendorService.updateVendor(editingVendor.id, {
        name,
        category,
        phone: phone || null,
        email: email || null,
        price: Number(price || 0),
        rating: Number(rating || 5),
        address: address || null,
        status,
        notes: notes || null,
      });
      setEditingVendor(null);
    } else {
      await VendorService.addVendor({
        name,
        category,
        phone: phone || null,
        email: email || null,
        price: Number(price || 0),
        rating: Number(rating || 5),
        address: address || null,
        status,
        notes: notes || null,
      });
      setIsAddModalOpen(false);
    }
    loadVendors();
  };

  const filtered = vendors.filter((v) => {
    const matchCat = categoryFilter === "ALL" || v.category === categoryFilter;
    const matchSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Đối tác & Nhà cung cấp dịch vụ (Vendors)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Quản lý, chỉnh sửa đối tác studio chụp ảnh, thợ trang điểm, trang trí và sảnh tiệc
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span>Thêm nhà cung cấp</span>
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8B5E5A]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên dịch vụ, studio, địa điểm..."
            className="pl-10 h-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
        >
          <option value="ALL">Tất cả ngành dịch vụ</option>
          <option value="Địa điểm">Địa điểm tiệc</option>
          <option value="Chụp ảnh">Chụp ảnh & Studio</option>
          <option value="Váy cưới">Váy cưới & Vest</option>
          <option value="Trang trí">Trang trí hoa tươi</option>
          <option value="Trang điểm">Trang điểm & Làm tóc</option>
          <option value="MC">MC & Âm thanh</option>
          <option value="Xe hoa">Xe hoa</option>
        </select>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((vendor) => (
          <Card key={vendor.id} className="p-5 flex flex-col justify-between hover:border-[#D6BE91] transition-all">
            <div>
              <div className="flex items-start justify-between gap-2">
                <Badge variant={vendor.status === "BOOKED" ? "success" : "champagne"}>
                  {vendor.category} • {vendor.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(vendor.id)}
                    className="p-1 text-[#A69591] hover:text-[#B44A4A]"
                    title="Yêu thích"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        vendor.is_favorite ? "fill-[#B44A4A] text-[#B44A4A]" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(vendor)}
                    className="p-1 text-[#A69591] hover:text-[#8B5E5A] rounded hover:bg-[#F5EFE7]"
                    title="Chỉnh sửa đối tác"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="p-1 text-[#A69591] hover:text-[#B44A4A] rounded hover:bg-[#FDF2F2]"
                    title="Xóa đối tác"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-serif text-base font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-3">
                {vendor.name}
              </h3>

              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#C68A27]">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-bold">{vendor.rating}</span>
                <span className="text-[#A69591]">/ 5.0 Đánh giá</span>
              </div>

              {vendor.notes && (
                <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-2.5 bg-[#FAF6F0] p-2.5 rounded-[10px] dark:bg-[#2A2321] leading-relaxed">
                  {vendor.notes}
                </p>
              )}

              <div className="mt-4 space-y-1.5 text-xs text-[#6B5E5B] dark:text-[#A69591]">
                {vendor.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#8B5E5A]" />
                    <span>{vendor.phone}</span>
                  </p>
                )}
                {vendor.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#8B5E5A]" />
                    <span className="truncate">{vendor.email}</span>
                  </p>
                )}
                {vendor.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#8B5E5A]" />
                    <span className="truncate">{vendor.address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#EADBCE] dark:border-[#3A302E] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#A69591] uppercase">Chi phí trọn gói</span>
                <p className="font-serif text-sm font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                  {formatCurrencyVND(vendor.price)}
                </p>
              </div>
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="rounded-[10px] bg-[#8B5E5A] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#724B47] transition-colors"
                >
                  Gọi điện
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add or Edit Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingVendor)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVendor(null);
        }}
        title={editingVendor ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tên đối tác / Studio / Sảnh <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Tuấn Nguyễn Makeup Artist"
              required
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Ngành dịch vụ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="Địa điểm">Địa điểm</option>
                <option value="Chụp ảnh">Chụp ảnh</option>
                <option value="Váy cưới">Váy cưới</option>
                <option value="Vest cưới">Vest cưới</option>
                <option value="Trang trí">Trang trí</option>
                <option value="Trang điểm">Trang điểm</option>
                <option value="MC">MC Hôn lễ</option>
                <option value="Xe hoa">Xe hoa</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Trạng thái liên hệ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="INQUIRY">Đang tìm hiểu (Inquiry)</option>
                <option value="QUOTED">Đã nhận báo giá (Quoted)</option>
                <option value="BOOKED">Đã ký & Chốt cọc (Booked)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Số điện thoại</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0909123456"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Tổng chi phí trọn gói (VND)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="VD: 10000000"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Địa chỉ studio / văn phòng</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: 124 Lê Văn Sỹ, P.10, Q.Phú Nhuận"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Ghi chú dịch vụ</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bao gồm 3 váy 2 vest, dặm makeup 2 lần..."
              className="mt-1"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingVendor(null);
              }}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              {editingVendor ? "Lưu thay đổi" : "Lưu nhà cung cấp"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
