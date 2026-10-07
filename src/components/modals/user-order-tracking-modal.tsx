"use client";

import * as React from "react";
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Crown,
  Sparkles,
  Receipt,
  PhoneCall,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { SubscriptionOrder, SubscriptionOrderStatus } from "@/types/database";
import { SubscriptionService } from "@/services/subscription.service";
import { AuthService } from "@/services/auth.service";

interface UserOrderTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenUpgradeModal?: () => void;
}

export function UserOrderTrackingModal({
  open,
  onOpenChange,
  onOpenUpgradeModal,
}: UserOrderTrackingModalProps) {
  const [orders, setOrders] = React.useState<SubscriptionOrder[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const loadOrders = React.useCallback(() => {
    const user = AuthService.getCurrentUser();
    const userOrders = SubscriptionService.getUserOrders(user?.id);
    setOrders(userOrders);

    // Also sync from server API in background
    SubscriptionService.syncFromApi()
      .then(() => {
        const freshUser = AuthService.getCurrentUser();
        setOrders(SubscriptionService.getUserOrders(freshUser?.id));
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (open) {
      loadOrders();
    }
  }, [open, loadOrders]);

  // Real-time listener when orders change or localStorage updates
  React.useEffect(() => {
    const handleOrdersChange = () => {
      loadOrders();
    };

    window.addEventListener("weddingly_orders_changed", handleOrdersChange);
    window.addEventListener("weddingly_auth_changed", handleOrdersChange);
    window.addEventListener("storage", handleOrdersChange);

    return () => {
      window.removeEventListener("weddingly_orders_changed", handleOrdersChange);
      window.removeEventListener("weddingly_auth_changed", handleOrdersChange);
      window.removeEventListener("storage", handleOrdersChange);
    };
  }, [loadOrders]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <>
      <Modal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title="Theo dõi đơn hàng & Trạng thái duyệt gói"
        description="Kiểm tra tiến độ đối soát chuyển khoản và trạng thái kích hoạt gói dịch vụ cưới của bạn theo thời gian thực."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE] dark:border-[#3A302E]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#80726F]">
                Tổng số đơn: <strong className="text-[#2C2422] dark:text-[#F5EFE7]">{orders.length}</strong>
              </span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 animate-pulse">
                  <Clock className="h-3 w-3" />
                  {pendingCount} đơn đang chờ duyệt
                </span>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#8B5E5A] hover:text-[#6A4643] dark:text-[#D6BE91] dark:hover:text-[#F5EFE7] bg-[#F5EFE7]/60 hover:bg-[#F5EFE7] dark:bg-[#2A2321] rounded-lg transition-all cursor-pointer"
              title="Bấm để cập nhật trạng thái mới nhất"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Đang cập nhật..." : "Làm mới trạng thái"}</span>
            </button>
          </div>

          {/* Empty Orders State */}
          {orders.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4 rounded-2xl bg-[#FBF7F2]/60 dark:bg-[#221C1B]/40 border border-[#EADBCE]/70 dark:border-[#3A302E]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EADBCE]/50 dark:bg-[#3A302E] text-[#8B5E5A] dark:text-[#D6BE91]">
                <Receipt className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-serif font-bold text-base text-[#2C2422] dark:text-[#F5EFE7]">
                  Chưa có đơn hàng nâng cấp nào
                </h4>
                <p className="text-xs text-[#80726F] leading-relaxed">
                  Khi bạn gửi yêu cầu thanh toán nâng cấp lên Gói Hoàn Mỹ (PRO VIP) hoặc Kim Cương (VIP LUXURY), thông tin đơn hàng và tiến độ duyệt của Ban Quản Trị sẽ xuất hiện tại đây.
                </p>
              </div>

              {onOpenUpgradeModal && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      onOpenChange(false);
                      onOpenUpgradeModal();
                    }}
                    className="bg-[#8B5E5A] hover:bg-[#724B47] text-white text-xs px-5 py-2 rounded-xl font-semibold gap-1.5"
                  >
                    <Crown className="h-4 w-4 text-[#D6BE91]" />
                    <span>Xem các gói nâng cấp cưới</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4 max-h-[62vh] overflow-y-auto pr-1">
              {orders.map((order) => {
                const isPending = order.status === "PENDING";
                const isApproved = order.status === "APPROVED";
                const isRejected = order.status === "REJECTED";

                const planName =
                  order.plan === "VIP"
                    ? "Gói Kim Cương (VIP LUXURY)"
                    : order.plan === "PRO"
                    ? "Gói Hoàn Mỹ (PRO VIP)"
                    : "Gói Miễn Phí";

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border transition-all p-4.5 space-y-3.5 ${
                      isPending
                        ? "bg-amber-500/5 border-amber-300/60 dark:bg-amber-950/10 dark:border-amber-500/30 shadow-xs"
                        : isApproved
                        ? "bg-emerald-500/5 border-emerald-300/60 dark:bg-emerald-950/10 dark:border-emerald-500/30"
                        : "bg-rose-500/5 border-rose-300/60 dark:bg-rose-950/10 dark:border-rose-500/30"
                    }`}
                  >
                    {/* Top Row: Code, Plan, Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#EADBCE]/60 dark:border-[#3A302E]">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs shrink-0 ${
                            order.plan === "VIP"
                              ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-stone-900 shadow-xs"
                              : "bg-gradient-to-br from-[#8B5E5A] to-[#6A4643] text-[#D6BE91]"
                          }`}
                        >
                          {order.plan === "VIP" ? (
                            <Crown className="h-4 w-4 fill-current" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                              {order.code}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#2C2422]/10 dark:bg-white/10 text-[#2C2422] dark:text-[#F5EFE7]">
                              {planName}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#80726F] flex items-center gap-1.5 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Khởi tạo:{" "}
                              {new Date(order.created_at).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="self-start sm:self-center">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40 animate-pulse">
                            <Clock className="h-3.5 w-3.5 animate-spin text-amber-600" />
                            Đang chờ Admin duyệt
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            Đã duyệt & Đã kích hoạt
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-400/40">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                            Từ chối / Cần đối soát lại
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visual 3-Step Progress Timeline */}
                    <div className="py-2">
                      <div className="grid grid-cols-3 gap-2 text-center relative">
                        {/* Connecting Line */}
                        <div className="absolute top-3.5 left-[16%] right-[16%] h-0.5 bg-[#EADBCE] dark:bg-[#3A302E] -z-0">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isApproved
                                ? "w-full bg-emerald-500"
                                : isRejected
                                ? "w-1/2 bg-rose-400"
                                : "w-1/2 bg-amber-500"
                            }`}
                          />
                        </div>

                        {/* Step 1 */}
                        <div className="relative flex flex-col items-center gap-1">
                          <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                            Đã gửi đơn
                          </span>
                          <span className="text-[9px] text-[#80726F]">Chuyển khoản VietQR</span>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-center gap-1">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                              isApproved
                                ? "bg-emerald-500 text-white"
                                : isRejected
                                ? "bg-rose-500 text-white"
                                : "bg-amber-500 text-white ring-4 ring-amber-500/20"
                            }`}
                          >
                            {isApproved ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : isRejected ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                            Admin đối soát
                          </span>
                          <span className="text-[9px] text-[#80726F]">
                            {isApproved
                              ? "Hoàn tất đối soát"
                              : isRejected
                              ? "Không hợp lệ"
                              : "Đang kiểm tra (5-15p)"}
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-center gap-1">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                              isApproved
                                ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                                : "bg-[#EADBCE] dark:bg-[#3A302E] text-[#80726F]"
                            }`}
                          >
                            {isApproved ? (
                              <Crown className="h-4 w-4 fill-white" />
                            ) : (
                              <span>3</span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                            Kích hoạt gói
                          </span>
                          <span className="text-[9px] text-[#80726F]">
                            {isApproved ? "Đã mở khóa vĩnh viễn" : "Chờ phê duyệt"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Message Box */}
                    {isPending && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                        <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                        <div className="space-y-1">
                          <p className="font-semibold">
                            Hệ thống đang đối soát giao dịch chuyển khoản...
                          </p>
                          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                            Quản trị viên đang kiểm tra sao kê ngân hàng và sẽ duyệt kích hoạt tài khoản của bạn trong khoảng <strong>5 – 15 phút</strong>. Bạn có thể đóng cửa sổ này và tiếp tục sử dụng hệ thống, khi được duyệt tài khoản sẽ tự động nâng cấp ngay!
                          </p>
                        </div>
                      </div>
                    )}

                    {isApproved && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-300/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                            🎉 Đã phê duyệt và kích hoạt thành công!
                          </p>
                          <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                            Đơn hàng đã được duyệt lúc{" "}
                            <strong>
                              {order.reviewed_at
                                ? new Date(order.reviewed_at).toLocaleString("vi-VN")
                                : "vừa xong"}
                            </strong>
                            . Tài khoản của bạn hiện đã được sở hữu trọn đời gói {planName}.
                          </p>
                        </div>
                      </div>
                    )}

                    {isRejected && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-300/40 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-rose-700 dark:text-rose-300">
                            Yêu cầu thanh toán chưa được duyệt
                          </p>
                          <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                            <strong>Lý do từ Ban Quản Trị:</strong>{" "}
                            {order.rejection_reason ||
                              "Số tiền hoặc nội dung chuyển khoản chưa trùng khớp với thông tin đơn hàng."}
                          </p>
                          <p className="text-[10px] text-rose-700/80 pt-1">
                            Vui lòng liên hệ Hotline <strong>1900 6868</strong> hoặc kiểm tra lại biên lai giao dịch.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#221C1B]/80 border border-[#EADBCE]/60 dark:border-[#3A302E]">
                        <span className="text-[10px] text-[#80726F] block">Số tiền:</span>
                        <span className="font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                          {order.amount.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#221C1B]/80 border border-[#EADBCE]/60 dark:border-[#3A302E]">
                        <span className="text-[10px] text-[#80726F] block">Nội dung CK:</span>
                        <span className="font-mono font-semibold text-[#2C2422] dark:text-[#F5EFE7] truncate block text-[11px]" title={order.transfer_content}>
                          {order.transfer_content}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#221C1B]/80 border border-[#EADBCE]/60 dark:border-[#3A302E]">
                        <span className="text-[10px] text-[#80726F] block">Phương thức:</span>
                        <span className="font-medium text-[#2C2422] dark:text-[#F5EFE7]">
                          {order.payment_method === "VIETQR" ? "Quét VietQR" : "Chuyển khoản"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#221C1B]/80 border border-[#EADBCE]/60 dark:border-[#3A302E]">
                        <span className="text-[10px] text-[#80726F] block">Ảnh biên lai bill:</span>
                        {order.proof_image_url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(order.proof_image_url || null)}
                            className="font-medium text-xs text-[#8B5E5A] dark:text-[#D6BE91] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon className="h-3 w-3" />
                            <span>Xem bill</span>
                          </button>
                        ) : (
                          <span className="text-[#80726F] text-[11px]">Chưa đính kèm</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Support Info */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#80726F] border-t border-[#EADBCE]/60 dark:border-[#3A302E]">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-3.5 w-3.5 text-[#8B5E5A] dark:text-[#D6BE91]" />
              <span>
                Cần hỗ trợ gấp về đơn hàng? Hotline 24/7:{" "}
                <strong className="text-[#2C2422] dark:text-[#F5EFE7]">1900 6868 - 0988.888.888</strong>
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-xs py-1.5 px-4"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bill Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="max-w-lg w-full bg-white dark:bg-[#221C1B] rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE] dark:border-[#3A302E]">
              <h4 className="font-serif font-bold text-sm text-[#2C2422] dark:text-[#F5EFE7]">
                Biên lai chuyển khoản đã gửi
              </h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-xs text-[#80726F] hover:text-black dark:hover:text-white"
              >
                Đóng ✕
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Hóa đơn thanh toán"
              className="max-h-[60vh] w-auto mx-auto object-contain rounded-xl border border-[#EADBCE] dark:border-[#3A302E]"
            />
          </div>
        </div>
      )}
    </>
  );
}
