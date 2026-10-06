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
} from "lucide-react";
import { Wedding } from "@/types/database";
import { initialSeedWedding } from "@/lib/mock-data";
import { WeddingService } from "@/services/wedding.service";
import { WeddingStore } from "@/lib/wedding-store";

export function Header({
  onOpenSearch,
}: {
  onOpenSearch?: () => void;
}) {
  const router = useRouter();
  const [wedding, setWedding] = React.useState<Wedding>(initialSeedWedding);
  const [weddings, setWeddings] = React.useState<Wedding[]>([initialSeedWedding]);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    WeddingService.getActiveWedding().then(setWedding);
    WeddingService.getUserWeddings().then(setWeddings);

    // Sync dark mode preference
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark") ||
        localStorage.getItem("wedding_theme") === "dark";
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }
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

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1.5 sm:pl-2.5 border-l border-[#EADBCE] dark:border-[#3A302E]">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#D6BE91] text-[#2C2422] font-serif font-bold text-xs shadow-sm shrink-0">
            MA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] leading-none">
              Minh Anh
            </p>
            <p className="text-[10px] text-[#8B5E5A] mt-0.5 font-medium">Cô dâu (Owner)</p>
          </div>
          <Link
            href="/login"
            title="Đăng xuất"
            className="p-1.5 text-[#A69591] hover:text-[#B44A4A] transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
