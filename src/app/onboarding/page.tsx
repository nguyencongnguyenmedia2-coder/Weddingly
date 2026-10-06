"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Calendar,
  MapPin,
  Receipt,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/utils";
import { WeddingService } from "@/services/wedding.service";
import { WeddingStyle } from "@/types/database";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  // Wizard state
  const [brideName, setBrideName] = React.useState("Nguyễn Minh Anh");
  const [groomName, setGroomName] = React.useState("Trần Quốc Minh");
  const [weddingDate, setWeddingDate] = React.useState("2027-05-15");
  const [venue, setVenue] = React.useState("Riverside Palace, TP.HCM");
  const [estimatedBudget, setEstimatedBudget] = React.useState(300000000);
  const [expectedGuests, setExpectedGuests] = React.useState(250);
  const [style, setStyle] = React.useState<WeddingStyle>("Luxury");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const styleOptions: { id: WeddingStyle; label: string; desc: string }[] = [
    { id: "Luxury", label: "Luxury Royal", desc: "Sang trọng, tone vàng champagne, ánh đèn pha lê lộng lẫy" },
    { id: "Modern", label: "Modern Chic", desc: "Hiện đại, thanh lịch, tinh tế và tối giản" },
    { id: "Garden", label: "Romantic Garden", desc: "Khu vườn cổ tích ngoài trời ngập tràn hoa tươi" },
    { id: "Minimal", label: "Minimalist", desc: "Đơn giản, tinh khôi, tập trung vào khoảnh khắc cảm xúc" },
    { id: "Traditional", label: "Á Đông Truyền Thống", desc: "Nghi lễ gia tiên trang trọng, đậm đà bản sắc Việt" },
    { id: "Beach", label: "Beach Wedding", desc: "Bãi biển lãng mạn lúc hoàng hôn, tiếng sóng vỗ dịu êm" },
  ];

  const handleFinish = async () => {
    setIsSubmitting(true);
    await WeddingService.createWedding({
      brideName,
      groomName,
      weddingDate,
      venue,
      estimatedBudget,
      expectedGuests,
      style,
    });
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#F5EFE7] to-[#FFFDF9] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Step indicator header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#8B5E5A] text-white shadow-md">
            <Heart className="h-5 w-5 fill-current text-[#D6BE91]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2422]">
            Khởi tạo không gian cưới của hai bạn
          </h1>
          <p className="text-xs text-[#6B5E5B]">
            Bước {step} trên 7: Hoàn thiện hồ sơ để hệ thống tự động sinh checklist & ngân sách
          </p>

          {/* Progress bar */}
          <div className="w-full bg-[#EADBCE] h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-[#8B5E5A] h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Form Card */}
        <Card className="p-6 sm:p-8 bg-white shadow-xl border-[#EADBCE]">
          {/* Step 1: Bride & Groom */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2C2422]">
                1. Tên của Cô dâu và Chú rể
              </h3>
              <p className="text-xs text-[#6B5E5B]">
                Hãy nhập tên để hiển thị trên thiệp mời, website và dashboard.
              </p>
              <div>
                <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                  Họ và tên Cô dâu
                </label>
                <Input
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="VD: Nguyễn Minh Anh"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                  Họ và tên Chú rể
                </label>
                <Input
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="VD: Trần Quốc Minh"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Wedding Date */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2C2422]">
                2. Ngày tổ chức hôn lễ
              </h3>
              <p className="text-xs text-[#6B5E5B]">
                Hệ thống sẽ tự động tính toán đếm ngược và lộ trình checklist theo ngày này.
              </p>
              <div>
                <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                  Ngày cưới dự kiến
                </label>
                <Input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Venue */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2C2422]">
                3. Địa điểm tổ chức tiệc cưới
              </h3>
              <p className="text-xs text-[#6B5E5B]">
                Trung tâm hội nghị tiệc cưới, tư gia hoặc địa điểm ngoài trời.
              </p>
              <div>
                <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                  Tên sảnh / Khách sạn / Nhà hàng
                </label>
                <Input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="VD: Riverside Palace, 360D Bến Vân Đồn, Q.4, TP.HCM"
                />
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2C2422]">
                4. Ngân sách dự kiến (VND)
              </h3>
              <p className="text-xs text-[#6B5E5B]">
                Hệ thống sẽ gợi ý tỷ lệ chi tiêu tối ưu cho từng hạng mục dịch vụ.
              </p>
              <div>
                <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                  Tổng ngân sách: {formatCurrencyVND(estimatedBudget)}
                </label>
                <Input
                  type="number"
                  step="10000000"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Step 5: Expected Guests */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2C2422]">
                5. Số lượng khách mời dự kiến
              </h3>
              <p className="text-xs text-[#6B5E5B]">
                Ước lượng quy mô để chuẩn bị số bàn tiệc và thiệp cưới.
              </p>
              <div>
                <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                  Số khách (Người)
                </label>
                <Input
                  type="number"
                  value={expectedGuests}
                  onChange={(e) => setExpectedGuests(Number(e.target.value))}
                  min={10}
                />
              </div>
            </div>
          )}

          {/* Step 6: Style */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2C2422]">
                6. Phong cách tiệc cưới yêu thích
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStyle(opt.id)}
                    className={`p-3.5 rounded-[14px] border text-left transition-all ${
                      style === opt.id
                        ? "bg-[#F5EFE7] border-[#8B5E5A] ring-1 ring-[#8B5E5A]"
                        : "bg-white border-[#EADBCE] hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <p className="font-serif text-xs font-bold text-[#2C2422]">
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-[#6B5E5B] mt-0.5 leading-snug">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Confirm */}
          {step === 7 && (
            <div className="space-y-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF5F0] text-[#3F7D5A]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#2C2422]">
                Mọi thứ đã sẵn sàng!
              </h3>
              <div className="rounded-[16px] bg-[#F5EFE7] p-4 text-left text-xs space-y-2 border border-[#EADBCE]">
                <p><strong>Cặp đôi:</strong> {brideName} & {groomName}</p>
                <p><strong>Ngày cưới:</strong> {weddingDate}</p>
                <p><strong>Địa điểm:</strong> {venue}</p>
                <p><strong>Ngân sách:</strong> {formatCurrencyVND(estimatedBudget)}</p>
                <p><strong>Số khách:</strong> {expectedGuests} người</p>
                <p><strong>Phong cách:</strong> {style}</p>
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[#EADBCE] mt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
            ) : <div />}

            {step < 7 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setStep(step + 1)}
              >
                <span>Tiếp tục</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="champagne"
                size="lg"
                disabled={isSubmitting}
                onClick={handleFinish}
              >
                <span>{isSubmitting ? "Đang tạo không gian..." : "Vào Dashboard ngay"}</span>
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
