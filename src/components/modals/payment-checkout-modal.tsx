"use client";

import * as React from "react";
import {
  QrCode,
  Copy,
  Check,
  UploadCloud,
  ShieldCheck,
  Sparkles,
  Crown,
  Clock,
  ArrowRight,
  ExternalLink,
  Info,
  PhoneCall,
  Image as ImageIcon,
  X,
  PackageCheck,
} from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge, Input } from "@/components/ui/primitives";
import { SubscriptionPlan, SubscriptionOrder } from "@/types/database";
import { SubscriptionService } from "@/services/subscription.service";
import { UserOrderTrackingModal } from "./user-order-tracking-modal";
import confetti from "canvas-confetti";

interface PaymentCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan;
  onBackToPlans?: () => void;
}

export function PaymentCheckoutModal({
  open,
  onOpenChange,
  plan,
  onBackToPlans,
}: PaymentCheckoutModalProps) {
  const bankConfig = React.useMemo(() => SubscriptionService.getBankConfig(), [open]);
  const amount = plan === "VIP" ? bankConfig.vip_price : bankConfig.pro_price;
  const planTitle = plan === "VIP" ? "Gói Kim Cương (VIP LUXURY)" : "Gói Hoàn Mỹ (PRO VIP)";

  // Unique code per session
  const [orderCode, setOrderCode] = React.useState<string>("");
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [proofImage, setProofImage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedOrder, setSubmittedOrder] = React.useState<SubscriptionOrder | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      setOrderCode(`WD-${plan}-${codeSuffix}`);
      setSubmittedOrder(null);
    }
  }, [open, plan]);

  const transferContent = React.useMemo(() => {
    return `${orderCode}`.toUpperCase();
  }, [orderCode]);

  const vietQRUrl = React.useMemo(() => {
    if (!open) return "";
    return SubscriptionService.getVietQRUrl(amount, transferContent);
  }, [open, amount, transferContent]);

  const handleCopy = (text: string, fieldName: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const raw = reader.result as string;
        try {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxDim = 900;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              const compressed = canvas.toDataURL("image/jpeg", 0.7);
              setProofImage(compressed);
            } else {
              setProofImage(raw);
            }
          };
          img.src = raw;
        } catch {
          setProofImage(raw);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const order = SubscriptionService.createOrder({
      plan,
      code: orderCode || undefined,
      phone,
      notes,
      proof_image_url: proofImage || undefined,
      payment_method: "VIETQR",
    });

    setIsSubmitting(false);
    setSubmittedOrder(order);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <>
      <Modal
        isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Thanh toán & Kích hoạt nâng cấp"
      description="Quét mã VietQR tiện lợi hoặc chuyển khoản 24/7 để mở khóa ngay"
      maxWidth="xl"
    >
      {submittedOrder ? (
        /* Success Screen */
        <div className="py-6 space-y-6 text-center animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Check className="h-8 w-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <Badge variant="success" className="text-xs px-3 py-1">
              ĐÃ TIẾP NHẬN YÊU CẦU THANH TOÁN
            </Badge>
            <h3 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
              Yêu cầu nâng cấp của bạn đã được gửi!
            </h3>
            <p className="text-sm text-[#6B5E5B] dark:text-[#A69591] max-w-md mx-auto">
              Hệ thống đã ghi nhận đơn nâng cấp lên <strong className="text-[#8B5E5A] dark:text-[#D6BE91]">{planTitle}</strong>.
              Quản trị viên sẽ đối soát và phê duyệt kích hoạt tài khoản trong vòng 5 - 15 phút.
            </p>
          </div>

          <div className="mx-auto max-w-md p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADBCE] dark:bg-[#2A2321] dark:border-[#3A302E] text-left text-xs space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-[#EADBCE]/60 dark:border-[#3A302E]">
              <span className="text-[#80726F]">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-sm text-[#8B5E5A] dark:text-[#D6BE91]">
                {submittedOrder.code}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#EADBCE]/60 dark:border-[#3A302E]">
              <span className="text-[#80726F]">Số tiền chuyển khoản:</span>
              <span className="font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                {submittedOrder.amount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#EADBCE]/60 dark:border-[#3A302E]">
              <span className="text-[#80726F]">Trạng thái:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                Đang chờ Quản trị viên duyệt (PENDING)
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#80726F]">Hotline hỗ trợ gấp:</span>
              <span className="font-semibold text-[#8B5E5A] dark:text-[#D6BE91]">
                {bankConfig.hotline}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setIsTrackingOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-[#8B5E5A] dark:text-[#D6BE91] border-[#EADBCE] dark:border-[#3A302E] hover:bg-[#FAF6F0] dark:hover:bg-[#2A2321] rounded-xl gap-1.5"
            >
              <PackageCheck className="h-4 w-4" />
              <span>Theo dõi tiến độ duyệt đơn</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto px-8 py-2.5 bg-[#8B5E5A] hover:bg-[#724B47] text-white text-xs font-semibold shadow-md rounded-xl"
            >
              Đã hiểu & Tiếp tục trải nghiệm
            </Button>
          </div>
        </div>
      ) : (
        /* Checkout Process */
        <div className="space-y-6">
          {/* Plan Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#FBF7F2] to-[#F5ECE1] dark:from-[#2A2321] dark:to-[#1F1918] border border-[#EADBCE] dark:border-[#3A302E] gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5E5A] to-[#6A4643] text-[#D6BE91] shadow-md shrink-0">
                {plan === "VIP" ? <Crown className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-base text-[#2C2422] dark:text-[#F5EFE7]">
                    {planTitle}
                  </h4>
                  <Badge variant="champagne" className="text-[10px]">
                    TRỌN GÓI VĨNH VIỄN
                  </Badge>
                </div>
                <p className="text-xs text-[#80726F]">
                  Mở khoá toàn bộ tính năng cao cấp không giới hạn cho ngày trọng đại
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#EADBCE] dark:border-[#3A302E]">
              <span className="text-[11px] text-[#80726F] block">Tổng số tiền cần thanh toán:</span>
              <span className="font-serif text-2xl font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                {amount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>

          {/* Main 2-Column: QR Code & Transfer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: QR Code Box */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#1D1817] border border-[#EADBCE] dark:border-[#3A302E] text-center space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8B5E5A] dark:text-[#D6BE91]">
                <QrCode className="h-4 w-4" />
                <span>MÃ VIETQR TỰ ĐỘNG NAPAS 24/7</span>
              </div>

              {/* VietQR Image Container */}
              <div className="relative p-2.5 bg-white rounded-2xl shadow-md border border-[#EADBCE] dark:border-white/10 group">
                {vietQRUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vietQRUrl}
                    alt="VietQR Chuyển khoản Weddingly"
                    className="w-56 h-56 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-gray-50 rounded-xl">
                    <QrCode className="h-16 w-16 text-gray-400 animate-pulse" />
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#80726F] leading-tight">
                Mở app ngân hàng bất kỳ (MB, VCB, BIDV, Techcombank, MoMo...) và quét mã để tự động điền đúng số tiền & nội dung.
              </p>
            </div>

            {/* Right: Manual Transfer Information & Proof Upload */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E5A] dark:text-[#D6BE91]">
                  Thông tin chuyển khoản thủ công
                </span>

                <div className="space-y-2 text-xs">
                  {/* Ngân hàng */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2A2321] border border-[#EADBCE] dark:border-[#3A302E]">
                    <span className="text-[#80726F]">Ngân hàng:</span>
                    <span className="font-semibold text-[#2C2422] dark:text-[#F5EFE7] text-right">
                      {bankConfig.bank_name}
                    </span>
                  </div>

                  {/* Số tài khoản */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2A2321] border border-[#EADBCE] dark:border-[#3A302E]">
                    <span className="text-[#80726F]">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#8B5E5A] dark:text-[#D6BE91]">
                        {bankConfig.account_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankConfig.account_number, "acc_num")}
                        className="p-1 rounded-md hover:bg-[#F5EFE7] dark:hover:bg-[#3D3330] text-[#6B5E5B] dark:text-[#A69591] transition-colors"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === "acc_num" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tên chủ tài khoản */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2A2321] border border-[#EADBCE] dark:border-[#3A302E]">
                    <span className="text-[#80726F]">Chủ tài khoản:</span>
                    <span className="font-bold uppercase text-[#2C2422] dark:text-[#F5EFE7]">
                      {bankConfig.account_name}
                    </span>
                  </div>

                  {/* Số tiền */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2A2321] border border-[#EADBCE] dark:border-[#3A302E]">
                    <span className="text-[#80726F]">Số tiền chính xác:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        {amount.toLocaleString("vi-VN")} ₫
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(amount.toString(), "amount")}
                        className="p-1 rounded-md hover:bg-[#F5EFE7] dark:hover:bg-[#3D3330] text-[#6B5E5B] dark:text-[#A69591] transition-colors"
                        title="Sao chép số tiền"
                      >
                        {copiedField === "amount" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Nội dung chuyển khoản */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 dark:bg-amber-950/20 dark:border-amber-500/30">
                    <div>
                      <span className="text-amber-900 dark:text-amber-200 font-semibold block">
                        Nội dung chuyển khoản (Bắt buộc):
                      </span>
                      <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                        Giữ nguyên nội dung này để duyệt tự động
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#8B5E5A] dark:text-[#D6BE91] bg-white/80 dark:bg-black/30 px-2 py-0.5 rounded-md">
                        {transferContent}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(transferContent, "content")}
                        className="p-1.5 rounded-md bg-[#8B5E5A] text-white hover:brightness-110 transition-colors shadow-xs"
                        title="Sao chép nội dung"
                      >
                        {copiedField === "content" ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Proof / Receipt & Contact Info */}
              <div className="pt-2 border-t border-[#EADBCE] dark:border-[#3A302E] space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] flex items-center justify-between">
                    <span>Ảnh chụp biên lai chuyển khoản (Khuyên dùng)</span>
                    <span className="text-[10px] text-[#80726F] font-normal">Giúp duyệt siêu tốc</span>
                  </label>

                  {proofImage ? (
                    <div className="relative rounded-xl border border-[#D6BE91] p-2 bg-[#FFFDF9] dark:bg-[#2A2321] flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proofImage}
                        alt="Biên lai chuyển khoản"
                        className="h-14 w-14 object-cover rounded-lg border border-[#EADBCE]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Đã đính kèm ảnh biên lai
                        </p>
                        <p className="text-[10px] text-[#80726F]">Quản trị viên sẽ đối soát ảnh này ngay</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProofImage(null)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                        title="Xóa ảnh"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#D6BE91]/80 hover:border-[#8B5E5A] rounded-xl p-3 text-center cursor-pointer bg-[#FFFDF9]/60 dark:bg-[#2A2321]/40 hover:bg-[#FAF6F0] transition-colors"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <UploadCloud className="h-5 w-5 mx-auto text-[#8B5E5A] mb-1" />
                      <p className="text-xs font-medium text-[#2C2422] dark:text-[#F5EFE7]">
                        Bấm để tải lên ảnh biên lai / bill ngân hàng
                      </p>
                      <p className="text-[10px] text-[#80726F]">Hỗ trợ ảnh PNG, JPG hoặc chụp màn hình</p>
                    </div>
                  )}
                </div>

                {/* SĐT & Ghi chú */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#6B5E5B] dark:text-[#A69591] mb-1 block">
                      Số điện thoại Zalo liên hệ:
                    </label>
                    <Input
                      type="tel"
                      placeholder="VD: 0988 888 888"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#6B5E5B] dark:text-[#A69591] mb-1 block">
                      Ghi chú thêm (nếu có):
                    </label>
                    <Input
                      type="text"
                      placeholder="VD: Cần duyệt gấp trước 18h..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#EADBCE] dark:border-[#3A302E] flex flex-col sm:flex-row items-center justify-between gap-3">
            {onBackToPlans ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToPlans}
                className="w-full sm:w-auto text-xs"
              >
                &larr; Quay lại chọn gói khác
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-[#8B5E5A] to-[#6A4643] text-white font-bold px-6 py-2.5 text-sm shadow-xl hover:brightness-105 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-[#D6BE91]" />
              <span>
                {isSubmitting
                  ? "Đang gửi yêu cầu xác nhận..."
                  : "Tôi đã chuyển khoản – Gửi yêu cầu duyệt ngay"}
              </span>
            </Button>
          </div>

          {/* Guarantee Note */}
          <p className="text-[11px] text-center text-[#80726F] flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              Cam kết kích hoạt nhanh chóng. Bảo hành hoàn tiền 100% trong 7 ngày nếu không hài lòng.
            </span>
          </p>
        </div>
      )}
    </Modal>

    {/* User Order Tracking Modal */}
    <UserOrderTrackingModal
      open={isTrackingOpen}
      onOpenChange={setIsTrackingOpen}
    />
  </>
);
}
