"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  CalendarDays,
  PieChart,
  Receipt,
  CreditCard,
  Users,
  Armchair,
  Store,
  Sparkles,
  HeartHandshake,
  Send,
  Globe,
  Image as ImageIcon,
  StickyNote,
  Bell,
  BarChart3,
  Bot,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "TIẾN ĐỘ & NGÀY CƯỚI",
    items: [
      { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
      { label: "Công việc (Tasks)", href: "/tasks", icon: CheckSquare },
      { label: "Checklist thông minh", href: "/checklists", icon: ListTodo },
      { label: "Timeline & Lịch trình", href: "/timeline", icon: CalendarDays },
      { label: "Chế độ Ngày Cưới", href: "/wedding-day", icon: HeartHandshake, badge: "Live" },
    ],
  },
  {
    title: "TÀI CHÍNH & ĐỐI TÁC",
    items: [
      { label: "Ngân sách (Budget)", href: "/budget", icon: PieChart },
      { label: "Chi tiêu (Expenses)", href: "/expenses", icon: Receipt },
      { label: "Thanh toán (Payments)", href: "/payments", icon: CreditCard },
      { label: "Nhà cung cấp (Vendors)", href: "/vendors", icon: Store },
    ],
  },
  {
    title: "KHÁCH MỜI & KHÔNG GIAN",
    items: [
      { label: "Khách mời (Guests)", href: "/guests", icon: Users },
      { label: "Sơ đồ bàn (Tables)", href: "/tables", icon: Armchair },
      { label: "Thiệp cưới online", href: "/invitations", icon: Send },
      { label: "Website đám cưới", href: "/wedding-website", icon: Globe },
    ],
  },
  {
    title: "KỶ NIỆM & TIỆN ÍCH",
    items: [
      { label: "Album ảnh cưới", href: "/gallery", icon: ImageIcon },
      { label: "Ghi chú & Ý tưởng", href: "/notes", icon: StickyNote },
      { label: "Thông báo", href: "/notifications", icon: Bell },
      { label: "Báo cáo & Phân tích", href: "/analytics", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleOpenEmma = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trigger_quick_action", { detail: "ai" }));
    }
  };

  return (
    <aside className="hidden lg:flex w-[260px] flex-col border-r border-[#EADBCE] bg-[#FFFDF9] dark:bg-[#181413] dark:border-[#3A302E] shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#EADBCE] dark:border-[#3A302E]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm ring-1 ring-[#8B5E5A]/20 group-hover:scale-105 transition-transform bg-[#FFFDF9]">
            <Image
              src="/logo.png"
              alt="Weddingly Logo"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-base font-bold tracking-wide text-[#2C2422] dark:text-[#F5EFE7] leading-tight">
              WEDDINGLY
            </h1>
            <p className="text-[10px] font-medium text-[#8B5E5A] dark:text-[#D6BE91] truncate leading-tight mt-0.5">
              Cưới thông minh – Tài chính an tâm
            </p>
          </div>
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 p-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-[#A69591] dark:text-[#80726F]">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-[10px] px-2.5 py-2 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-[#8B5E5A] text-white shadow-sm font-semibold"
                      : "text-[#6B5E5B] hover:bg-[#F5EFE7] hover:text-[#2C2422] dark:text-[#A69591] dark:hover:bg-[#221C1B] dark:hover:text-[#F5EFE7]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors shrink-0",
                        isActive ? "text-[#D6BE91]" : "text-[#8B5E5A] group-hover:text-[#2C2422] dark:text-[#D6BE91]"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-[#3F7D5A] px-1.5 py-0.5 text-[8px] font-bold uppercase text-white tracking-wider animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Admin Link */}
        <div className="pt-2 border-t border-[#EADBCE] dark:border-[#3A302E]">
          <Link
            href="/admin"
            className={cn(
              "group flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-xs font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-[#2C2422] text-[#D6BE91]"
                : "text-[#6B5E5B] hover:bg-[#F5EFE7] dark:text-[#A69591] dark:hover:bg-[#221C1B]"
            )}
          >
            <ShieldAlert className="h-4 w-4 text-[#8B5E5A]" />
            <span>Quản trị viên (Admin)</span>
          </Link>
        </div>
      </nav>

      {/* Emma AI Clickable Card */}
      <div
        onClick={handleOpenEmma}
        className="p-3 m-3 rounded-[14px] bg-gradient-to-br from-[#F5EFE7] to-[#FAF6F0] border border-[#EADBCE] dark:from-[#221C1B] dark:to-[#1C1716] dark:border-[#3A302E] cursor-pointer hover:border-[#D6BE91] transition-all group shadow-xs"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-[#8B5E5A] text-[#D6BE91]">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">Emma AI Assistant</span>
          </div>
          <span className="text-[10px] text-[#8B5E5A] dark:text-[#D6BE91] group-hover:translate-x-0.5 transition-transform font-bold">
            Hỏi ngay &rarr;
          </span>
        </div>
        <p className="text-[10px] text-[#6B5E5B] dark:text-[#A69591] leading-relaxed">
          Tư vấn ngân sách, kịch bản nghi lễ và đề xuất tối ưu chi phí 24/7.
        </p>
      </div>
    </aside>
  );
}
