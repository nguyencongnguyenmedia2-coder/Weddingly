"use client";

import * as React from "react";
import {
  CreditCard,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { formatCurrencyVND } from "@/lib/utils";
import { BudgetService } from "@/services/budget.service";
import { VendorService } from "@/services/vendor.service";
import { Payment, PaymentStatus, Vendor } from "@/types/database";

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingPayment, setEditingPayment] = React.useState<Payment | null>(null);

  // Form states
  const [vendorName, setVendorName] = React.useState("");
  const [totalAmount, setTotalAmount] = React.useState("");
  const [depositAmount, setDepositAmount] = React.useState("");
  const [paidAmount, setPaidAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [status, setStatus] = React.useState<PaymentStatus>("PENDING");
  const [notes, setNotes] = React.useState("");

  const loadData = React.useCallback(async () => {
    const list = await BudgetService.getPayments();
    setPayments(list);
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
    await BudgetService.deletePayment(id);
    loadData();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa lịch thanh toán thành công!" }));
    }
  };

  const handleOpenAdd = () => {
    setVendorName("");
    setTotalAmount("");
    setDepositAmount("");
    setPaidAmount("");
    setDueDate("");
    setStatus("PENDING");
    setNotes("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (pay: Payment) => {
    setEditingPayment(pay);
    setVendorName(pay.vendor_name);
    setTotalAmount(String(pay.total_amount));
    setDepositAmount(String(pay.deposit_amount));
    setPaidAmount(String(pay.paid_amount));
    setDueDate(pay.due_date || "");
    setStatus(pay.status);
    setNotes(pay.notes || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !totalAmount) return;

    if (editingPayment) {
      await BudgetService.updatePayment(editingPayment.id, {
        vendor_name: vendorName,
        total_amount: Number(totalAmount),
        deposit_amount: Number(depositAmount || 0),
        paid_amount: Number(paidAmount || 0),
        due_date: dueDate || null,
        status,
        notes: notes || null,
      });
      setEditingPayment(null);
    } else {
      await BudgetService.addPayment({
        vendorName,
        totalAmount: Number(totalAmount),
        depositAmount: Number(depositAmount || 0),
        paidAmount: Number(paidAmount || depositAmount || 0),
        dueDate: dueDate || null,
        status,
        notes: notes || null,
      });
      setIsAddModalOpen(false);
    }
    loadData();
  };

  const totalCommitted = payments.reduce((sum, p) => sum + Number(p.total_amount), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.paid_amount), 0);
  const totalOutstanding = payments.reduce((sum, p) => sum + Number(p.remaining_amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Lịch thanh toán & Đặt cọc (Payment Schedules)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Quản lý, chỉnh sửa đợt đặt cọc, theo dõi số tiền đã thanh toán và số dư còn lại
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" />
          <span>Tạo lịch thanh toán</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">Tổng giá trị hợp đồng</span>
          <p className="font-serif text-xl font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-2">
            {formatCurrencyVND(totalCommitted)}
          </p>
          <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1">
            {payments.length} Hợp đồng dịch vụ
          </p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#3F7D5A]">Đã thanh toán / Đã cọc</span>
          <p className="font-serif text-xl font-bold text-[#3F7D5A] mt-2">
            {formatCurrencyVND(totalPaid)}
          </p>
          <p className="text-[11px] text-[#3F7D5A] mt-1 font-medium">
            Đạt {Math.round((totalPaid / (totalCommitted || 1)) * 100)}% tổng cam kết
          </p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#8B5E5A] dark:text-[#D6BE91]">Số dư cần thanh toán tiếp</span>
          <p className="font-serif text-xl font-bold text-[#8B5E5A] dark:text-[#D6BE91] mt-2">
            {formatCurrencyVND(totalOutstanding)}
          </p>
          <p className="text-[11px] text-[#8B5E5A] dark:text-[#D6BE91] mt-1">
            Cần thanh toán trước và trong ngày cưới
          </p>
        </Card>
      </div>

      {/* 1. Mobile Cards View (block md:hidden) */}
      <div className="space-y-3 md:hidden">
        {payments.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#6B5E5B] dark:text-[#A69591]">
            Chưa có đợt thanh toán nào được lập.
          </Card>
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="p-4 space-y-3 border-[#EADBCE] shadow-sm dark:border-[#3A302E]">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                    {p.vendor_name}
                  </h4>
                  {p.notes && <p className="text-[11px] text-[#A69591] mt-0.5">{p.notes}</p>}
                </div>
                <Badge
                  variant={p.status === "PAID" ? "success" : p.status === "PARTIAL" ? "warning" : "champagne"}
                  className="text-[10px]"
                >
                  {p.status}
                </Badge>
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-[#F5EFE7] dark:border-[#2A2321]">
                <div>
                  <span className="text-[10px] text-[#A69591] block">Tổng hợp đồng</span>
                  <span className="font-medium text-[#2C2422] dark:text-[#F5EFE7] text-[11px]">
                    {formatCurrencyVND(p.total_amount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A69591] block">Đã thanh toán</span>
                  <span className="font-semibold text-[#3F7D5A] text-[11px]">
                    {formatCurrencyVND(p.paid_amount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A69591] block">Còn lại</span>
                  <span className="font-bold text-[#8B5E5A] dark:text-[#D6BE91] text-[11px]">
                    {formatCurrencyVND(p.remaining_amount)}
                  </span>
                </div>
              </div>

              {/* Due Date & Action */}
              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-[11px] text-[#6B5E5B] dark:text-[#A69591]">
                  Hạn: <b>{p.due_date || "Chưa đặt"}</b>
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(p)}
                    className="py-1 px-2.5 text-xs font-semibold"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Sửa</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
                <th className="p-4 font-semibold">Đối tác / Nhà cung cấp</th>
                <th className="p-4 font-semibold">Tổng giá trị</th>
                <th className="p-4 font-semibold">Đã cọc / Đã trả</th>
                <th className="p-4 font-semibold">Số tiền còn lại</th>
                <th className="p-4 font-semibold">Hạn thanh toán</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#FFFDF9]/60 transition-colors">
                  <td className="p-4 font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                    <p>{p.vendor_name}</p>
                    {p.notes && <p className="text-[11px] text-[#A69591] font-normal">{p.notes}</p>}
                  </td>
                  <td className="p-4 font-medium text-[#2C2422] dark:text-[#F5EFE7]">
                    {formatCurrencyVND(p.total_amount)}
                  </td>
                  <td className="p-4 text-[#3F7D5A] font-semibold">
                    {formatCurrencyVND(p.paid_amount)}
                  </td>
                  <td className="p-4 font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                    {formatCurrencyVND(p.remaining_amount)}
                  </td>
                  <td className="p-4 text-[#6B5E5B] dark:text-[#A69591]">
                    {p.due_date || "Chưa có hạn"}
                  </td>
                  <td className="p-4">
                    <Badge variant={p.status === "PAID" ? "success" : p.status === "PARTIAL" ? "warning" : "champagne"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-[#A69591] hover:text-[#8B5E5A] rounded hover:bg-[#F5EFE7]"
                        title="Chỉnh sửa lịch thanh toán"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-[#A69591] hover:text-[#B44A4A] rounded hover:bg-[#FDF2F2]"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add or Edit Payment Modal */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingPayment)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPayment(null);
        }}
        title={editingPayment ? "Chỉnh sửa lịch thanh toán" : "Thêm lịch thanh toán hợp đồng"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Nhà cung cấp / Đối tác <span className="text-[#B44A4A]">*</span>
            </label>
            <div className="space-y-1 mt-1">
              <select
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="">-- Chọn từ danh bạ đối tác --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
              <Input
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Hoặc gõ tên đối tác..."
                required
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                Tổng tiền hợp đồng (VND) <span className="text-[#B44A4A]">*</span>
              </label>
              <Input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="VD: 35000000"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Đã thanh toán / cọc (VND)</label>
              <Input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="VD: 10000000"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Hạn thanh toán</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="PENDING">Chờ thanh toán (Pending)</option>
                <option value="PARTIAL">Đã cọc một phần (Partial)</option>
                <option value="PAID">Đã hoàn tất (Paid)</option>
                <option value="OVERDUE">Quá hạn (Overdue)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Ghi chú đợt thanh toán</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Thanh toán 50% còn lại sau khi hoàn tất thi công hoa"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingPayment(null);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingPayment ? "Lưu thay đổi" : "Lưu lịch thanh toán"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
