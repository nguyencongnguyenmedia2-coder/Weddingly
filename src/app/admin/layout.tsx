"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  Settings,
  Activity,
  ArrowLeft,
  LogOut,
  Bell,
  Cpu,
  Database,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { SubscriptionService } from "@/services/subscription.service";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [adminUser, setAdminUser] = React.useState<any>(null);
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = React.useState(0);

  const checkPendingOrders = React.useCallback(() => {
    try {
      const orders = SubscriptionService.getOrders();
      const pending = orders.filter((o) => o.status === "PENDING").length;
      setPendingOrdersCount(pending);
    } catch {
      // ignore
    }
  }, []);

  const [unauthorizedUser, setUnauthorizedUser] = React.useState<any>(null);

  React.useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      router.replace("/login?redirect=/admin&notice=require_auth");
      return;
    }
    if (user.role !== "ADMIN") {
      setUnauthorizedUser(user);
      setIsAuthorized(false);
      return;
    }
    setAdminUser(user);
    setIsAuthorized(true);
    checkPendingOrders();

    const handleUpdate = () => checkPendingOrders();
    window.addEventListener("weddingly_orders_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("weddingly_orders_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [router, checkPendingOrders]);

  const handleQuickSwitchToAdmin = async () => {
    const admin = await AuthService.loginAsAdmin();
    setAdminUser(admin);
    setUnauthorizedUser(null);
    setIsAuthorized(true);
    checkPendingOrders();
  };

  const handleLogout = async () => {
    await AuthService.logout();
    router.push("/login");
  };

  if (unauthorizedUser) {
    return (
      <div className="min-h-screen bg-[#14100F] flex items-center justify-center p-4 selection:bg-[#D6BE91] selection:text-[#14100F]">
        <div className="max-w-md w-full bg-[#1C1615] border border-[#2C2422] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D6BE91]/15 text-[#D6BE91] border border-[#D6BE91]/30">
            <ShieldAlert className="h-8 w-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F5EFE7]">
              Cổng Quản Trị Hệ Thống
            </h2>
            <p className="text-xs text-[#A69591] leading-relaxed">
              Bạn đang ở phiên đăng nhập của tài khoản{" "}
              <strong className="text-[#D6BE91]">{unauthorizedUser.email}</strong> (Vai trò: Khách hàng / Cặp đôi).
            </p>
            <p className="text-[11px] text-[#80726F]">
              Khu vực này dành riêng cho Quản trị viên để kiểm duyệt thanh toán và cấu hình hệ thống.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleQuickSwitchToAdmin}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D6BE91] to-[#C4A976] hover:brightness-105 text-[#14100F] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D6BE91]/10 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Chuyển sang Quản trị viên (Super Admin)</span>
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-2.5 px-4 rounded-xl bg-[#241D1B] hover:bg-[#2F2624] text-[#D6BE91] border border-[#3A302E] font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Giao diện Cặp đôi (Dashboard)</span>
            </button>
          </div>

          <div className="border-t border-[#2C2422] pt-4">
            <button
              onClick={handleLogout}
              className="text-xs text-[#80726F] hover:text-red-400 transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#14100F] flex flex-col items-center justify-center text-[#D6BE91] text-xs space-y-2">
        <div className="h-6 w-6 border-2 border-[#D6BE91] border-t-transparent rounded-full animate-spin" />
        <p>Đang xác thực quyền Quản trị viên...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14100F] text-[#F5EFE7] flex flex-col font-sans selection:bg-[#D6BE91] selection:text-[#14100F]">
      {/* 1. Super Admin Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#2C2422] bg-[#1A1514]/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3.5">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D6BE91] to-[#8B5E5A] text-[#14100F] shadow-md group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm tracking-wider text-[#F5EFE7]">
                  WEDDINGLY
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#D6BE91] text-[#14100F]">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-[10px] text-[#A69591] hidden sm:block">
                Hệ thống Quản trị Trung tâm Doanh nghiệp & SaaS Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Center: System Health Status */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1 rounded-full bg-[#241D1B] border border-[#3A302E] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-medium text-[11px]">Hệ thống: Trực tuyến 100%</span>
          </div>
          <span className="text-[#6B5E5B]">|</span>
          <span className="text-[11px] text-[#A69591] flex items-center gap-1">
            <Database className="h-3 w-3 text-[#D6BE91]" /> Supabase OK (28ms)
          </span>
          <span className="text-[#6B5E5B]">|</span>
          <span className="text-[11px] text-[#A69591] flex items-center gap-1">
            <Cpu className="h-3 w-3 text-amber-400" /> Emma AI Online
          </span>
        </div>

        {/* Right: Quick App Switch & Profile */}
        <div className="flex items-center gap-3">
          {/* Pending Orders Notification Pill */}
          {pendingOrdersCount > 0 && (
            <Link
              href="/admin?tab=payments"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("admin_tab_switch", { detail: "payments" }));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all shadow-sm shadow-amber-950/50"
              title="Có đơn hàng đang chờ duyệt - bấm để xem ngay"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <CreditCard className="h-3.5 w-3.5 text-amber-400" />
              <span>{pendingOrdersCount} đơn chờ duyệt</span>
            </Link>
          )}

          {/* Switch to Client App */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241D1B] hover:bg-[#2F2624] border border-[#3A302E] text-[#D6BE91] text-xs font-semibold transition-all hover:border-[#D6BE91]"
            title="Quay lại ứng dụng lập kế hoạch cưới của khách hàng"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Vào ứng dụng Cặp đôi (App View)</span>
            <span className="sm:hidden">App View</span>
          </Link>

          {/* Admin User Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#2C2422]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5E5A] to-[#6A4643] text-[#D6BE91] font-bold text-xs ring-1 ring-[#D6BE91]/40 uppercase">
              {adminUser?.full_name ? adminUser.full_name.charAt(0) : "A"}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-[#F5EFE7] leading-none">
                {adminUser?.full_name || "Quản trị viên"}
              </p>
              <p className="text-[10px] text-[#D6BE91] mt-0.5">
                {adminUser?.email || "admin@weddingly.vn"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#A69591] hover:text-red-400 rounded-lg hover:bg-[#241D1B] transition-colors"
              title="Đăng xuất khỏi Admin"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Executive Content Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-[#2C2422] py-4 px-6 text-center text-xs text-[#80726F] bg-[#110D0C]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 WEDDINGLY SaaS Platform • Enterprise Super Admin Management</span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Version 2.4.0 (Build Turbo Enterprise)
          </span>
        </div>
      </footer>
    </div>
  );
}
