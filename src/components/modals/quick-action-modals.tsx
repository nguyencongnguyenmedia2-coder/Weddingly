"use client";

import * as React from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives";
import { TaskService } from "@/services/task.service";
import { GuestService } from "@/services/guest.service";
import { BudgetService } from "@/services/budget.service";
import { TimelineService } from "@/services/timeline.service";
import { WeddingStore, Vendor, WeddingTable } from "@/lib/wedding-store";
import { UploadCloud } from "lucide-react";

interface ModalsProps {
  activeModal: "task" | "guest" | "expense" | "payment" | "event" | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function QuickActionModals({ activeModal, onClose, onSuccess }: ModalsProps) {
  // Vendors and tables for dynamic cross-linking
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [tables, setTables] = React.useState<WeddingTable[]>([]);

  // Form states
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskCategory, setTaskCategory] = React.useState("Chung");
  const [taskPriority, setTaskPriority] = React.useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [taskDueDate, setTaskDueDate] = React.useState("");

  const [guestName, setGuestName] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [guestGroup, setGuestGroup] = React.useState<"Gia đình" | "Bạn bè" | "Đồng nghiệp" | "VIP" | "Nhà gái" | "Nhà trai">("Bạn bè");
  const [guestSide, setGuestSide] = React.useState<"BRIDE" | "GROOM" | "BOTH">("BOTH");
  const [guestTableId, setGuestTableId] = React.useState("");

  const [expenseTitle, setExpenseTitle] = React.useState("");
  const [expenseCategory, setExpenseCategory] = React.useState("Địa điểm & Tiệc cưới");
  const [expenseAmount, setExpenseAmount] = React.useState("");
  const [expenseVendor, setExpenseVendor] = React.useState("");
  const [expenseReceiptUrl, setExpenseReceiptUrl] = React.useState("");

  const [paymentVendor, setPaymentVendor] = React.useState("");
  const [paymentTotal, setPaymentTotal] = React.useState("");
  const [paymentDeposit, setPaymentDeposit] = React.useState("");
  const [paymentDueDate, setPaymentDueDate] = React.useState("");

  const [eventTitle, setEventTitle] = React.useState("");
  const [eventTime, setEventTime] = React.useState("09:00");
  const [eventLocation, setEventLocation] = React.useState("");
  const [eventAssignee, setEventAssignee] = React.useState("");

