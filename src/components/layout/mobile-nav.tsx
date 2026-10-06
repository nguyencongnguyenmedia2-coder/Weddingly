"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  PieChart,
  Menu,
  X,
  CalendarDays,
  Store,
  HeartHandshake,
  Send,
  Globe,
  ImageIcon,
  StickyNote,
  BarChart3,
  Armchair,
  CreditCard,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainMobileTabs = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Guests", href: "/guests", icon: Users },
  { label: "Budget", href: "/budget", icon: PieChart },
];

const moreMenuLinks = [
  { label: "Chế độ Ngày Cưới", href: "/wedding-day", icon: HeartHandshake, highlight: true },
  { label: "Checklist thông minh", href: "/checklists", icon: CheckSquare },
  { label: "Timeline & Lịch trình", href: "/timeline", icon: CalendarDays },
  { label: "Sơ đồ bàn tiệc (Tables)", href: "/tables", icon: Armchair },
  { label: "Chi tiêu chi tiết", href: "/expenses", icon: Receipt },
  { label: "Lịch thanh toán", href: "/payments", icon: CreditCard },
  { label: "Nhà cung cấp (Vendors)", href: "/vendors", icon: Store },
  { label: "Thiệp mời điện tử", href: "/invitations", icon: Send },
  { label: "Website đám cưới", href: "/wedding-website", icon: Globe },
  { label: "Album ảnh cưới", href: "/gallery", icon: ImageIcon },
  { label: "Ghi chú & Ý tưởng", href: "/notes", icon: StickyNote },
  { label: "Báo cáo phân tích", href: "/analytics", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);

  return (
    <>
      {/* Bottom Sheet Drawer for "More" */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#2C2422]/60 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[24px] bg-[#FFFDF9] p-6 shadow-2xl border-t border-[#EADBCE] dark:bg-[#181413] dark:border-[#3A302E]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EADBCE] dark:border-[#3A302E]">
              <h3 className="font-serif text-lg font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                Tất cả tính năng
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full text-[#6B5E5B] hover:bg-[#F5EFE7] dark:hover:bg-[#2A2321]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-4">
              {moreMenuLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-[14px] border text-xs font-medium transition-all",
                      link.highlight
                        ? "bg-[#8B5E5A] text-white border-[#8B5E5A]"
                        : isActive
                        ? "bg-[#F5EFE7] text-[#8B5E5A] border-[#D6BE91] font-semibold dark:bg-[#2A2321]"
                        : "bg-white text-[#2C2422] border-[#EADBCE] hover:bg-[#F5EFE7] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#EADBCE] bg-[#FFFDF9]/95 px-2 backdrop-blur-md lg:hidden dark:bg-[#181413]/95 dark:border-[#3A302E]">
        {mainMobileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 py-1 transition-colors",
                isActive
                  ? "text-[#8B5E5A] font-bold dark:text-[#D6BE91]"
                  : "text-[#6B5E5B] hover:text-[#2C2422] dark:text-[#A69591]"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Trigger */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 py-1 transition-colors",
            isMoreOpen
              ? "text-[#8B5E5A] font-bold dark:text-[#D6BE91]"
              : "text-[#6B5E5B] hover:text-[#2C2422] dark:text-[#A69591]"
          )}
        >
          <Menu className="h-5 w-5 stroke-2" />
          <span className="text-[10px]">Thêm</span>
        </button>
      </nav>
    </>
  );
}
