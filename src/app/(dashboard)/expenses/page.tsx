"use client";

import * as React from "react";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Building,
  Edit2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Crown,
  Sparkles,
  Lock,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { formatCurrencyVND } from "@/lib/utils";
import { BudgetService } from "@/services/budget.service";
import { VendorService } from "@/services/vendor.service";
import { Expense, PaymentStatus, Vendor } from "@/types/database";
import { AuthService } from "@/services/auth.service";
import { TierService } from "@/services/tier.service";
import { UpgradePlanModal } from "@/components/modals/upgrade-plan-modal";

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);

  // Subscription plan & quota states
  const [userPlan, setUserPlan] = React.useState<"FREE" | "PRO">("FREE");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<string | undefined>(undefined);

  // Form state
  const [title, setTitle] = React.useState("");
  const [categoryName, setCategoryName] = React.useState("Địa điểm & Tiệc cưới");
  const [amount, setAmount] = React.useState("");
  const [vendorName, setVendorName] = React.useState("");
  const [expenseDate, setExpenseDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>("PAID");
  const [receiptUrl, setReceiptUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const loadData = React.useCallback(async () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setUserPlan(user.plan || "FREE");
    }
    const list = await BudgetService.getExpenses();
    setExpenses(list);
    const vList = await VendorService.getVendors();
    setVendors(vList);
  }, []);

  React.useEffect(() => {
    loadData();
    const handleStoreChange = () => loadData();
    window.addEventListener("wedding_store_updated", handleStoreChange);
    return () => window.removeEventListener("wedding_store_updated", handleStoreChange);
  }, [loadData]);

  const handleDelete = async (id: string) => {
    await BudgetService.deleteExpense(id);
    loadData();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa khoản chi thành công!" }));
    }
  };

  const handleOpenAdd = () => {
    const user = AuthService.getCurrentUser();
    const plan = user?.plan || userPlan || "FREE";
    const quotaCheck = TierService.canAddExpense(expenses.length, plan);
    if (!quotaCheck.allowed) {
      setUpgradeReason(quotaCheck.message);
      setIsUpgradeModalOpen(true);
      return;
    }

    setTitle("");
    setCategoryName("Địa điểm & Tiệc cưới");
    setAmount("");
    setVendorName("");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setPaymentStatus("PAID");
    setReceiptUrl("");
    setNotes("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategoryName(exp.category_name);
    setAmount(String(exp.amount));
    setVendorName(exp.vendor_name || "");
    setExpenseDate(exp.expense_date);
    setPaymentStatus(exp.payment_status);
    setReceiptUrl(exp.receipt_url || "");
    setNotes(exp.notes || "");
  };

  // Image Upload handler (Tải ảnh hóa đơn từ máy tính lên)
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    if (editingExpense) {
      await BudgetService.updateExpense(editingExpense.id, {
        title,
        category_name: categoryName,
        amount: Number(amount),
        expense_date: expenseDate,
        vendor_name: vendorName || null,
        payment_status: paymentStatus,
        receipt_url: receiptUrl || null,
        notes: notes || null,
      });
      setEditingExpense(null);
    } else {
      await BudgetService.addExpense({
        title,
        categoryName,
        amount: Number(amount),
        expenseDate,
        vendorName: vendorName || null,
        paymentStatus,
        receiptUrl: receiptUrl || null,
        notes: notes || null,
      });
      setIsAddModalOpen(false);
    }
    loadData();
  };

  const filtered = expenses.filter((e) => {
    const matchCat = categoryFilter === "ALL" || e.category_name === categoryFilter;
    const matchSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.vendor_name && e.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const totalSpent = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
              Sổ chi tiêu thực tế (Expense Tracker)
            </h1>
            {userPlan === "PRO" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold shadow-xs">
                <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>PRO VIP (Không giới hạn)</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setUpgradeReason("Nâng cấp lên Gói Hoàn Mỹ (PRO VIP) để không giới hạn ghi nhận chi tiêu và xuất báo cáo tài chính.");
                  setIsUpgradeModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8B5E5A]/10 border border-[#8B5E5A]/30 text-[#8B5E5A] dark:text-[#D6BE91] text-[10px] font-semibold hover:bg-[#8B5E5A]/20 transition-all cursor-pointer"
                title="Bấm để mở khoá không giới hạn chi tiêu"
              >
                <span>{expenses.length}/15 khoản chi (Miễn phí)</span>
                <span className="underline ml-0.5">Nâng cấp PRO &rarr;</span>
              </button>
            )}
          </div>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Ghi chép, chỉnh sửa, đính kèm hóa đơn và đối soát từng khoản tiền đám cưới
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          {userPlan !== "PRO" && expenses.length >= 15 ? (
            <Lock className="h-4 w-4 text-amber-300" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span>Ghi nhận khoản chi</span>
        </Button>
      </div>

      {/* Summary Banner */}
      <div className="rounded-[16px] bg-[#FFFDF9] p-5 border border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm dark:bg-[#221C1B] dark:border-[#3A302E]">
        <div>
          <span className="text-xs text-[#6B5E5B] dark:text-[#A69591]">Tổng chi tiêu hiển thị</span>
          <p className="font-serif text-2xl font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
            {formatCurrencyVND(totalSpent)}
          </p>
        </div>
        <span className="text-xs text-[#6B5E5B] dark:text-[#A69591]">
          {filtered.length} Khoản chi được ghi nhận
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8B5E5A]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khoản chi hoặc nhà cung cấp..."
            className="pl-10 h-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
        >
          <option value="ALL">Tất cả hạng mục</option>
          <option value="Địa điểm & Tiệc cưới">Địa điểm & Tiệc cưới</option>
          <option value="Trang trí & Hoa tươi">Trang trí & Hoa tươi</option>
          <option value="Quay phim & Chụp ảnh">Quay phim & Chụp ảnh</option>
          <option value="Váy cưới & Trang phục">Váy cưới & Trang phục</option>
          <option value="Trang điểm cô dâu & Mẹ">Trang điểm cô dâu & Mẹ</option>
          <option value="Thiệp mời & Quà cảm ơn">Thiệp mời & Quà cảm ơn</option>
          <option value="Âm thanh, Ánh sáng & MC">Âm thanh & MC</option>
          <option value="Dự phòng phát sinh">Dự phòng phát sinh</option>
        </select>
      </div>

      {/* 1. Mobile Cards View (block md:hidden) */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#6B5E5B] dark:text-[#A69591]">
            Chưa có khoản chi tiêu nào phù hợp.
          </Card>
        ) : (
          filtered.map((exp) => (
            <Card key={exp.id} className="p-4 space-y-3 border-[#EADBCE] shadow-sm dark:border-[#3A302E]">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                    {exp.title}
                  </h4>
                  <span className="text-[10px] text-[#8B5E5A] font-semibold">{exp.category_name}</span>
                </div>
                <Badge variant={exp.payment_status === "PAID" ? "success" : "warning"} className="text-[10px]">
                  {exp.payment_status}
                </Badge>
              </div>

              {/* Amount and Vendor */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#F5EFE7] dark:border-[#2A2321]">
                <div>
                  <span className="text-[10px] text-[#A69591] block">Số tiền</span>
                  <span className="font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                    {formatCurrencyVND(exp.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A69591] block">Nhà cung cấp</span>
                  <span className="font-medium text-[#2C2422] dark:text-[#F5EFE7] truncate block">
                    {exp.vendor_name || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A69591] block">Ngày chi</span>
                  <span className="text-[#6B5E5B] dark:text-[#A69591]">{exp.expense_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A69591] block">Hoá đơn</span>
                  {exp.receipt_url ? (
                    <a
                      href={exp.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-[#8B5E5A] hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>Xem ảnh bill</span>
                    </a>
                  ) : (
                    <span className="text-[#A69591] italic">Không có</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(exp)}
                  className="flex-1 py-1.5 text-xs font-semibold"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Sửa</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Xoá"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 2. Desktop Table View (hidden md:block) */}
      <Card className="p-0 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] text-[#6B5E5B] border-b border-[#EADBCE] dark:bg-[#2A2321] dark:border-[#3A302E] dark:text-[#A69591]">
              <tr>
                <th className="p-4 font-semibold">Tên khoản chi</th>
                <th className="p-4 font-semibold">Hạng mục</th>
                <th className="p-4 font-semibold">Nhà cung cấp</th>
                <th className="p-4 font-semibold">Ngày chi</th>
                <th className="p-4 font-semibold">Số tiền</th>
                <th className="p-4 font-semibold">Hóa đơn</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#FFFDF9]/60 transition-colors">
                  <td className="p-4 font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                    <p>{exp.title}</p>
                    {exp.notes && (
                      <p className="text-[11px] text-[#A69591] font-normal">{exp.notes}</p>
                    )}
                  </td>
                  <td className="p-4 text-[#6B5E5B] dark:text-[#A69591]">{exp.category_name}</td>
                  <td className="p-4 text-[#2C2422] dark:text-[#F5EFE7]">
                    {exp.vendor_name || "—"}
                  </td>
                  <td className="p-4 text-[#6B5E5B] dark:text-[#A69591]">{exp.expense_date}</td>
                  <td className="p-4 font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                    {formatCurrencyVND(exp.amount)}
                  </td>
                  <td className="p-4">
                    {exp.receipt_url ? (
                      <a
                        href={exp.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#8B5E5A] hover:underline"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Xem ảnh</span>
                      </a>
                    ) : (
                      <span className="text-[#A69591]">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant={exp.payment_status === "PAID" ? "success" : "warning"}>
                      {exp.payment_status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 text-[#A69591] hover:text-[#8B5E5A] rounded hover:bg-[#F5EFE7]"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 text-[#A69591] hover:text-[#B44A4A] rounded hover:bg-[#FDF2F2]"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#A69591]">
                    Chưa có khoản chi tiêu nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add or Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingExpense)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? "Chỉnh sửa khoản chi" : "Ghi nhận chi tiêu mới"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tên khoản chi <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Cọc thuê xe hoa rước dâu"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                Số tiền (VND) <span className="text-[#B44A4A]">*</span>
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 5000000"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Hạng mục</label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="Địa điểm & Tiệc cưới">Địa điểm & Tiệc cưới</option>
                <option value="Trang trí & Hoa tươi">Trang trí & Hoa tươi</option>
                <option value="Quay phim & Chụp ảnh">Quay phim & Chụp ảnh</option>
                <option value="Váy cưới & Trang phục">Váy cưới & Trang phục</option>
                <option value="Trang điểm cô dâu & Mẹ">Trang điểm cô dâu & Mẹ</option>
                <option value="Thiệp mời & Quà cảm ơn">Thiệp mời & Quà cảm ơn</option>
                <option value="Âm thanh, Ánh sáng & MC">Âm thanh & MC</option>
                <option value="Dự phòng phát sinh">Dự phòng phát sinh</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                Đối tác / Nhà cung cấp liên kết
              </label>
              <div className="space-y-1 mt-1">
                <select
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
                >
                  <option value="">-- Chọn hoặc nhập tự do --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
                <Input
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Hoặc gõ tên nhà cung cấp..."
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Ngày chi</label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Receipt Image Upload (Tải ảnh từ máy tính lên) */}
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
              Ảnh hóa đơn / Biên lai thanh toán
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer rounded-[12px] border border-[#D6BE91] bg-[#F5EFE7] px-3 py-2 text-xs font-medium text-[#8B5E5A] hover:bg-[#EADBCE] transition-colors">
                <Upload className="h-4 w-4" />
                <span>Tải ảnh từ máy tính</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
              {receiptUrl && (
                <span className="text-[11px] text-[#3F7D5A] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã tải ảnh biên lai
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Trạng thái thanh toán</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="PAID">Đã thanh toán (Paid)</option>
                <option value="PARTIAL">Thanh toán một phần / Đã cọc (Partial)</option>
                <option value="PENDING">Chờ thanh toán (Pending)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Ghi chú</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú đợt 1, chuyển khoản..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingExpense(null);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingExpense ? "Lưu thay đổi" : "Lưu khoản chi"}
            </Button>
          </div>
        </form>
      </Modal>

      <UpgradePlanModal
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        reason={upgradeReason}
      />
    </div>
  );
}
