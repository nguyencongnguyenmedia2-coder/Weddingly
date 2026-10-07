"use client";

import * as React from "react";
import {
  Sparkles,
  Check,
  Crown,
  ShieldCheck,
  Star,
  Zap,
  ArrowRight,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PackageCheck,
} from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { AuthService, AuthUser } from "@/services/auth.service";
import { SubscriptionPlan, SubscriptionOrder } from "@/types/database";
import { PLAN_FEATURES, TierService } from "@/services/tier.service";
import { SubscriptionService } from "@/services/subscription.service";
import { PaymentCheckoutModal } from "./payment-checkout-modal";
import { UserOrderTrackingModal } from "./user-order-tracking-modal";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
  initialPlan?: SubscriptionPlan;
}

export function UpgradePlanModal({
  open,
  onOpenChange,
  reason,
  initialPlan = "PRO",
}: UpgradePlanModalProps) {
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null);
  const [pendingOrder, setPendingOrder] = React.useState<SubscriptionOrder | null>(null);
  const [showComparison, setShowComparison] = React.useState(false);

  // Checkout modal state
  const [checkoutPlan, setCheckoutPlan] = React.useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = React.useState(false);

  const bankConfig = React.useMemo(() => SubscriptionService.getBankConfig(), [open]);

  React.useEffect(() => {
    if (open) {
      const user = AuthService.getCurrentUser();
      setCurrentUser(user);
      const pending = SubscriptionService.getUserPendingOrder(user?.id);
      setPendingOrder(pending);
    }
  }, [open]);

  // Handle plan select
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setCheckoutPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleBackFromCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const currentPlan = currentUser?.plan || "FREE";

  return (
    <>
      <Modal
        isOpen={open && !isCheckoutOpen}
        onClose={() => onOpenChange(false)}
        title="Nâng cấp Gói Dịch Vụ Cưới (Weddingly Plans)"
        description={
          reason ||
          "Chọn gói tính năng phù hợp nhất để chuẩn bị ngày cưới trọn vẹn, thảnh thơi và an tâm tuyệt đối."
        }
        maxWidth="xl"
      >
        <div className="space-y-6">
          {/* Top Sub-bar with Order Tracking Button */}
          <div className="flex items-center justify-between pb-1 text-xs">
            <span className="text-[#80726F]">Bảng giá trọn gói niêm yết chính thức</span>
            <button
              type="button"
              onClick={() => setIsTrackingOpen(true)}
              className="inline-flex items-center gap-1.5 font-semibold text-[#8B5E5A] dark:text-[#D6BE91] hover:underline cursor-pointer"
            >
              <PackageCheck className="h-4 w-4" />
              <span>Theo dõi đơn hàng đã mua</span>
            </button>
          </div>

          {/* Pending Order Notice */}
          {pendingOrder && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-900 dark:text-amber-200 text-xs gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 animate-spin shrink-0" />
                <span>
                  Bạn đang có 1 yêu cầu thanh toán mã <strong>{pendingOrder.code}</strong> (Gói {pendingOrder.plan}) đang chờ Ban Quản Trị đối soát và duyệt kích hoạt (5 - 15 phút).
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Đang chờ duyệt
                </span>
                <button
                  type="button"
                  onClick={() => setIsTrackingOpen(true)}
                  className="font-bold underline text-[#8B5E5A] dark:text-[#D6BE91] hover:opacity-80 flex items-center gap-0.5 cursor-pointer ml-1"
                >
                  <PackageCheck className="h-3.5 w-3.5" />
                  <span>Theo dõi tiến độ &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* 1. Free Plan */}
            <div
              className={`rounded-2xl border p-5 space-y-4 flex flex-col justify-between transition-all ${
                currentPlan === "FREE"
                  ? "border-[#EADBCE] bg-[#FAF6F0]/60 dark:bg-[#2A2321]/40 dark:border-[#3A302E]"
                  : "border-[#EADBCE] bg-white dark:bg-[#221C1B] dark:border-[#3A302E]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#2C2422] dark:text-[#F5EFE7]">
                    Gói Miễn Phí
                  </span>
                  {currentPlan === "FREE" && <Badge variant="default">Đang dùng</Badge>}
                </div>
                <div className="font-serif text-3xl font-bold text-[#6B5E5B] dark:text-[#A69591]">
                  0 ₫
                  <span className="text-xs font-normal text-[#80726F] block mt-0.5">
                    Trọn đời
                  </span>
                </div>
                <p className="text-xs text-[#80726F]">
                  Phù hợp cho các buổi tiệc cưới nhỏ gọn, thân mật cùng gia đình.
                </p>

                <ul className="text-xs text-[#6B5E5B] dark:text-[#A69591] space-y-2.5 pt-3 border-t border-[#EADBCE] dark:border-[#3A302E]">
                  <li className="flex items-center gap-2">✓ Tối đa 50 khách mời</li>
                  <li className="flex items-center gap-2">✓ Tối đa 15 khoản chi tiêu</li>
                  <li className="flex items-center gap-2">✓ 1 Website cưới cơ bản</li>
                  <li className="flex items-center gap-2">✓ 10 câu hỏi Emma AI/ngày</li>
                  <li className="flex items-center gap-2 text-[#A69591] line-through">
                    Không xuất file Excel
                  </li>
                  <li className="flex items-center gap-2 text-[#A69591] line-through">
                    Không có tên miền riêng
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  disabled={currentPlan === "FREE"}
                  className="w-full text-xs font-medium"
                >
                  {currentPlan === "FREE" ? "Gói hiện tại của bạn" : "Gói cơ bản"}
                </Button>
              </div>
            </div>

            {/* 2. PRO Plan (Popular) */}
            <div className="rounded-2xl border-2 border-[#D6BE91] bg-gradient-to-b from-[#FFFDF9] to-[#F8F2EB] dark:from-[#2A2321] dark:to-[#1F1918] p-5 space-y-4 flex flex-col justify-between relative shadow-lg ring-1 ring-[#D6BE91]/30">
              <div className="absolute -top-3 right-4">
                <Badge variant="champagne" className="shadow-xs font-bold tracking-wide">
                  PHỔ BIẾN NHẤT ⭐
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
                    <span className="font-serif font-bold text-lg text-[#2C2422] dark:text-[#F5EFE7]">
                      Gói Hoàn Mỹ (PRO)
                    </span>
                  </div>
                  {currentPlan === "PRO" && <Badge variant="success">Đang kích hoạt</Badge>}
                </div>

                <div className="font-serif text-3xl font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                  {bankConfig.pro_price.toLocaleString("vi-VN")} ₫
                  <span className="text-xs font-normal text-[#6B5E5B] dark:text-[#A69591] block mt-0.5">
                    Thanh toán 1 lần / Trọn gói hôn lễ
                  </span>
                </div>

                <p className="text-xs text-[#8B5E5A] dark:text-[#D6BE91] font-medium">
                  Giải pháp toàn diện được 90% các cặp đôi lựa chọn để quản lý ngày cưới thảnh thơi.
                </p>

                <ul className="text-xs text-[#2C2422] dark:text-[#F5EFE7] space-y-2.5 pt-3 border-t border-[#D6BE91]/50">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <strong>Không giới hạn</strong> khách mời & điểm danh RSVP
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <strong>Không giới hạn</strong> sổ thu chi & xuất báo cáo Excel
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Sơ đồ xếp bàn tiệc thông minh
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Website Motion VIP tương tác cao cấp
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Trợ lý Emma AI không giới hạn
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Hỗ trợ kỹ thuật ưu tiên 24/7
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={() => handleSelectPlan("PRO")}
                  className="w-full bg-gradient-to-r from-[#8B5E5A] to-[#6A4643] text-white font-bold py-2.5 text-xs shadow-md hover:brightness-105 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#D6BE91]" />
                  <span>
                    {currentPlan === "PRO" ? "Gia hạn / Nâng cấp lại" : "Nâng cấp Gói Hoàn Mỹ ngay"}
                  </span>
                </Button>
              </div>
            </div>

            {/* 3. VIP LUXURY Plan */}
            <div className="rounded-2xl border-2 border-[#2C2422] dark:border-[#D6BE91] bg-gradient-to-b from-[#2C2422] to-[#1C1716] text-[#F5EFE7] p-5 space-y-4 flex flex-col justify-between relative shadow-xl">
              <div className="absolute -top-3 right-4">
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-900 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Crown className="h-3 w-3 fill-stone-900" />
                  VIP ĐẲNG CẤP
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-[#D6BE91]" />
                    <span className="font-serif font-bold text-lg text-[#F5EFE7]">
                      Gói Kim Cương (VIP)
                    </span>
                  </div>
                  {currentPlan === "VIP" && <Badge variant="champagne">Đang kích hoạt</Badge>}
                </div>

                <div className="font-serif text-3xl font-bold text-[#D6BE91]">
                  {bankConfig.vip_price.toLocaleString("vi-VN")} ₫
                  <span className="text-xs font-normal text-white/70 block mt-0.5">
                    Đặc quyền cao cấp vĩnh viễn
                  </span>
                </div>

                <p className="text-xs text-white/80">
                  Dành riêng cho những tiệc cưới sang trọng, yêu cầu sự hoàn hảo từng chi tiết.
                </p>

                <ul className="text-xs text-white/90 space-y-2.5 pt-3 border-t border-white/20">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-[#D6BE91] shrink-0" />
                    <strong>Tất cả quyền năng của Gói PRO</strong>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-[#D6BE91] shrink-0" />
                    Tên miền riêng (.com/.vn) cho website cưới
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-[#D6BE91] shrink-0" />
                    Thiệp cưới động 3D & Nhạc nền bản quyền
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-[#D6BE91] shrink-0" />
                    Không giới hạn ảnh lưu trữ đám mây cao tốc
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-[#D6BE91] shrink-0" />
                    Chuyên viên Wedding Planner 1-on-1 tư vấn
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={() => handleSelectPlan("VIP")}
                  className="w-full bg-gradient-to-r from-[#D6BE91] to-[#B39366] text-[#2C2422] font-extrabold py-2.5 text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>
                    {currentPlan === "VIP" ? "Gói tối thượng của bạn" : "Nâng cấp Gói Kim Cương VIP"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Toggle Feature Comparison */}
          <div className="border border-[#EADBCE] dark:border-[#3A302E] rounded-2xl overflow-hidden bg-white dark:bg-[#221C1B]">
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF6F0] dark:hover:bg-[#2A2321] transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#8B5E5A]" />
                <span className="font-serif font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                  Xem bảng so sánh chi tiết tính năng giữa các gói
                </span>
              </div>
              {showComparison ? (
                <ChevronUp className="h-4 w-4 text-[#80726F]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#80726F]" />
              )}
            </button>

            {showComparison && (
              <div className="overflow-x-auto border-t border-[#EADBCE] dark:border-[#3A302E] p-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] dark:bg-[#2A2321] text-[#6B5E5B] dark:text-[#A69591]">
                    <tr>
                      <th className="p-3 font-semibold">Tính năng</th>
                      <th className="p-3 font-semibold text-center">Gói Miễn Phí</th>
                      <th className="p-3 font-semibold text-center text-[#8B5E5A] dark:text-[#D6BE91]">
                        Hoàn Mỹ (PRO)
                      </th>
                      <th className="p-3 font-semibold text-center text-amber-600 font-bold">
                        Kim Cương (VIP)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
                    {PLAN_FEATURES.map((f, i) => (
                      <tr key={i} className="hover:bg-[#FFFDF9]/80">
                        <td className="p-3 font-medium text-[#2C2422] dark:text-[#F5EFE7]">
                          {f.name}
                        </td>
                        <td className="p-3 text-center text-[#80726F]">{f.free}</td>
                        <td className="p-3 text-center font-medium text-[#8B5E5A] dark:text-[#D6BE91] bg-[#FDFBF7]/50">
                          {f.pro}
                        </td>
                        <td className="p-3 text-center font-bold text-amber-700 dark:text-amber-300 bg-amber-500/5">
                          {f.vip}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Trust & Guarantee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-[11px] text-[#80726F]">
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#2A2321]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Hoàn tiền 100% trong 7 ngày</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#2A2321]">
              <Zap className="h-4 w-4 text-amber-600" />
              <span>Kích hoạt tự động qua VietQR</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#2A2321]">
              <Star className="h-4 w-4 text-[#8B5E5A]" />
              <span>Hỗ trợ kỹ thuật tận tâm 24/7</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Checkout Payment Modal */}
      {checkoutPlan && (
        <PaymentCheckoutModal
          open={isCheckoutOpen}
          onOpenChange={(val) => {
            setIsCheckoutOpen(val);
            if (!val) onOpenChange(false);
          }}
          plan={checkoutPlan}
          onBackToPlans={handleBackFromCheckout}
        />
      )}

      {/* User Order Tracking Modal */}
      <UserOrderTrackingModal
        open={isTrackingOpen}
        onOpenChange={setIsTrackingOpen}
        onOpenUpgradeModal={() => setIsTrackingOpen(false)}
      />
    </>
  );
}
