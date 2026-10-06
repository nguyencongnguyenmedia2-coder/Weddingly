"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckSquare,
  Users,
  PieChart,
  CalendarDays,
  Store,
  CreditCard,
  Bot,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/dialog";

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction: (action: "task" | "guest" | "expense" | "payment" | "event" | "ai") => void;
}

export function CommandSearch({ isOpen, onClose, onTriggerAction }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const navigationCommands = [
    { label: "Xem Tổng quan (Dashboard)", href: "/dashboard", icon: Sparkles },
    { label: "Quản lý Ngân sách & Chi tiêu", href: "/budget", icon: PieChart },
    { label: "Danh sách Khách mời & RSVP", href: "/guests", icon: Users },
    { label: "Công việc & Kế hoạch (Tasks)", href: "/tasks", icon: CheckSquare },
    { label: "Lịch trình ngày cưới (Timeline)", href: "/timeline", icon: CalendarDays },
    { label: "Nhà cung cấp dịch vụ (Vendors)", href: "/vendors", icon: Store },
    { label: "Chế độ Ngày Cưới khẩn cấp", href: "/wedding-day", icon: Sparkles },
  ];

  const quickActionCommands = [
    { label: "Thêm công việc mới (Task)", action: "task" as const, icon: CheckSquare },
    { label: "Thêm khách mời mới (Guest)", action: "guest" as const, icon: Users },
    { label: "Ghi nhận chi tiêu (Expense)", action: "expense" as const, icon: PieChart },
    { label: "Tạo lịch thanh toán (Payment)", action: "payment" as const, icon: CreditCard },
    { label: "Thêm sự kiện timeline (Event)", action: "event" as const, icon: CalendarDays },
    { label: "Hỏi trợ lý ảo Emma AI", action: "ai" as const, icon: Bot },
  ];

  const filteredNav = navigationCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );
  const filteredActions = quickActionCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tìm kiếm & Thao tác nhanh (Ctrl + K)" maxWidth="md">
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8B5E5A]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gõ từ khóa tìm trang hoặc thao tác nhanh..."
            autoFocus
            className="w-full rounded-[14px] border border-[#EADBCE] bg-[#FFFDF9] pl-10 pr-4 py-2.5 text-sm text-[#2C2422] placeholder:text-[#A69591] focus:outline-none focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
          />
        </div>

        {/* Quick Actions List */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E5A] dark:text-[#D6BE91] mb-2 px-1">
            Thao tác nhanh
          </p>
          <div className="space-y-1">
            {filteredActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  onClick={() => {
                    onClose();
                    onTriggerAction(act.action);
                  }}
                  className="w-full flex items-center justify-between rounded-[10px] p-2.5 text-left text-xs font-medium text-[#2C2422] hover:bg-[#F5EFE7] transition-colors dark:text-[#F5EFE7] dark:hover:bg-[#2A2321]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#F5EFE7] text-[#8B5E5A] dark:bg-[#2A2321]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{act.label}</span>
                  </div>
                  <span className="text-[10px] text-[#A69591]">Thao tác ↵</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation commands */}
        <div className="pt-2 border-t border-[#EADBCE] dark:border-[#3A302E]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5E5B] dark:text-[#A69591] mb-2 px-1">
            Điều hướng nhanh
          </p>
          <div className="space-y-1">
            {filteredNav.map((nav) => {
              const Icon = nav.icon;
              return (
                <button
                  key={nav.href}
                  onClick={() => {
                    onClose();
                    router.push(nav.href);
                  }}
                  className="w-full flex items-center justify-between rounded-[10px] p-2.5 text-left text-xs font-medium text-[#2C2422] hover:bg-[#F5EFE7] transition-colors dark:text-[#F5EFE7] dark:hover:bg-[#2A2321]"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#8B5E5A]" />
                    <span>{nav.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#A69591]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
