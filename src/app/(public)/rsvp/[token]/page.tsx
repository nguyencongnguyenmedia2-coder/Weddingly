"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { GuestService } from "@/services/guest.service";
import { WeddingService } from "@/services/wedding.service";
import { Guest, Wedding } from "@/types/database";

export default function PublicRSVPPage() {
  const params = useParams();
  const token = params?.token as string;

  const [guest, setGuest] = React.useState<Guest | null>(null);
  const [wedding, setWedding] = React.useState<Wedding | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Form states
  const [attending, setAttending] = React.useState(true);
  const [guestCount, setGuestCount] = React.useState(1);
  const [childrenCount, setChildrenCount] = React.useState(0);
  const [mealChoice, setMealChoice] = React.useState("Tiêu chuẩn");
  const [wishes, setWishes] = React.useState("");

  React.useEffect(() => {
    async function load() {
      if (!token) return;
      const g = await GuestService.getGuestByToken(token);
      setGuest(g);
      const w = await WeddingService.getActiveWedding();
      setWedding(w);
      if (g) {
        setAttending(g.rsvp_status !== "DECLINED");
        setGuestCount(g.plus_one ? 2 : 1);
        setChildrenCount(g.children || 0);
        if (g.meal_preference) setMealChoice(g.meal_preference);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await GuestService.updateGuestRSVP(token, {
      attending,
      guestCount,
      childrenCount,
      mealChoice,
      wishes,
    });
    setIsSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">
        <div className="flex flex-col items-center gap-2">
          <Heart className="h-8 w-8 text-[#8B5E5A] animate-pulse fill-current" />
          <p className="font-serif text-sm text-[#8B5E5A]">Đang mở thiệp phản hồi...</p>
        </div>
      </div>
    );
  }

  if (!guest || !wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9] p-4">
        <Card className="max-w-md text-center p-8">
          <Heart className="h-10 w-10 text-[#A69591] mx-auto mb-3" />
          <h2 className="font-serif text-lg font-bold text-[#2C2422]">
            Mã phản hồi thiệp không hợp lệ
          </h2>
          <p className="text-xs text-[#6B5E5B] mt-2">
            Liên kết này không tồn tại hoặc đã hết hiệu lực. Quý khách vui lòng liên hệ cô dâu chú rể để được hỗ trợ.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#F5EFE7] to-[#FFFDF9] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Wedding Header Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5E5A] text-white shadow-md">
            <Heart className="h-6 w-6 fill-current text-[#D6BE91]" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8B5E5A]">
            Lời mời cưới trân trọng
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2422]">
            {wedding.bride_name} & {wedding.groom_name}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#6B5E5B]">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-4 w-4 text-[#D6BE91]" />
              {wedding.wedding_date}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="h-4 w-4 text-[#D6BE91]" />
              {wedding.venue}
            </span>
          </div>
        </div>

        {/* RSVP Card */}
        <Card className="p-6 sm:p-8 shadow-xl border-[#D6BE91] bg-white">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF5F0] text-[#3F7D5A] shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2C2422]">
                {attending ? "Cảm ơn bạn đã xác nhận tham dự!" : "Đã ghi nhận phản hồi của bạn"}
              </h3>
              <p className="text-xs text-[#6B5E5B] max-w-sm mx-auto leading-relaxed">
                {attending
                  ? `Minh Anh & Quốc Minh rất hạnh phúc và vinh hạnh được đón tiếp bạn cùng gia đình (${guestCount} người) trong ngày trọng đại!`
                  : "Dù rất tiếc không thể chung vui trực tiếp cùng bạn, hai vợ chồng xin gửi lời cảm ơn chân thành nhất đến tình cảm và lời chúc của bạn!"}
              </p>
              <div className="pt-4">
                <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
                  Thay đổi phản hồi
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-[#EADBCE] pb-3 text-center">
                <p className="text-xs text-[#8B5E5A] font-semibold">Khách mời:</p>
                <p className="font-serif text-lg font-bold text-[#2C2422]">{guest.name}</p>
              </div>

              {/* Attendance Choice */}
              <div>
                <label className="text-xs font-semibold text-[#2C2422] block mb-2">
                  Bạn sẽ tham dự chung vui cùng cô dâu chú rể chứ?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttending(true)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-[12px] border text-xs font-semibold transition-all ${
                      attending
                        ? "bg-[#8B5E5A] text-white border-[#8B5E5A] shadow-sm"
                        : "bg-[#FFFDF9] text-[#2C2422] border-[#EADBCE] hover:bg-[#F5EFE7]"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Tôi chắc chắn sẽ đến</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttending(false)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-[12px] border text-xs font-semibold transition-all ${
                      !attending
                        ? "bg-[#2C2422] text-white border-[#2C2422] shadow-sm"
                        : "bg-[#FFFDF9] text-[#2C2422] border-[#EADBCE] hover:bg-[#F5EFE7]"
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Rất tiếc tôi bận</span>
                  </button>
                </div>
              </div>

              {attending && (
                <>
                  {/* Number of Guests */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                        Số người lớn tham dự
                      </label>
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full rounded-[12px] border border-[#EADBCE] bg-[#FFFDF9] p-2.5 text-xs text-[#2C2422]"
                      >
                        <option value={1}>1 người (Chỉ mình tôi)</option>
                        <option value={2}>2 người (+1 người đi cùng)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                        Số trẻ em đi kèm
                      </label>
                      <select
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(Number(e.target.value))}
                        className="w-full rounded-[12px] border border-[#EADBCE] bg-[#FFFDF9] p-2.5 text-xs text-[#2C2422]"
                      >
                        <option value={0}>0 trẻ em</option>
                        <option value={1}>1 bé</option>
                        <option value={2}>2 bé</option>
                      </select>
                    </div>
                  </div>

                  {/* Meal choice */}
                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                      Khẩu vị / Yêu cầu món ăn đặc biệt
                    </label>
                    <select
                      value={mealChoice}
                      onChange={(e) => setMealChoice(e.target.value)}
                      className="w-full rounded-[12px] border border-[#EADBCE] bg-[#FFFDF9] p-2.5 text-xs text-[#2C2422]"
                    >
                      <option value="Tiêu chuẩn">Thực đơn tiệc tiêu chuẩn</option>
                      <option value="Ăn chay">Ăn chay (Vegetarian)</option>
                      <option value="Không ăn hải sản">Dị ứng / Không ăn hải sản</option>
                      <option value="Không cay">Không ăn cay</option>
                    </select>
                  </div>
                </>
              )}

              {/* Wishes */}
              <div>
                <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                  Lời chúc mừng gửi tới Cô dâu & Chú rể
                </label>
                <textarea
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  rows={3}
                  placeholder="Gửi lời chúc ngọt ngào nhất tới hai bạn..."
                  className="w-full rounded-[12px] border border-[#EADBCE] bg-[#FFFDF9] p-3 text-xs text-[#2C2422] placeholder:text-[#A69591] focus:outline-none focus:ring-2 focus:ring-[#D6BE91]"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full shadow-md">
                <Send className="h-4 w-4" />
                <span>Gửi xác nhận tham dự</span>
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
