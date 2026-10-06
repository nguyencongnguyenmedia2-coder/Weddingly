"use client";

import * as React from "react";
import {
  Plus,
  X,
  CheckSquare,
  Users,
  Receipt,
  CalendarPlus,
  Bot,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionFABProps {
  onActionClick: (action: "task" | "guest" | "expense" | "payment" | "event" | "ai") => void;
}

export function QuickActionFAB({ onActionClick }: QuickActionFABProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const actions = [
    { id: "ai" as const, label: "Hỏi Emma AI", icon: Bot, color: "bg-[#2C2422] text-[#D6BE91]" },
    { id: "task" as const, label: "Thêm việc cần làm", icon: CheckSquare, color: "bg-[#8B5E5A] text-white" },
    { id: "guest" as const, label: "Thêm khách mời", icon: Users, color: "bg-[#3F7D5A] text-white" },
    { id: "expense" as const, label: "Thêm chi tiêu", icon: Receipt, color: "bg-[#C68A27] text-white" },
    { id: "payment" as const, label: "Thêm thanh toán", icon: CreditCard, color: "bg-[#8B5E5A] text-white" },
    { id: "event" as const, label: "Thêm sự kiện timeline", icon: CalendarPlus, color: "bg-[#423633] text-white" },
  ];

  return (
    <>
      {/* Backdrop overlay on mobile when FAB is expanded */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-20 right-4 z-40 lg:bottom-8 lg:right-8 flex flex-col items-end">
        {/* Action items expansion */}
        {isOpen && (
          <div className="mb-3 flex flex-col items-end gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    setIsOpen(false);
                    onActionClick(act.id);
                  }}
                  className="group flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#2C2422] shadow-lg border border-[#EADBCE] backdrop-blur-sm transition-all hover:scale-105 active:scale-95 dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
                >
                  <span>{act.label}</span>
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full shadow-sm", act.color)}>
                    <Icon className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        )}

      {/* Main trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thao tác nhanh"
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-[#8B5E5A] text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#D6BE91]/40",
          isOpen ? "rotate-45 bg-[#2C2422]" : ""
        )}
      >
        <Plus className="h-7 w-7 transition-transform" />
      </button>
    </div>
  </>
  );
}