  React.useEffect(() => {
    if (activeModal) {
      setVendors(WeddingStore.getVendors());
      setTables(WeddingStore.getTables());
    }
  }, [activeModal]);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setExpenseReceiptUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await TaskService.addTask({
      title: taskTitle,
      category: taskCategory,
      priority: taskPriority,
      dueDate: taskDueDate || null,
    });
    setTaskTitle("");
    onClose();
    onSuccess("Đã thêm công việc mới thành công!");
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    await GuestService.addGuest({
      name: guestName,
      phone: guestPhone || null,
      groupName: guestGroup,
      side: guestSide,
      tableId: guestTableId || null,
    });
    setGuestName("");
    setGuestPhone("");
    setGuestTableId("");
    onClose();
    onSuccess("Đã thêm khách mời và liên kết xếp bàn thành công!");
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) return;
    await BudgetService.addExpense({
      title: expenseTitle,
      categoryName: expenseCategory,
      amount: Number(expenseAmount),
      expenseDate: new Date().toISOString().split("T")[0],
      vendorName: expenseVendor || null,
      receiptUrl: expenseReceiptUrl || null,
    });
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseVendor("");
    setExpenseReceiptUrl("");
    onClose();
    onSuccess("Đã ghi nhận chi tiêu và cập nhật ngân sách!");
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentVendor.trim() || !paymentTotal) return;
    await BudgetService.addPayment({
      vendorName: paymentVendor,
      totalAmount: Number(paymentTotal),
      depositAmount: Number(paymentDeposit || 0),
      dueDate: paymentDueDate || null,
    });
    setPaymentVendor("");
    setPaymentTotal("");
    setPaymentDeposit("");
    onClose();
    onSuccess("Đã lập lịch thanh toán thành công!");
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    await TimelineService.addEvent({
      title: eventTitle,
      eventDate: WeddingStore.getWedding().wedding_date,
      startTime: eventTime,
      location: eventLocation || null,
      assigneeName: eventAssignee || null,
    });
    setEventTitle("");
    onClose();
    onSuccess("Đã thêm sự kiện timeline mới!");
  };

  return (
    <>
      {/* 1. Add Task Modal */}
      <Modal isOpen={activeModal === "task"} onClose={onClose} title="Thêm công việc mới">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tên công việc <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="VD: Đặt cọc địa điểm tiệc cưới"
              required
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Hạng mục</label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="Chung">Chung</option>
                <option value="Địa điểm">Địa điểm</option>
                <option value="Trang phục">Trang phục</option>
                <option value="Chụp ảnh">Chụp ảnh & Quay phim</option>
                <option value="Trang trí">Trang trí</option>
                <option value="Khách mời">Khách mời</option>
                <option value="Thiệp cưới">Thiệp cưới</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Mức độ ưu tiên</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="LOW">Thấp (Low)</option>
                <option value="MEDIUM">Trung bình (Medium)</option>
                <option value="HIGH">Cao (High)</option>
                <option value="URGENT">Khẩn cấp (Urgent)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Hạn hoàn thành</label>
            <Input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary">Lưu công việc</Button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Guest Modal */}
      <Modal isOpen={activeModal === "guest"} onClose={onClose} title="Thêm khách mời mới">
        <form onSubmit={handleCreateGuest} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Họ và tên khách mời <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="VD: Anh Nguyễn Hoàng Minh"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Số điện thoại</label>
            <Input
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="VD: 0901234567"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Nhóm khách</label>
              <select
                value={guestGroup}
                onChange={(e) => setGuestGroup(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="Bạn bè">Bạn bè</option>
                <option value="Gia đình">Gia đình</option>
                <option value="Đồng nghiệp">Đồng nghiệp</option>
                <option value="VIP">Khách VIP</option>
                <option value="Nhà gái">Họ Nhà Gái</option>
                <option value="Nhà trai">Họ Nhà Trai</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Phía khách mời</label>
              <select
                value={guestSide}
                onChange={(e) => setGuestSide(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="BOTH">Cả hai</option>
                <option value="BRIDE">Nhà Gái (Cô dâu)</option>
                <option value="GROOM">Nhà Trai (Chú rể)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Xếp bàn tiệc (Liên kết Sơ đồ bàn)
            </label>
            <select
              value={guestTableId}
              onChange={(e) => setGuestTableId(e.target.value)}
              className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
            >
              <option value="">-- Chưa xếp bàn --</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Sức chứa: {t.capacity} khách)
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary">Thêm khách</Button>
          </div>
        </form>
      </Modal>

      {/* 3. Add Expense Modal */}
      <Modal isOpen={activeModal === "expense"} onClose={onClose} title="Ghi nhận chi tiêu">
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tên khoản chi <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="VD: Đặt cọc hoa cưới trang trí sảnh"
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
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="VD: 15000000"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Hạng mục</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
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
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Nhà cung cấp / Đối tác liên kết
            </label>
            <Input
              list="quick-expense-vendors"
              value={expenseVendor}
              onChange={(e) => setExpenseVendor(e.target.value)}
              placeholder="Chọn hoặc nhập tên nhà cung cấp..."
              className="mt-1"
            />
            <datalist id="quick-expense-vendors">
              {vendors.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name} ({v.category})
                </option>
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
              Ảnh hóa đơn / Biên nhận (Tùy chọn)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EADBCE] rounded-lg text-xs font-medium text-[#8B5E5A] bg-[#FFFDF9] hover:bg-[#F5EFE7] dark:bg-[#221C1B] dark:border-[#3A302E]">
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Chọn ảnh hoá đơn</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleReceiptUpload}
                />
              </label>
              {expenseReceiptUrl && (
                <span className="text-xs text-[#3F7D5A] font-medium">✓ Đã đính kèm ảnh</span>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary">Lưu chi tiêu</Button>
          </div>
        </form>
      </Modal>

      {/* 4. Add Payment Modal */}
      <Modal isOpen={activeModal === "payment"} onClose={onClose} title="Lập lịch thanh toán">
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Nhà cung cấp / Đối tác <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              list="quick-payment-vendors"
              value={paymentVendor}
              onChange={(e) => setPaymentVendor(e.target.value)}
              placeholder="Chọn hoặc nhập tên đối tác..."
              required
              className="mt-1"
            />
            <datalist id="quick-payment-vendors">
              {vendors.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name} ({v.category})
                </option>
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                Tổng tiền (VND) <span className="text-[#B44A4A]">*</span>
              </label>
              <Input
                type="number"
                value={paymentTotal}
                onChange={(e) => setPaymentTotal(e.target.value)}
                placeholder="VD: 50000000"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Đã cọc trước (VND)</label>
              <Input
                type="number"
                value={paymentDeposit}
                onChange={(e) => setPaymentDeposit(e.target.value)}
                placeholder="VD: 10000000"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Ngày đến hạn thanh toán</label>
            <Input
              type="date"
              value={paymentDueDate}
              onChange={(e) => setPaymentDueDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary">Lưu lịch thanh toán</Button>
          </div>
        </form>
      </Modal>

      {/* 5. Add Timeline Event Modal */}
      <Modal isOpen={activeModal === "event"} onClose={onClose} title="Thêm sự kiện timeline">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tên sự kiện / Nghi thức <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="VD: Nghi thức trao nhẫn cưới & Cắt bánh"
              required
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                Thời gian (Giờ:Phút) <span className="text-[#B44A4A]">*</span>
              </label>
              <Input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Địa điểm</label>
              <Input
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="VD: Sân khấu chính"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Người phụ trách / Liên hệ</label>
            <Input
              value={eventAssignee}
              onChange={(e) => setEventAssignee(e.target.value)}
              placeholder="VD: MC Hoàng Vũ (0905556666)"
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary">Lưu sự kiện</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
