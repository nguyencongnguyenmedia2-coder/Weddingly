"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  Users,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Receipt,
  Heart,
  Plus,
  Armchair,
  Globe,
  CalendarDays,
  Send,
  Bot,
  Phone,
  Check,
  Flame,
  ShieldCheck,
  PartyPopper,
  Copy,
  ExternalLink,
  ChevronRight,
  Layers,
  Building,
  Camera,
  Shirt,
  Flower2,
  Mic2,
  Sparkle,
  Trash2,
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { Card, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Wedding, Task, Expense, Payment, Guest, WeddingTable, Vendor, TimelineEvent } from "@/types/database";
import { WeddingService, CountdownResult } from "@/services/wedding.service";
import { BudgetService, BudgetSummary } from "@/services/budget.service";
import { GuestService, GuestStats } from "@/services/guest.service";
import { TaskService } from "@/services/task.service";
import { VendorService } from "@/services/vendor.service";
import { TimelineService } from "@/services/timeline.service";
import { WeddingStore } from "@/lib/wedding-store";

export default function DashboardPage() {
  const [wedding, setWedding] = React.useState<Wedding | null>(null);
  const [countdown, setCountdown] = React.useState<CountdownResult | null>(null);
  const [budgetSummary, setBudgetSummary] = React.useState<BudgetSummary | null>(null);
  const [guestStats, setGuestStats] = React.useState<GuestStats | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [tables, setTables] = React.useState<WeddingTable[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([]);

  // Task filter in dashboard: "PENDING" | "URGENT" | "ALL" | "COMPLETED"
  const [taskFilter, setTaskFilter] = React.useState<"PENDING" | "URGENT" | "ALL" | "COMPLETED">("PENDING");
  const [copiedLink, setCopiedLink] = React.useState(false);

  const loadDashboard = React.useCallback(async () => {
    const w = await WeddingService.getActiveWedding();
    setWedding(w);

    const bSummary = await BudgetService.getBudgetSummary(w.estimated_budget);
    setBudgetSummary(bSummary);

    const gStats = await GuestService.getGuestStats();
    setGuestStats(gStats);

    const tList = await TaskService.getTasks();
    setTasks(tList);

    const eList = await BudgetService.getExpenses();
    setExpenses(eList);

    const pList = await BudgetService.getPayments();
    setPayments(pList);

    const tblList = await GuestService.getTables();
    setTables(tblList);

    const vList = await VendorService.getVendors();
    setVendors(vList);

    const tlList = await TimelineService.getEvents();
    setTimelineEvents(tlList);

    setCountdown(WeddingService.calculateCountdown(w.wedding_date));
  }, []);

  React.useEffect(() => {
    loadDashboard();
    const handleUpdate = () => loadDashboard();
    window.addEventListener("wedding_store_updated", handleUpdate);

    const interval = setInterval(() => {
      const currentW = WeddingStore.getWedding();
      if (currentW) {
        setCountdown(WeddingService.calculateCountdown(currentW.wedding_date));
      }
    }, 1000);

    return () => {
      window.removeEventListener("wedding_store_updated", handleUpdate);
      clearInterval(interval);
    };
  }, [loadDashboard]);

  // Trigger quick modal actions
  const triggerAction = (type: "task" | "guest" | "expense" | "payment" | "event" | "ai") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trigger_quick_action", { detail: type }));
    }
  };

  const showToast = (message: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: message }));
    }
  };

  // Celebration Fireworks
  const handleCelebrate = () => {
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((confettiModule) => {
        const confetti = confettiModule.default;
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#D6BE91", "#8B5E5A", "#F5EFE7", "#E4C590", "#3F7D5A"],
        });
      });
      showToast("Chúc mừng Minh Anh & Quốc Minh! Chúc tình yêu đôi bạn mãi đong đầy hạnh phúc! 💖");
    }
  };

  // Copy RSVP Link
  const handleCopyRSVP = () => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const rsvpUrl = `${origin}/rsvp/token-demo`;
      navigator.clipboard.writeText(rsvpUrl).then(() => {
        setCopiedLink(true);
        showToast("Đã sao chép link RSVP gửi khách mời vào bộ nhớ tạm!");
        setTimeout(() => setCopiedLink(false), 3000);
      });
    }
  };

  // Toggle Task Completion directly from Dashboard
  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    await TaskService.updateTask(task.id, { status: nextStatus });
    if (nextStatus === "COMPLETED") {
      showToast(`Tuyệt vời! Đã hoàn thành công việc: "${task.title}" 🎉`);
      if (typeof window !== "undefined") {
        import("canvas-confetti").then((confettiModule) => {
          const confetti = confettiModule.default;
          confetti({
            particleCount: 45,
            spread: 55,
            origin: { y: 0.7 },
            colors: ["#3F7D5A", "#D6BE91", "#8B5E5A"],
          });
        });
      }
    }
  };

  // Quick mark payment as paid
  const handleQuickPay = async (payment: Payment) => {
    await BudgetService.updatePayment(payment.id, {
      paid_amount: payment.total_amount,
      status: "PAID",
      remaining_amount: 0,
    });
    showToast(`Đã xác nhận hoàn tất thanh toán cho ${payment.vendor_name}!`);
  };

  // Delete task directly from Dashboard
  const handleDeleteTask = async (taskId: string) => {
    await TaskService.deleteTask(taskId);
    showToast("Đã xóa công việc thành công!");
    loadDashboard();
  };

  // Delete payment directly from Dashboard
  const handleDeletePayment = async (paymentId: string) => {
    await BudgetService.deletePayment(paymentId);
    showToast("Đã xóa lịch thanh toán thành công!");
    loadDashboard();
  };

  if (!wedding || !countdown || !budgetSummary || !guestStats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#8B5E5A] border-t-transparent" />
          <p className="font-serif text-sm text-[#8B5E5A] dark:text-[#D6BE91]">Đang tải không gian cưới của bạn...</p>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const taskProgressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "PENDING") return t.status !== "COMPLETED";
    if (taskFilter === "URGENT") return t.status !== "COMPLETED" && (t.priority === "URGENT" || t.priority === "HIGH");
    if (taskFilter === "COMPLETED") return t.status === "COMPLETED";
    return true;
  });

  const pendingPayments = payments.filter((p) => p.status !== "PAID");
  const urgentTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.priority === "URGENT");

  // Seating statistics
  const seatedGuestsCount = WeddingStore.getGuests().filter((g) => g.table_id && !g.deleted_at).length;
  const confirmedUnseated = Math.max(0, guestStats.confirmed - seatedGuestsCount);

  // Wedding Readiness Score calculation (0 - 100)
  // Tasks (40%), Budget control (20%), RSVP confirmations (20%), Vendors confirmed (20%)
  const taskScore = taskProgressPct * 0.4;
  const budgetScore = (budgetSummary.overBudgetAmount === 0 ? 100 : Math.max(0, 100 - (budgetSummary.overBudgetAmount / budgetSummary.totalBudget) * 100)) * 0.2;
  const rsvpRate = wedding.expected_guests > 0 ? Math.min(100, (guestStats.confirmed / wedding.expected_guests) * 100) : 0;
  const rsvpScore = rsvpRate * 0.2;
  const bookedVendorsCount = vendors.filter((v) => v.status === "BOOKED").length;
  const vendorScore = Math.min(100, (bookedVendorsCount / Math.max(1, vendors.length)) * 100) * 0.2;
  const readinessIndex = Math.min(100, Math.round(taskScore + budgetScore + rsvpScore + vendorScore));

  // Time of Day Greeting
  const currentHour = new Date().getHours();
  const greetingText =
    currentHour < 12
      ? "Chào buổi sáng rạng rỡ"
      : currentHour < 18
      ? "Chào buổi chiều an lành"
      : "Chào buổi tối ấm áp";

  // Essential wedding service radar
  const keyServiceCategories = [
    { title: "Sảnh tiệc & Ẩm thực", icon: Building, catKey: "Địa điểm" },
    { title: "Nhiếp ảnh & Phóng sự", icon: Camera, catKey: "Chụp ảnh" },
    { title: "Váy & Vest cưới", icon: Shirt, catKey: "Trang phục" },
    { title: "Hoa tươi & Concept Decor", icon: Flower2, catKey: "Trang trí" },
    { title: "Âm thanh & MC Hôn lễ", icon: Mic2, catKey: "Âm thanh & MC" },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Romantic Header with Live Countdown & Readiness Score */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#241E1C] via-[#382C29] to-[#211A19] p-6 sm:p-8 md:p-10 text-white shadow-2xl border border-white/10">
        {/* Glow ambient background elements */}
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#D6BE91]/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 h-64 w-64 rounded-full bg-[#8B5E5A]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          {/* Left Column: Greeting & Wedding Identity */}
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-[#D6BE91] backdrop-blur-md border border-white/15 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#D6BE91] animate-spin" style={{ animationDuration: "6s" }} />
              <span className="font-medium tracking-wide">
                {greetingText}, {wedding.bride_name} & {wedding.groom_name}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FFFDF9] leading-tight drop-shadow-sm">
              {wedding.bride_name} & {wedding.groom_name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-[#EADBCE]">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/5">
                <Calendar className="h-3.5 w-3.5 text-[#D6BE91]" />
                <span className="font-medium">{wedding.wedding_date}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/5">
                <MapPin className="h-3.5 w-3.5 text-[#D6BE91]" />
                <span>{wedding.venue || "Chưa thiết lập địa điểm"}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/5">
                <Sparkle className="h-3.5 w-3.5 text-[#D6BE91]" />
                <span>Phong cách: {wedding.style || "Modern Luxury"}</span>
              </span>
            </div>

            {/* Wedding Readiness Gauge Summary */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm border border-white/10">
                <ShieldCheck className="h-4 w-4 text-[#7BD499]" />
                <span className="text-xs text-white/90">
                  Chỉ số sẵn sàng hôn lễ: <strong className="text-[#D6BE91] text-sm">{readinessIndex}%</strong>
                </span>
                <span className="text-[10px] text-white/70">
                  ({readinessIndex >= 80 ? "Rất xuất sắc ✨" : readinessIndex >= 60 ? "Tiến độ tốt 👍" : "Cần tăng tốc ⚡"})
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Countdown Clock */}
          <div className="flex flex-col items-center xl:items-end gap-3 shrink-0">
            <div className="text-center xl:text-right">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D6BE91]">
                Đếm ngược ngày chung đôi
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 sm:gap-3 bg-black/35 p-3 sm:p-4 rounded-[22px] backdrop-blur-xl border border-white/15 shadow-2xl">
              <div className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[68px] p-2 sm:p-2.5 bg-white/10 rounded-[14px] border border-white/10">
                <span className="font-serif text-xl sm:text-3xl font-extrabold text-[#D6BE91]">
                  {countdown.totalDays}
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium text-white/80 uppercase tracking-wider">Ngày</span>
              </div>
              <span className="font-serif text-xl sm:text-2xl text-[#D6BE91] animate-pulse">:</span>
              <div className="flex flex-col items-center justify-center min-w-[46px] sm:min-w-[58px] p-2 sm:p-2.5 bg-white/10 rounded-[14px] border border-white/10">
                <span className="font-serif text-xl sm:text-3xl font-extrabold text-[#FFFDF9]">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium text-white/80 uppercase tracking-wider">Giờ</span>
              </div>
              <span className="font-serif text-xl sm:text-2xl text-[#D6BE91] animate-pulse">:</span>
              <div className="flex flex-col items-center justify-center min-w-[46px] sm:min-w-[58px] p-2 sm:p-2.5 bg-white/10 rounded-[14px] border border-white/10">
                <span className="font-serif text-xl sm:text-3xl font-extrabold text-[#FFFDF9]">
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium text-white/80 uppercase tracking-wider">Phút</span>
              </div>
              <span className="font-serif text-xl sm:text-2xl text-[#D6BE91] animate-pulse">:</span>
              <div className="flex flex-col items-center justify-center min-w-[46px] sm:min-w-[58px] p-2 sm:p-2.5 bg-white/10 rounded-[14px] border border-white/10">
                <span className="font-serif text-xl sm:text-3xl font-extrabold text-[#D6BE91]">
                  {String(countdown.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium text-white/80 uppercase tracking-wider">Giây</span>
              </div>
            </div>

            <button
              onClick={handleCelebrate}
              className="mt-1 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D6BE91] to-[#C5A880] px-4 py-1.5 text-xs font-bold text-[#2C2422] shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <PartyPopper className="h-3.5 w-3.5" />
              <span>Bắn pháo hoa chúc mừng 🎉</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Command Action Strip (Interconnected actions across all subsystems) */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3.5 rounded-[20px] bg-white border border-[#EADBCE] shadow-sm dark:bg-[#1E1918] dark:border-[#3A302E]">
        <div className="flex items-center gap-1.5 px-2 text-xs font-bold uppercase tracking-wider text-[#8B5E5A] dark:text-[#D6BE91] border-r border-[#EADBCE] dark:border-[#3A302E] mr-1 hidden sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Thao tác nhanh:</span>
        </div>

        <button
          onClick={() => triggerAction("task")}
          className="flex items-center gap-1.5 rounded-[12px] bg-[#F5EFE7] hover:bg-[#EADBCE] px-3 py-2 text-xs font-semibold text-[#2C2422] transition-colors dark:bg-[#2A2321] dark:text-[#F5EFE7] dark:hover:bg-[#382F2C]"
        >
          <Plus className="h-3.5 w-3.5 text-[#8B5E5A] dark:text-[#D6BE91]" />
          <span>Thêm công việc</span>
        </button>

        <button
          onClick={() => triggerAction("expense")}
          className="flex items-center gap-1.5 rounded-[12px] bg-[#F5EFE7] hover:bg-[#EADBCE] px-3 py-2 text-xs font-semibold text-[#2C2422] transition-colors dark:bg-[#2A2321] dark:text-[#F5EFE7] dark:hover:bg-[#382F2C]"
        >
          <Receipt className="h-3.5 w-3.5 text-[#3F7D5A]" />
          <span>Ghi chi tiêu</span>
        </button>

        <button
          onClick={() => triggerAction("guest")}
          className="flex items-center gap-1.5 rounded-[12px] bg-[#F5EFE7] hover:bg-[#EADBCE] px-3 py-2 text-xs font-semibold text-[#2C2422] transition-colors dark:bg-[#2A2321] dark:text-[#F5EFE7] dark:hover:bg-[#382F2C]"
        >
          <Users className="h-3.5 w-3.5 text-[#C68A27]" />
          <span>Thêm khách mời</span>
        </button>

        <button
          onClick={() => triggerAction("payment")}
          className="flex items-center gap-1.5 rounded-[12px] bg-[#F5EFE7] hover:bg-[#EADBCE] px-3 py-2 text-xs font-semibold text-[#2C2422] transition-colors dark:bg-[#2A2321] dark:text-[#F5EFE7] dark:hover:bg-[#382F2C]"
        >
          <CreditCard className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Lập lịch trả tiền</span>
        </button>

        <button
          onClick={handleCopyRSVP}
          className="flex items-center gap-1.5 rounded-[12px] border border-[#D6BE91] bg-white hover:bg-[#FEF8EC] px-3 py-2 text-xs font-semibold text-[#8B5E5A] transition-colors dark:bg-[#221C1B] dark:text-[#D6BE91] dark:hover:bg-[#2A2321]"
          title="Sao chép đường dẫn link RSVP công khai để gửi cho khách"
        >
          {copiedLink ? <Check className="h-3.5 w-3.5 text-[#3F7D5A]" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedLink ? "Đã chép link!" : "Sao chép link RSVP"}</span>
        </button>

        <button
          onClick={() => triggerAction("ai")}
          className="ml-auto flex items-center gap-1.5 rounded-[12px] bg-gradient-to-r from-[#8B5E5A] to-[#6E423E] hover:opacity-95 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-opacity"
        >
          <Bot className="h-3.5 w-3.5 text-[#D6BE91]" />
          <span>Cố vấn Emma AI</span>
        </button>
      </div>

      {/* 3. Smart Alerts & Real-Time Warning Center */}
      {(urgentTasks.length > 0 || pendingPayments.length > 0 || confirmedUnseated > 0) && (
        <div className="rounded-[20px] border border-[#F6E1B6] bg-gradient-to-r from-[#FEF8EC] to-[#FFFBF5] p-4.5 sm:p-5 dark:bg-gradient-to-r dark:from-[#261E16] dark:to-[#1F1916] dark:border-[#52412B] shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-[#FEF0D2] text-[#C68A27] shrink-0 dark:bg-[#382D1D]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif font-bold text-sm text-[#8B5E5A] dark:text-[#D6BE91]">
                  Cảnh báo thông minh & Nhắc việc quan trọng:
                </h3>
                <span className="text-[11px] font-medium text-[#A69591]">
                  Tự động phân tích theo tiến độ thực tế
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                {pendingPayments.length > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/80 dark:bg-[#2A2321]/80 border border-[#EADBCE]/60 dark:border-[#3A302E]">
                    <div className="truncate pr-2">
                      <p className="font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                        {pendingPayments.length} Khoản thanh toán cần chú ý
                      </p>
                      <p className="text-[11px] text-[#A69591] truncate">
                        Sắp đến hạn cho {pendingPayments[0].vendor_name}
                      </p>
                    </div>
                    <Link
                      href="/payments"
                      className="px-2.5 py-1 rounded-[8px] bg-[#F5EFE7] hover:bg-[#8B5E5A] hover:text-white text-[11px] font-semibold text-[#8B5E5A] transition-colors shrink-0 dark:bg-[#382F2C] dark:text-[#D6BE91]"
                    >
                      Kiểm tra
                    </Link>
                  </div>
                )}

                {urgentTasks.length > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/80 dark:bg-[#2A2321]/80 border border-[#EADBCE]/60 dark:border-[#3A302E]">
                    <div className="truncate pr-2">
                      <p className="font-bold text-[#B44A4A]">
                        {urgentTasks.length} Công việc khẩn cấp (Urgent)
                      </p>
                      <p className="text-[11px] text-[#A69591] truncate">{urgentTasks[0].title}</p>
                    </div>
                    <Link
                      href="/tasks"
                      className="px-2.5 py-1 rounded-[8px] bg-[#FDF2F2] hover:bg-[#B44A4A] hover:text-white text-[11px] font-semibold text-[#B44A4A] transition-colors shrink-0 dark:bg-[#382020]"
                    >
                      Xử lý ngay
                    </Link>
                  </div>
                )}

                {confirmedUnseated > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/80 dark:bg-[#2A2321]/80 border border-[#EADBCE]/60 dark:border-[#3A302E]">
                    <div className="truncate pr-2">
                      <p className="font-bold text-[#C68A27]">
                        {confirmedUnseated} Khách đã RSVP chưa xếp bàn
                      </p>
                      <p className="text-[11px] text-[#A69591] truncate">Vào sơ đồ bàn để xếp chỗ</p>
                    </div>
                    <Link
                      href="/tables"
                      className="px-2.5 py-1 rounded-[8px] bg-[#FEF8EC] hover:bg-[#C68A27] hover:text-white text-[11px] font-semibold text-[#C68A27] transition-colors shrink-0 dark:bg-[#3A311F]"
                    >
                      Xếp bàn
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Financial Health Radar: 4 Connected Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
            <h2 className="font-serif font-bold text-base text-[#2C2422] dark:text-[#F5EFE7]">
              Sức khỏe Tài chính & Dòng tiền Hôn lễ
            </h2>
          </div>
          <Link
            href="/budget"
            className="text-xs font-semibold text-[#8B5E5A] hover:underline dark:text-[#D6BE91] flex items-center gap-1"
          >
            <span>Chi tiết ngân sách & Hợp đồng</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Estimated Budget */}
          <Card className="p-4 hover:border-[#D6BE91] transition-all bg-white dark:bg-[#1E1918]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B5E5B] dark:text-[#A69591]">Ngân sách dự kiến</span>
              <span className="rounded-xl bg-[#F5EFE7] p-2 text-[#8B5E5A] dark:bg-[#2A2321] dark:text-[#D6BE91]">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            <p className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-2.5">
              {formatCurrencyVND(budgetSummary.totalBudget)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-[#6B5E5B] dark:text-[#A69591]">
              <span>Đã ký HĐ: {formatCurrencyVND(budgetSummary.totalCommitted)}</span>
              <Badge variant="champagne">{wedding.style || "Tự thiết kế"}</Badge>
            </div>
          </Card>

          {/* Card 2: Actual Spent */}
          <Card className="p-4 hover:border-[#D6BE91] transition-all bg-white dark:bg-[#1E1918]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B5E5B] dark:text-[#A69591]">Thực tế đã chi</span>
              <span className="rounded-xl bg-[#EBF5F0] p-2 text-[#3F7D5A] dark:bg-[#1C2C23]">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2.5">
              <p className="font-serif text-2xl font-bold text-[#3F7D5A] dark:text-[#7BD499]">
                {formatCurrencyVND(budgetSummary.totalSpent)}
              </p>
              <span className="text-xs font-bold text-[#3F7D5A]">({budgetSummary.spentPercentage}%)</span>
            </div>
            <div className="w-full bg-[#F5EFE7] h-2 rounded-full mt-3 overflow-hidden dark:bg-[#2A2321]">
              <div
                className="bg-[#3F7D5A] h-full rounded-full transition-all duration-500"
                style={{ width: `${budgetSummary.spentPercentage}%` }}
              />
            </div>
          </Card>

          {/* Card 3: Remaining Safe Reserve */}
          <Card className="p-4 hover:border-[#D6BE91] transition-all bg-white dark:bg-[#1E1918]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B5E5B] dark:text-[#A69591]">Quỹ khả dụng còn lại</span>
              <span className="rounded-xl bg-[#FEF8EC] p-2 text-[#C68A27] dark:bg-[#2E2619]">
                <CreditCard className="h-4 w-4" />
              </span>
            </div>
            <p className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-2.5">
              {formatCurrencyVND(budgetSummary.remainingBudget)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#6B5E5B] dark:text-[#A69591]">
                {budgetSummary.overBudgetAmount > 0 ? "Vượt ngân sách:" : "Trạng thái:"}
              </span>
              <span className={budgetSummary.overBudgetAmount > 0 ? "font-bold text-[#B44A4A]" : "font-bold text-[#3F7D5A]"}>
                {budgetSummary.overBudgetAmount > 0 ? `+${formatCurrencyVND(budgetSummary.overBudgetAmount)}` : "An toàn ✓"}
              </span>
            </div>
          </Card>

          {/* Card 4: Supplier Outstanding Balance */}
          <Card className="p-4 hover:border-[#D6BE91] transition-all bg-white dark:bg-[#1E1918]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B5E5B] dark:text-[#A69591]">Công nợ nhà cung cấp</span>
              <span className="rounded-xl bg-[#FDF2F2] p-2 text-[#B44A4A] dark:bg-[#301B1B]">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <p className="font-serif text-2xl font-bold text-[#B44A4A] dark:text-[#FF8A8A] mt-2.5">
              {formatCurrencyVND(pendingPayments.reduce((s, p) => s + p.remaining_amount, 0))}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-[#6B5E5B] dark:text-[#A69591]">
              <span>{pendingPayments.length} khoản còn phải trả</span>
              <Link href="/payments" className="font-bold text-[#8B5E5A] dark:text-[#D6BE91] hover:underline">
                Xem lịch &rarr;
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Guest Attendance & Seating Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RSVP Pulse Card */}
        <Card className="p-5 bg-white dark:bg-[#1E1918] lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
              <h3 className="font-serif font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                Tiến độ xác nhận khách mời (RSVP)
              </h3>
            </div>
            <Link href="/guests" className="text-xs font-semibold text-[#8B5E5A] dark:text-[#D6BE91] hover:underline">
              Quản lý danh sách ({guestStats.total} khách) &rarr;
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-[#EBF5F0] dark:bg-[#18281F] border border-[#3F7D5A]/20">
              <span className="text-[11px] font-semibold text-[#3F7D5A] uppercase tracking-wide">Đã xác nhận</span>
              <p className="font-serif text-2xl font-bold text-[#3F7D5A] mt-1">{guestStats.confirmed}</p>
              <span className="text-[10px] text-[#3F7D5A]/80 font-medium">
                {wedding.expected_guests > 0 ? Math.round((guestStats.confirmed / wedding.expected_guests) * 100) : 0}% mục tiêu
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FEF8EC] dark:bg-[#282218] border border-[#C68A27]/20">
              <span className="text-[11px] font-semibold text-[#C68A27] uppercase tracking-wide">Đang chờ phản hồi</span>
              <p className="font-serif text-2xl font-bold text-[#C68A27] mt-1">{guestStats.pending}</p>
              <span className="text-[10px] text-[#C68A27]/80 font-medium">Cần nhắc trước 14 ngày</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FDF2F2] dark:bg-[#2B1B1B] border border-[#B44A4A]/20">
              <span className="text-[11px] font-semibold text-[#B44A4A] uppercase tracking-wide">Từ chối tham dự</span>
              <p className="font-serif text-2xl font-bold text-[#B44A4A] mt-1">{guestStats.declined}</p>
              <span className="text-[10px] text-[#B44A4A]/80 font-medium">Đã gửi lời chúc</span>
            </div>
          </div>

          {/* Visual attendance progress bar */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6B5E5B] dark:text-[#A69591]">
              <span>Tỷ lệ lấp đầy sảnh tiệc:</span>
              <span className="font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                {guestStats.confirmedGuestsTotal} người tham dự / Mục tiêu {wedding.expected_guests} khách
              </span>
            </div>
            <div className="w-full bg-[#F5EFE7] dark:bg-[#2A2321] h-3 rounded-full overflow-hidden flex">
              <div
                className="bg-[#3F7D5A] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (guestStats.confirmed / wedding.expected_guests) * 100)}%` }}
                title="Đã xác nhận"
              />
              <div
                className="bg-[#C68A27] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (guestStats.pending / wedding.expected_guests) * 100)}%` }}
                title="Đang chờ"
              />
              <div
                className="bg-[#B44A4A] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (guestStats.declined / wedding.expected_guests) * 100)}%` }}
                title="Từ chối"
              />
            </div>
          </div>
        </Card>

        {/* Seating Allocation Radar */}
        <Card className="p-5 bg-white dark:bg-[#1E1918] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
              <div className="flex items-center gap-2">
                <Armchair className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
                <h3 className="font-serif font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                  Sơ đồ bàn tiệc
                </h3>
              </div>
              <Badge variant="champagne">{tables.length} Bàn tiệc</Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B5E5B] dark:text-[#A69591]">Khách đã được xếp chỗ:</span>
                <span className="font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                  {seatedGuestsCount} / {guestStats.confirmed} khách ({tables.reduce((acc, t) => acc + t.capacity, 0)} chỗ)
                </span>
              </div>
              <div className="w-full bg-[#F5EFE7] dark:bg-[#2A2321] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#8B5E5A] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${guestStats.confirmed > 0 ? Math.min(100, Math.round((seatedGuestsCount / guestStats.confirmed) * 100)) : 0}%`,
                  }}
                />
              </div>

              {confirmedUnseated > 0 ? (
                <div className="p-2.5 rounded-xl bg-[#FEF8EC] dark:bg-[#2E2619] border border-[#F6E1B6] dark:border-[#473B25] text-xs text-[#C68A27] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Còn {confirmedUnseated} khách xác nhận chưa được chỉ định bàn!</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#EBF5F0] dark:bg-[#1C2C23] border border-[#3F7D5A]/20 text-xs text-[#3F7D5A] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>100% khách đã xác nhận đều có chỗ ngồi!</span>
                </div>
              )}
            </div>
          </div>

          <Link href="/tables" className="mt-4 w-full">
            <Button variant="outline" className="w-full text-xs">
              <Armchair className="h-3.5 w-3.5 mr-1.5" />
              Mở sơ đồ kéo thả bàn tiệc
            </Button>
          </Link>
        </Card>
      </div>

      {/* 6. Tasks & Milestones Center with Direct Checkbox Interaction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Tasks List (2 Columns) */}
        <Card className="p-5 bg-white dark:bg-[#1E1918] lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
              <h3 className="font-serif font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                Công việc trọng tâm & Checklist
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#F5EFE7] dark:bg-[#2A2321] p-1 rounded-xl text-xs">
              <button
                onClick={() => setTaskFilter("PENDING")}
                className={`px-2.5 py-1 rounded-[8px] font-semibold transition-all ${
                  taskFilter === "PENDING"
                    ? "bg-white text-[#8B5E5A] shadow-xs dark:bg-[#1E1918] dark:text-[#D6BE91]"
                    : "text-[#6B5E5B] hover:text-[#2C2422] dark:text-[#A69591]"
                }`}
              >
                Cần làm ({tasks.filter((t) => t.status !== "COMPLETED").length})
              </button>
              <button
                onClick={() => setTaskFilter("URGENT")}
                className={`px-2.5 py-1 rounded-[8px] font-semibold transition-all ${
                  taskFilter === "URGENT"
                    ? "bg-white text-[#B44A4A] shadow-xs dark:bg-[#1E1918]"
                    : "text-[#6B5E5B] hover:text-[#2C2422] dark:text-[#A69591]"
                }`}
              >
                Gấp ({urgentTasks.length})
              </button>
              <button
                onClick={() => setTaskFilter("COMPLETED")}
                className={`px-2.5 py-1 rounded-[8px] font-semibold transition-all ${
                  taskFilter === "COMPLETED"
                    ? "bg-white text-[#3F7D5A] shadow-xs dark:bg-[#1E1918]"
                    : "text-[#6B5E5B] hover:text-[#2C2422] dark:text-[#A69591]"
                }`}
              >
                Đã xong ({completedTasks})
              </button>
            </div>
          </div>

          {/* Interactive Tasks Item List */}
          <div className="divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
            {filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#A69591]">
                <CheckCircle2 className="h-8 w-8 mx-auto text-[#3F7D5A]/50 mb-2" />
                <p>Không có công việc nào trong danh mục này!</p>
              </div>
            ) : (
              filteredTasks.slice(0, 5).map((t) => {
                const isCompleted = t.status === "COMPLETED";
                return (
                  <div
                    key={t.id}
                    className="py-3 flex items-start justify-between gap-3 group hover:bg-[#FAF6F0] dark:hover:bg-[#251E1D] px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Interactive Checkbox */}
                      <button
                        onClick={() => handleToggleTask(t)}
                        className={`mt-0.5 h-5 w-5 rounded-[6px] border flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-[#3F7D5A] border-[#3F7D5A] text-white"
                            : "border-[#C5B4A8] bg-white hover:border-[#8B5E5A] dark:bg-[#2A2321] dark:border-[#4A3D39]"
                        }`}
                        title={isCompleted ? "Đánh dấu chưa làm" : "Đánh dấu đã hoàn thành"}
                      >
                        {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-semibold ${
                            isCompleted
                              ? "line-through text-[#A69591]"
                              : "text-[#2C2422] dark:text-[#F5EFE7]"
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#A69591]">
                          <span>{t.category}</span>
                          {t.due_date && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Hạn: {t.due_date}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={
                          t.priority === "URGENT"
                            ? "danger"
                            : t.priority === "HIGH"
                            ? "warning"
                            : "champagne"
                        }
                      >
                        {t.priority === "URGENT"
                          ? "Khẩn cấp"
                          : t.priority === "HIGH"
                          ? "Ưu tiên"
                          : "Bình thường"}
                      </Badge>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-1 rounded-md text-[#A69591] hover:text-[#B44A4A] hover:bg-[#FDF2F2] dark:hover:bg-[#301B1B] transition-colors"
                        title="Xóa công việc"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-[#6B5E5B] dark:text-[#A69591]">
              Đã hoàn thành {completedTasks}/{tasks.length} hạng mục ({taskProgressPct}%)
            </span>
            <Link
              href="/tasks"
              className="font-semibold text-[#8B5E5A] hover:underline dark:text-[#D6BE91] flex items-center gap-1"
            >
              <span>Xem bảng Kanban đầy đủ</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* Upcoming Payment Contracts */}
        <Card className="p-5 bg-white dark:bg-[#1E1918] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
              <h3 className="font-serif font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                Thanh toán đến hạn
              </h3>
            </div>
            <Link href="/payments" className="text-xs font-semibold text-[#8B5E5A] dark:text-[#D6BE91] hover:underline">
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
            {pendingPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#A69591]">
                <CheckCircle2 className="h-8 w-8 mx-auto text-[#3F7D5A]/50 mb-2" />
                <p>Không có khoản nợ nào cần thanh toán!</p>
              </div>
            ) : (
              pendingPayments.slice(0, 3).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] truncate">
                      {p.vendor_name}
                    </p>
                    <p className="text-[11px] text-[#A69591] mt-0.5">
                      Hạn: {p.due_date || "Trước ngày cưới"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-[#B44A4A] dark:text-[#FF8A8A]">
                        {formatCurrencyVND(p.remaining_amount)}
                      </p>
                      <button
                        onClick={() => handleQuickPay(p)}
                        className="mt-1 text-[10px] font-bold text-[#8B5E5A] hover:text-[#3F7D5A] hover:underline dark:text-[#D6BE91]"
                      >
                        Xác nhận đã trả &rarr;
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeletePayment(p.id)}
                      className="p-1 rounded-md text-[#A69591] hover:text-[#B44A4A] hover:bg-[#FDF2F2] dark:hover:bg-[#301B1B] transition-colors"
                      title="Xóa đợt thanh toán"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => triggerAction("payment")}
            className="w-full mt-2 rounded-[12px] border border-dashed border-[#8B5E5A]/40 p-2 text-xs font-semibold text-[#8B5E5A] dark:text-[#D6BE91] hover:bg-[#FAF6F0] dark:hover:bg-[#2A2321] transition-colors"
          >
            + Thêm đợt thanh toán hợp đồng
          </button>
        </Card>
      </div>

      {/* 7. Key Vendor Status Radar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
            <h2 className="font-serif font-bold text-base text-[#2C2422] dark:text-[#F5EFE7]">
              Nhà cung cấp & Đối tác dịch vụ trọng điểm
            </h2>
          </div>
          <Link href="/vendors" className="text-xs font-semibold text-[#8B5E5A] hover:underline dark:text-[#D6BE91]">
            Xem danh bạ đối tác ({vendors.length}) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {keyServiceCategories.map((item, idx) => {
            const Icon = item.icon;
            const matchedVendor = vendors.find(
              (v) => v.category.toLowerCase().includes(item.catKey.toLowerCase())
            );
            const isBooked = matchedVendor?.status === "BOOKED";

            return (
              <Card
                key={idx}
                className="p-3.5 bg-white dark:bg-[#1E1918] hover:border-[#D6BE91] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-[#F5EFE7] dark:bg-[#2A2321] text-[#8B5E5A] dark:text-[#D6BE91]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <Badge variant={isBooked ? "champagne" : "default"}>
                      {isBooked ? "Đã chốt" : matchedVendor ? "Đang liên hệ" : "Chưa chọn"}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#A69591] mt-0.5 truncate">
                    {matchedVendor ? matchedVendor.name : "Chưa chọn đối tác"}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#EADBCE]/50 dark:border-[#3A302E] flex items-center justify-between">
                  {matchedVendor?.phone ? (
                    <a
                      href={`tel:${matchedVendor.phone}`}
                      className="text-[11px] font-semibold text-[#3F7D5A] hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      Gọi điện
                    </a>
                  ) : (
                    <Link
                      href="/vendors"
                      className="text-[11px] font-semibold text-[#8B5E5A] hover:underline dark:text-[#D6BE91]"
                    >
                      Chọn đối tác &rarr;
                    </Link>
                  )}
                  {matchedVendor?.price ? (
                    <span className="text-[10px] font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                      {formatCurrencyVND(matchedVendor.price)}
                    </span>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 8. Wedding Day Live Run-Sheet Preview & Digital Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Run-Sheet Preview */}
        <Card className="p-5 bg-white dark:bg-[#1E1918] lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
              <h3 className="font-serif font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                Kịch bản nghi lễ ngày cưới
              </h3>
            </div>
            <Link
              href="/wedding-day"
              className="flex items-center gap-1 text-xs font-bold text-[#3F7D5A] hover:underline"
            >
              <Heart className="h-3.5 w-3.5 fill-current text-[#3F7D5A]" />
              <span>Chế độ Ngày Cưới Trực Tiếp &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timelineEvents.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-2xl bg-[#F5EFE7]/50 dark:bg-[#2A2321]/50 border border-[#EADBCE] dark:border-[#3A302E] flex items-start gap-3"
              >
                <div className="px-2.5 py-1.5 rounded-xl bg-[#8B5E5A] text-white font-mono font-bold text-xs shrink-0">
                  {evt.start_time}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] truncate">
                    {evt.title}
                  </p>
                  <p className="text-[11px] text-[#A69591] truncate mt-0.5">
                    {evt.location || "Tại tư gia"}
                  </p>
                  {evt.assignee_name && (
                    <span className="inline-block mt-1 text-[10px] text-[#8B5E5A] dark:text-[#D6BE91] font-medium">
                      Phụ trách: {evt.assignee_name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-[#A69591]">Tổng cộng {timelineEvents.length} mốc kịch bản đã lên</span>
            <Link href="/timeline" className="font-semibold text-[#8B5E5A] hover:underline dark:text-[#D6BE91]">
              Chỉnh sửa kịch bản &rarr;
            </Link>
          </div>
        </Card>

        {/* Digital Assets & Website Hub */}
        <Card className="p-5 bg-white dark:bg-[#1E1918] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
                <h3 className="font-serif font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                  Website & Thiệp mời
                </h3>
              </div>
              <Badge variant="champagne">Đã xuất bản</Badge>
            </div>

            <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-3 leading-relaxed">
              Website đám cưới của bạn đang hoạt động công khai. Quan khách có thể gửi lời chúc, xem ảnh và xác nhận RSVP.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#282220] border border-[#EADBCE] dark:border-[#3A302E] text-xs">
              <p className="text-[11px] font-bold text-[#8B5E5A] dark:text-[#D6BE91]">Đường dẫn trang web:</p>
              <p className="font-mono text-[11px] text-[#2C2422] dark:text-[#F5EFE7] mt-0.5 truncate">
                /w/{wedding.slug}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link href="/wedding-website" className="w-full block">
              <Button variant="primary" className="w-full text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Chỉnh sửa giao diện Website Studio
              </Button>
            </Link>

            <Link href="/invitations" className="w-full block">
              <Button variant="outline" className="w-full text-xs">
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Xem mẫu thiệp cưới số
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
