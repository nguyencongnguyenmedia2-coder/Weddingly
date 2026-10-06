"use client";

import * as React from "react";
import { Sparkles, Check, Crown, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { AuthService } from "@/services/auth.service";
import confetti from "canvas-confetti";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

export function UpgradePlanModal({ open, onOpenChange, reason }: UpgradePlanModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    await AuthService.upgradeToPro();
    setLoading(false);
    setSuccess(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      onOpenChange(false);
      setSuccess(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Nâng cấp lên Gói Hoàn Mỹ (PRO VIP)"
      description={reason || "Mở khoá toàn diện các tính năng không giới hạn để chuẩn bị đám cưới thảnh thơi và an tâm tuyệt đối."}
      maxWidth="lg"
    >
      {success ? (
        <div className="text-center py-8 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-emerald-800">
            Chúc mừng bạn đã nâng cấp thành công lên Gói PRO VIP!
          </h3>
          <p className="text-xs text-[#6B5E5B]">
            Tất cả giới hạn về khách mời, ngân sách và AI đã được mở khóa vĩnh viễn.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Plan Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Plan */}
            <div className="rounded-2xl border border-[#EADBCE] bg-white p-5 space-y-3 dark:bg-[#2A2321] dark:border-[#3A302E]">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#2C2422] dark:text-[#F5EFE7]">Gói Miễn Phí</span>
                <Badge variant="default">Đang dùng</Badge>
              </div>
              <div className="font-serif text-2xl font-bold text-[#6B5E5B] dark:text-[#A69591]">0 ₫</div>
              <p className="text-xs text-[#80726F]">Phù hợp cho các buổi tiệc thân mật nhỏ gia đình.</p>
              <ul className="text-xs text-[#6B5E5B] dark:text-[#A69591] space-y-2 pt-2 border-t border-[#EADBCE] dark:border-[#3A302E]">
                <li className="flex items-center gap-2">✓ Tối đa 50 khách mời</li>
                <li className="flex items-center gap-2">✓ Tối đa 15 khoản chi tiêu</li>
                <li className="flex items-center gap-2">✓ 1 Website đám cưới cơ bản</li>
                <li className="flex items-center gap-2">✓ 10 câu hỏi AI / ngày</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-[#D6BE91] bg-gradient-to-b from-[#FFFDF9] to-[#F8F2EB] dark:from-[#2A2321] dark:to-[#1F1918] p-5 space-y-3 relative shadow-md">
              <div className="absolute -top-3 right-4">
                <Badge variant="champagne">
                  KHUYÊN DÙNG
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#2C2422] dark:text-[#F5EFE7]">Gói Hoàn Mỹ (PRO)</span>
              </div>
              <div className="font-serif text-2xl font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                499.000 ₫ <span className="text-xs text-[#6B5E5B] dark:text-[#A69591] font-normal">/ trọn gói hôn lễ</span>
              </div>
              <p className="text-xs text-[#8B5E5A] dark:text-[#D6BE91] font-medium">Đầy đủ quyền năng cho một đám cưới hoàn hảo.</p>
              <ul className="text-xs text-[#2C2422] dark:text-[#F5EFE7] space-y-2 pt-2 border-t border-[#D6BE91]/50">
                <li className="flex items-center gap-2 font-medium">✓ <strong>Không giới hạn</strong> khách mời & RSVP</li>
                <li className="flex items-center gap-2 font-medium">✓ <strong>Không giới hạn</strong> sổ chi tiêu & xuất file</li>
                <li className="flex items-center gap-2 font-medium">✓ Sơ đồ bàn tiệc thông minh</li>
                <li className="flex items-center gap-2 font-medium">✓ Website VIP Motion hiệu ứng cao cấp</li>
                <li className="flex items-center gap-2 font-medium">✓ Trợ lý Emma AI không giới hạn</li>
                <li className="flex items-center gap-2 font-medium">✓ Hỗ trợ kỹ thuật VIP 24/7</li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8B5E5A] to-[#6A4643] text-white font-bold py-3 text-sm shadow-xl hover:brightness-105"
            >
              <Sparkles className="h-4 w-4 text-[#D6BE91]" />
              <span>{loading ? "Đang xử lý nâng cấp..." : "Nâng cấp lên Gói Hoàn Mỹ (PRO) ngay"}</span>
            </Button>
            <p className="text-[11px] text-center text-[#80726F] flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Bảo hành hoàn tiền 100% trong 7 ngày nếu không hài lòng</span>
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
