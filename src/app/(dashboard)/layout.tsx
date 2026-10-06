"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActionFAB } from "@/components/layout/quick-action-fab";
import { CommandSearch } from "@/components/layout/command-search";
import { EmmaAIWidget } from "@/components/layout/emma-ai-widget";
import { QuickActionModals } from "@/components/modals/quick-action-modals";
import { CheckCircle2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isEmmaOpen, setIsEmmaOpen] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<"task" | "guest" | "expense" | "payment" | "event" | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleTriggerAction = (action: "task" | "guest" | "expense" | "payment" | "event" | "ai") => {
    if (action === "ai") {
      setIsEmmaOpen(true);
    } else {
      setActiveModal(action);
    }
  };

  const handleSuccess = React.useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  React.useEffect(() => {
    const handleTrigger = (e: Event) => {
      const custom = e as CustomEvent<"task" | "guest" | "expense" | "payment" | "event" | "ai">;
      if (custom.detail) {
        handleTriggerAction(custom.detail);
      }
    };
    const handleToast = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        handleSuccess(custom.detail);
      }
    };
    window.addEventListener("trigger_quick_action", handleTrigger);
    window.addEventListener("show_toast", handleToast);
    return () => {
      window.removeEventListener("trigger_quick_action", handleTrigger);
      window.removeEventListener("show_toast", handleToast);
    };
  }, [handleSuccess]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-[#181413] flex">
      {/* 1. Desktop Sidebar */}
      <Sidebar />

      {/* 2. Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-0">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl mx-auto w-full pb-32 lg:pb-12">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <MobileNav />

      {/* 4. Quick Actions Floating Action Button */}
      <QuickActionFAB onActionClick={handleTriggerAction} />

      {/* 5. Command Search (Ctrl + K) */}
      <CommandSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onTriggerAction={handleTriggerAction}
      />

      {/* 6. Emma AI Floating Assistant */}
      <EmmaAIWidget
        isOpen={isEmmaOpen}
        onClose={() => setIsEmmaOpen(false)}
      />

      {/* 7. Quick Action Modals (Task, Guest, Expense, Payment, Event) */}
      <QuickActionModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSuccess={handleSuccess}
      />

      {/* 8. Toast Feedback Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-[16px] bg-[#3F7D5A] px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
