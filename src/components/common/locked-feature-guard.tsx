"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Crown, Sparkles, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService, AuthUser } from "@/services/auth.service";
import { UpgradePlanModal } from "@/components/modals/upgrade-plan-modal";

interface LockedFeatureGuardProps {
  featureName: string;
  description?: string;
  children: React.ReactNode;
}

export function LockedFeatureGuard({
  featureName,
  description,
  children,
}: LockedFeatureGuardProps) {
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const syncUser = () => {
      setCurrentUser(AuthService.getCurrentUser());
    };
    syncUser();

    if (typeof window !== "undefined") {
      window.addEventListener("weddingly_auth_changed", syncUser);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("weddingly_auth_changed", syncUser);
      }
    };
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-xs text-[#80726F]">Đang tải quyền truy cập...</div>;
  }

  // If user is PRO, grant direct access to children
  if (currentUser?.plan === "PRO") {
    return <>{children}</>;
  }

  // Otherwise, display luxury Locked State with lock icon
  return (
    <div className="relative min-h-[600px] w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden rounded-[24px]">
      {/* Blurred background preview of the feature */}
      <div className="absolute inset-0 pointer-events-none select-none blur-md opacity-25 dark:opacity-15 overflow-hidden filter grayscale-[30%]">
        {children}
      </div>

      {/* Glassmorphism Lock Card */}
      <div className="relative z-10 max-w-lg w-full bg-white/95 dark:bg-[#1C1716]/95 backdrop-blur-xl border-2 border-[#D6BE91] shadow-2xl rounded-[28px] p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
        {/* VIP Lock Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/50 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-xs">
          <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
          <span>TÍNH NĂNG ĐỘC QUYỀN PRO VIP</span>
        </div>

        {/* Big Lock Icon with glowing champagne aura */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#8B5E5A] via-[#7A4E4A] to-[#4A3230] text-white shadow-xl ring-4 ring-[#D6BE91]/40">
          <Lock className="h-10 w-10 text-[#D6BE91] animate-pulse" />
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[#2C2422] shadow">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
          </div>
        </div>

        {/* Feature Title and Lock Statement */}
        <div className="space-y-2">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Chức năng &ldquo;{featureName}&rdquo; đang bị khoá
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E5B] dark:text-[#A69591] leading-relaxed">
            {description ||
              `Tính năng "${featureName}" chỉ dành riêng cho tài khoản Gói Hoàn Mỹ (PRO VIP). Bạn đang sử dụng Gói Miễn Phí nên chưa thể truy cập chức năng này.`}
          </p>
        </div>

        {/* VIP Benefits Box */}
        <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#251E1D] border border-[#EADBCE] dark:border-[#3A302E] p-4 text-left space-y-2 text-xs text-[#2C2422] dark:text-[#E0D5CF]">
          <p className="font-bold text-[#8B5E5A] dark:text-[#D6BE91] uppercase text-[10px] tracking-wider">
            Khi nâng cấp lên Gói Hoàn Mỹ, bạn sẽ nhận được:
          </p>
          <ul className="space-y-1.5 text-[11px] text-[#6B5E5B] dark:text-[#B5A8A4]">
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Mở khóa toàn bộ chức năng bị khóa vĩnh viễn</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Không giới hạn số lượng khách mời, chi tiêu và bàn tiệc</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Xuất file Excel, PDF và báo cáo đối soát tài chính chi tiết</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Trợ lý Emma AI không giới hạn & Hỗ trợ kỹ thuật 24/7</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2.5 pt-1">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsUpgradeOpen(true)}
            className="w-full bg-gradient-to-r from-[#8B5E5A] via-[#7A4E4A] to-[#6A4643] text-white font-bold py-3.5 shadow-xl hover:brightness-110 text-xs sm:text-sm cursor-pointer"
          >
            <Crown className="h-4 w-4 text-[#D6BE91]" />
            <span>Mở khoá với Gói PRO VIP (499.000 ₫)</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              href="/dashboard"
              className="text-[#8B5E5A] dark:text-[#D6BE91] hover:underline flex items-center gap-1 font-medium text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Tổng quan</span>
            </Link>
            <span className="text-[11px] text-[#80726F] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Bảo lưu trọn gói đám cưới</span>
            </span>
          </div>
        </div>
      </div>

      <UpgradePlanModal
        open={isUpgradeOpen}
        onOpenChange={setIsUpgradeOpen}
        reason={`Mở khoá ngay tính năng "${featureName}" và toàn bộ công cụ quản lý đám cưới cao cấp với Gói Hoàn Mỹ (PRO VIP).`}
      />
    </div>
  );
}
