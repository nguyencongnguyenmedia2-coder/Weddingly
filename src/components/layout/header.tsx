"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  PlusCircle,
  Heart,
  Calendar,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Bot,
  Trash2,
  Crown,
  PackageCheck,
} from "lucide-react";
import { Wedding } from "@/types/database";
import { initialSeedWedding } from "@/lib/mock-data";
import { WeddingService } from "@/services/wedding.service";
import { WeddingStore } from "@/lib/wedding-store";
import { AuthService, AuthUser } from "@/services/auth.service";
import { SubscriptionService } from "@/services/subscription.service";
import { UpgradePlanModal } from "@/components/modals/upgrade-plan-modal";
import { UserOrderTrackingModal } from "@/components/modals/user-order-tracking-modal";

export function Header({
  onOpenSearch,
}: {
  onOpenSearch?: () => void;
}) {
  const router = useRouter();
  const [wedding, setWedding] = React.useState<Wedding>(initialSeedWedding);
  const [weddings, setWeddings] = React.useState<Wedding[]>([initialSeedWedding]);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = React.useState(false);
  const [pendingOrderCount, setPendingOrderCount] = React.useState(0);

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    WeddingService.getActiveWedding().then(setWedding);
    WeddingService.getUserWeddings().then(setWeddings);

    const syncUser = () => {
      const user = AuthService.getCurrentUser();
      setCurrentUser(user);
      const orders = SubscriptionService.getUserOrders(user?.id);
      setPendingOrderCount(orders.filter((o) => o.status === "PENDING").length);
    };
    syncUser();

    if (typeof window !== "undefined") {
      window.addEventListener("weddingly_auth_changed", syncUser);
      window.addEventListener("weddingly_orders_changed", syncUser);
      window.addEventListener("storage", syncUser);
    }

    // Sync dark mode preference
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark") ||
        localStorage.getItem("wedding_theme") === "dark";
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("weddingly_auth_changed", syncUser);
        window.removeEventListener("weddingly_orders_changed", syncUser);
        window.removeEventListener("storage", syncUser);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (typeof window !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("wedding_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("wedding_theme", "light");
      }
    }
  };

  const handleOpenEmmaAI = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trigger_quick_action", { detail: "ai" }));
    }
  };

  const handleSwitchWedding = async (id: string) => {
    const switched = await WeddingService.switchWedding(id);
    if (switched) {
      setWedding(switched);
      setDropdownOpen(false);
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-[#EADBCE] bg-[#FFFDF9]/95 px-3 sm:px-6 md:px-8 backdrop-blur-md dark:bg-[#181413]/95 dark:border-[#3A302E]">
      {/* Wedding Workspace Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 sm:gap-2.5 rounded-[12px] border border-[#EADBCE] bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-sm hover:border-[#D6BE91] transition-all dark:bg-[#221C1B] dark:border-[#3A302E]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#F5EFE7] text-[#8B5E5A] dark:bg-[#2A2321]">
            <Heart className="h-4 w-4 fill-current text-[#8B5E5A]" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] leading-none">
              {wedding.bride_name} & {wedding.groom_name}
            </p>
            <p className="text-[10px] text-[#6B5E5B] dark:text-[#A69591] flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-[#D6BE91]" />
              {wedding.wedding_date}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-[#6B5E5B] dark:text-[#A69591]" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-[16px] border border-[#EADBCE] bg-white p-2 shadow-xl dark:bg-[#221C1B] dark:border-[#3A302E] z-50">
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A69591]">
              Không gian đám cưới
            </p>
            {weddings.map((w) => (
              <button
                key={w.id}
                onClick={() => handleSwitchWedding(w.id)}
                className={`w-full flex items-center justify-between rounded-[10px] px-3 py-2 text-xs text-left transition-colors ${
                  w.id === wedding.id
                    ? "bg-[#F5EFE7] text-[#8B5E5A] font-semibold dark:bg-[#2A2321]"
                    : "text-[#2C2422] hover:bg-[#FAF6F0] dark:text-[#F5EFE7] dark:hover:bg-[#2A2321]"
                }`}
              >
                <span>{w.name}</span>
                {w.id === wedding.id && <Sparkles className="h-3.5 w-3.5 text-[#D6BE91]" />}
              </button>
            ))}
            <div className="my-1 border-t border-[#EADBCE] dark:border-[#3A302E]" />
            <Link
              href="/onboarding"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-medium text-[#8B5E5A] hover:bg-[#F5EFE7] transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tạo đám cưới mới</span>
            </Link>
            <button
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn xoá toàn bộ dữ liệu mẫu để làm việc với dữ liệu thật?")) {
                  WeddingStore.clearAllDemoData();
                  setDropdownOpen(false);
                  window.location.reload();
                }
              }}
              className="w-full flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Xoá sạch dữ liệu mẫu (Reset)</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4">
        {/* Search Bar Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-[12px] border border-[#EADBCE] bg-white p-2 sm:px-3 sm:py-2 text-xs text-[#6B5E5B] shadow-sm hover:border-[#D6BE91] transition-all dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#A69591]"
          title="Tìm kiếm nhanh (Ctrl + K)"
        >
          <Search className="h-4 w-4 text-[#8B5E5A]" />
          <span className="hidden md:inline">Tìm kiếm nhanh...</span>
          <kbd className="hidden md:inline rounded bg-[#F5EFE7] px-1.5 py-0.5 text-[10px] font-mono text-[#8B5E5A]">
            Ctrl + K
          </kbd>
        </button>

        {/* Emma AI Assistant Shortcut */}
        <button
          onClick={handleOpenEmmaAI}
          className="flex items-center gap-1.5 rounded-[12px] border border-[#D6BE91]/50 bg-[#FEF8EC] px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-[#8B5E5A] shadow-sm hover:bg-[#F2E9DC] transition-all dark:bg-[#2A2321] dark:border-[#8B5E5A]/40 dark:text-[#D6BE91]"
          title="Trò chuyện với Emma AI"
        >
          <Bot className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
          <span className="hidden sm:inline">Emma AI</span>
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-[12px] border border-[#EADBCE] bg-white p-2 sm:p-2.5 text-[#6B5E5B] shadow-sm hover:border-[#D6BE91] hover:text-[#8B5E5A] transition-all dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#D6BE91]"
          title={isDarkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-[#D6BE91]" /> : <Moon className="h-4 w-4 text-[#8B5E5A]" />}
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative rounded-[12px] border border-[#EADBCE] bg-white p-2 sm:p-2.5 text-[#6B5E5B] shadow-sm hover:border-[#D6BE91] hover:text-[#8B5E5A] transition-colors dark:bg-[#221C1B] dark:border-[#3A302E]"
          title="Thông báo"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5E5A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5E5A]"></span>
          </span>
        </Link>

        {/* Order Tracking Button */}
        <button
          onClick={() => setIsOrderTrackingOpen(true)}
          className="relative rounded-[12px] border border-[#EADBCE] bg-white p-2 sm:p-2.5 text-[#6B5E5B] shadow-sm hover:border-[#D6BE91] hover:text-[#8B5E5A] transition-colors dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#A69591] cursor-pointer"
          title="Theo dõi đơn mua gói & trạng thái duyệt"
        >
          <PackageCheck className="h-4 w-4" />
          {pendingOrderCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
              {pendingOrderCount}
            </span>
          )}
        </button>

        {/* Plan Upgrade / Status */}
        {currentUser?.plan === "VIP" ? (
          <button
            onClick={() => setIsOrderTrackingOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-900 text-[11px] font-extrabold shadow-xs hover:brightness-105 transition-all cursor-pointer"
            title="Bấm để xem thông tin gói & lịch sử đơn hàng"
          >
            <Crown className="h-3.5 w-3.5 fill-stone-900" />
            <span>VIP LUXURY</span>
          </button>
        ) : currentUser?.plan === "PRO" ? (
          <button
            onClick={() => setIsOrderTrackingOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/20 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-[11px] font-bold shadow-xs hover:brightness-105 transition-all cursor-pointer"
            title="Bấm để xem thông tin gói & lịch sử đơn hàng"
          >
            <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>PRO VIP</span>
          </button>
        ) : (
          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#8B5E5A] to-[#6A4643] text-white text-[11px] font-semibold hover:shadow-md hover:brightness-110 transition-all cursor-pointer"
            title="Nâng cấp gói dịch vụ"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D6BE91]" />
            <span className="hidden sm:inline">Nâng cấp gói</span>
            <span className="sm:hidden">Gói VIP</span>
          </button>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1.5 sm:pl-2.5 border-l border-[#EADBCE] dark:border-[#3A302E]">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#D6BE91] text-[#2C2422] font-serif font-bold text-xs shadow-sm shrink-0 uppercase">
            {currentUser?.full_name
              ? currentUser.full_name.split(" ").slice(-2).map((n) => n[0]).join("")
              : "KH"}
          </div>
          <div className="hidden sm:block text-left max-w-[120px]">
            <p className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] leading-none truncate">
              {currentUser?.full_name || wedding.bride_name || "Khách hàng"}
            </p>
            <p className="text-[10px] text-[#8B5E5A] dark:text-[#D6BE91] mt-0.5 font-medium flex items-center gap-1">
              {currentUser?.plan === "VIP"
                ? "Gói Kim Cương"
                : currentUser?.plan === "PRO"
                ? "Gói Hoàn Mỹ"
                : "Gói Miễn Phí"}
            </p>
          </div>
          <button
            onClick={async () => {
              await AuthService.logout();
              router.push("/login");
            }}
            title="Đăng xuất"
            className="p-1.5 text-[#A69591] hover:text-[#B44A4A] transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <UpgradePlanModal
        open={isUpgradeOpen}
        onOpenChange={setIsUpgradeOpen}
        reason="Nâng cấp lên Gói Hoàn Mỹ (PRO VIP) để không giới hạn khách mời, quản lý chi tiêu và sử dụng đầy đủ các tính năng độc quyền."
      />

      <UserOrderTrackingModal
        open={isOrderTrackingOpen}
        onOpenChange={setIsOrderTrackingOpen}
        onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
      />
    </header>
  );
}
