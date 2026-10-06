"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Heart,
  Calendar,
  CheckCircle2,
  PieChart,
  Users,
  Store,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bot,
  Send,
  Globe,
  Armchair,
  Star,
  ChevronDown,
  Calculator,
  Check,
  Smartphone,
  Quote,
  Flame,
  Award,
  BadgeCheck,
  Compass,
  Gift,
  HelpCircle,
  PhoneCall,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Badge } from "@/components/ui/primitives";
import { formatCurrencyVND } from "@/lib/utils";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [activeTab, setActiveTab] = React.useState<"budget" | "rsvp" | "tables" | "website" | "ai">("budget");
  const [customBudget, setCustomBudget] = React.useState<number>(300000000);
  const [guestCount, setGuestCount] = React.useState<number>(250);

  // Budget allocations breakdown calculation
  const venueCost = Math.round(customBudget * 0.5);
  const photoCost = Math.round(customBudget * 0.15);
  const attireCost = Math.round(customBudget * 0.12);
  const decorCost = Math.round(customBudget * 0.1);
  const invitationCost = Math.round(customBudget * 0.05);
  const contingencyCost = Math.round(customBudget * 0.08);

  const testimonials = [
    {
      couple: "Minh Anh & Quốc Minh",
      venue: "Riverside Palace, TP.HCM",
      date: "15/05/2027",
      avatar: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
      quote:
        "Trước đây bọn mình rất stress vì mỗi bên phụ huynh một danh sách khách mời, chi phí thì vượt tầm kiểm soát. Nhờ Weddingly, mọi thứ được đồng bộ rõ ràng, link RSVP gửi Zalo ai cũng khen tiện lợi và hiện đại!",
      highlight: "Tiết kiệm hơn 35 giờ & kiểm soát ngân sách chuẩn 100%",
    },
    {
      couple: "Hoàng Nam & Thục Quyên",
      venue: "Gem Center, TP.HCM",
      date: "28/11/2026",
      avatar: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80",
      quote:
        "Tính năng sơ đồ xếp bàn tiệc và website đám cưới là điểm đỉnh cao nhất! Khách mời vào website xem ảnh pre-wedding, đọc câu chuyện tình yêu rồi mừng cưới qua mã QR tự động rất trang nhã.",
      highlight: "230 khách xác nhận RSVP chỉ sau 48 giờ",
    },
    {
      couple: "Đức Huy & Thanh Mai",
      venue: "JW Marriott Hotel Hanoi",
      date: "12/03/2027",
      avatar: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
      quote:
        "Trợ lý Emma AI tính toán gợi ý ngân sách cực chuẩn cho phong tục cưới miền Bắc. Bọn mình không hề bị thiếu sót bất kỳ lễ vật hay mốc thời gian đón dâu nào!",
      highlight: "Emma AI đồng hành như một Wedding Planner thực thụ",
    },
  ];

  const faqs = [
    {
      q: "Weddingly có dùng mượt mà trên điện thoại không?",
      a: "Hoàn toàn mượt mà! Weddingly được tối ưu hóa Mobile-First 100%, thiết kế chuẩn app native, có thanh điều hướng đáy màn hình và Chế độ Ngày Cưới để theo dõi nhẹ nhàng ngay trong lễ đường.",
    },
    {
      q: "Link điểm danh RSVP cho khách mời hoạt động như thế nào?",
      a: "Mỗi khách mời trong danh sách sẽ có một đường link bảo mật riêng. Bạn có thể sao chép và gửi qua tin nhắn Zalo / Messenger. Khách mở link là thấy ngay thiệp mời kèm nút bấm xác nhận tham dự, số người đi kèm và lời chúc.",
    },
    {
      q: "Dữ liệu đám cưới của chúng tôi có được bảo mật an toàn không?",
      a: "Tuyệt đối an toàn. Dữ liệu được mã hóa chuẩn Row Level Security (RLS) của cơ sở dữ liệu PostgreSQL. Chỉ tài khoản cô dâu, chú rể và những người được bạn phân quyền mới có thể truy cập.",
    },
    {
      q: "Tôi có thể tự thiết kế và thay đổi ảnh trên Website Đám Cưới không?",
      a: "Có! Trình Studio kéo thả cho phép bạn sắp xếp thứ tự 8 khối nội dung, đổi 5 bộ bảng màu phong cách hoàng gia, tải ảnh bìa, ảnh cô dâu chú rể, các cột mốc tình yêu và mã QR ngân hàng trực tiếp từ điện thoại hoặc máy tính.",
    },
    {
      q: "Trợ lý ảo Emma AI có thể hỗ trợ những công việc gì?",
      a: "Emma AI được huấn luyện chuyên sâu theo phong tục cưới hỏi Việt Nam và quy chuẩn quốc tế: gợi ý phân bổ ngân sách theo mức tiền, đề xuất checklist theo số tháng còn lại, viết lời cảm ơn, kịch bản MC và giải quyết phát sinh trong ngày cưới.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2C2422] selection:bg-[#D6BE91] selection:text-[#2C2422]">
      {/* 1. TOP LUXURY NAVIGATION BAR */}
      <header className="sticky top-0 z-50 border-b border-[#EADBCE]/80 bg-[#FFFDF9]/95 px-3 sm:px-8 py-2.5 sm:py-3.5 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm ring-1 ring-[#8B5E5A]/25 group-hover:scale-105 transition-transform bg-[#FFFDF9]">
              <Image
                src="/logo.png"
                alt="Weddingly Logo"
                width={44}
                height={44}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-sm sm:text-lg font-black tracking-wider text-[#2C2422] block leading-tight truncate">
                WEDDINGLY
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8B5E5A] block leading-tight truncate">
                Cưới thông minh – Tài chính an tâm
              </span>
            </div>
          </Link>

          {/* Nav links on desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#6B5E5B]">
            <a href="#features" className="hover:text-[#8B5E5A] transition-colors">
              Tính năng
            </a>
            <a href="#interactive-suite" className="hover:text-[#8B5E5A] transition-colors">
              Trải nghiệm thực tế
            </a>
            <a href="#budget-calculator" className="hover:text-[#8B5E5A] transition-colors">
              Dự toán ngân sách
            </a>
            <a href="#testimonials" className="hover:text-[#8B5E5A] transition-colors">
              Cặp đôi đánh giá
            </a>
            <a href="#pricing" className="hover:text-[#8B5E5A] transition-colors">
              Bảng giá
            </a>
            <a href="#faq" className="hover:text-[#8B5E5A] transition-colors">
              Hỏi đáp
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-xs font-semibold px-2.5 h-8">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="text-xs font-bold px-2.5 sm:px-3 h-8 shadow-sm whitespace-nowrap">
                <span>Vào Workspace</span>
                <ArrowRight className="h-3 w-3 ml-1 hidden sm:inline" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. OPULENT HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 text-center bg-gradient-to-b from-[#FFFDF9] via-[#F8F2EB] to-[#FFFDF9]">
        {/* Soft background luxury glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#D6BE91]/25 via-[#8B5E5A]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Top Floating Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D6BE91] bg-white/90 px-4 py-1.5 text-xs text-[#8B5E5A] shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-500">
            <Sparkles className="h-4 w-4 text-[#D6BE91]" />
            <span className="font-bold tracking-wide">Weddingly • Cưới thông minh – Tài chính an tâm</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#2C2422] leading-[1.18] sm:leading-[1.15]">
            Nền tảng quản lý đám cưới thông minh toàn diện <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#8B5E5A] via-[#B89E6C] to-[#8B5E5A] bg-clip-text text-transparent">
              cho các cặp đôi Việt Nam
            </span>
          </h1>

          <p className="text-xs sm:text-base text-[#6B5E5B] max-w-2xl mx-auto leading-relaxed">
            <strong>Weddingly không chỉ là app ghi chép tiền mừng</strong> mà là hệ sinh thái số toàn diện kết hợp cùng <strong>Trợ lý ảo Emma AI</strong>: Dự toán ngân sách thông minh, điểm danh RSVP 1 chạm, sơ đồ xếp bàn tiệc, timeline ngày cưới và website cưới mang tên hai bạn.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-xl px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-[#8B5E5A] to-[#724B47] hover:brightness-105 transition-all"
              >
                <Sparkles className="h-4 w-4 text-[#D6BE91]" />
                <span>Bắt đầu tạo kế hoạch miễn phí</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold border-[#D6BE91] hover:bg-[#F5EFE7]"
              >
                <span>Khám phá không gian cưới mẫu</span>
              </Button>
            </Link>
          </div>

          {/* Social Proof Stars */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#6B5E5B]">
            <div className="flex items-center gap-1 text-[#C68A27]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="font-semibold text-[#2C2422]">
              4.98 / 5.0 Đánh giá xuất sắc
            </span>
            <span className="text-[#A69591]">•</span>
            <span>Đồng hành cùng hơn <strong>1,200+</strong> cô dâu chú rể</span>
          </div>
        </div>

        {/* 3. HERO INTERACTIVE LIVE DASHBOARD MOCKUP */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16 rounded-[28px] border-4 sm:border-8 border-[#2C2422] bg-white p-3 sm:p-6 shadow-2xl relative text-left">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#EADBCE]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#EF4444]" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
              <span className="h-3 w-3 rounded-full bg-[#10B981]" />
              <span className="ml-2 text-[11px] font-mono text-[#A69591] hidden sm:inline">
                https://weddingly.vn/dashboard
              </span>
            </div>
            <Badge variant="champagne" className="text-[10px] sm:text-xs">
              Live Workspace Preview
            </Badge>
          </div>

          {/* Inner Workspace Card Preview */}
          <div className="mt-4 rounded-[20px] bg-gradient-to-r from-[#2C2422] via-[#423633] to-[#2C2422] p-5 sm:p-7 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#D6BE91] font-bold">
                  Không gian hôn lễ hoàng gia
                </span>
                <h3 className="font-serif text-xl sm:text-3xl font-extrabold text-[#FFFDF9] mt-1">
                  Nguyễn Minh Anh & Trần Quốc Minh
                </h3>
                <p className="text-xs text-[#EADBCE] mt-1 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#D6BE91]" />
                  15/05/2027 • Riverside Palace, TP. Hồ Chí Minh
                </p>
              </div>

              {/* Countdown Pills */}
              <div className="flex items-center gap-2 bg-white/10 p-2 sm:p-3 rounded-xl backdrop-blur-md border border-white/15">
                <div className="text-center px-2">
                  <span className="font-serif text-lg sm:text-2xl font-bold text-[#D6BE91]">186</span>
                  <p className="text-[9px] uppercase text-white/70">Ngày</p>
                </div>
                <span className="text-[#D6BE91] font-serif text-lg">:</span>
                <div className="text-center px-2">
                  <span className="font-serif text-lg sm:text-2xl font-bold text-white">08</span>
                  <p className="text-[9px] uppercase text-white/70">Giờ</p>
                </div>
                <span className="text-[#D6BE91] font-serif text-lg">:</span>
                <div className="text-center px-2">
                  <span className="font-serif text-lg sm:text-2xl font-bold text-white">45</span>
                  <p className="text-[9px] uppercase text-white/70">Phút</p>
                </div>
              </div>
            </div>

            {/* Live Progress Metrics inside mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs border border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-white/80">Ngân sách (Đã chi 32%)</span>
                  <span className="font-bold text-[#D6BE91]">96.000.000 ₫</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#D6BE91] h-full rounded-full" style={{ width: "32%" }} />
                </div>
                <span className="text-[10px] text-white/60 mt-1 block">Hạn mức: 300.000.000 ₫</span>
              </div>

              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs border border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-white/80">Khách mời RSVP (86%)</span>
                  <span className="font-bold text-[#86EFAC]">215 / 250</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#86EFAC] h-full rounded-full" style={{ width: "86%" }} />
                </div>
                <span className="text-[10px] text-white/60 mt-1 block">25 khách đang chờ phản hồi</span>
              </div>

              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs border border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-white/80">Tiến độ công việc (90%)</span>
                  <span className="font-bold text-[#FDE047]">18 / 20 việc</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#FDE047] h-full rounded-full" style={{ width: "90%" }} />
                </div>
                <span className="text-[10px] text-white/60 mt-1 block">Không có việc trễ hạn</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE FEATURE SUITE SHOWCASE */}
      <section id="interactive-suite" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="champagne" className="px-3.5 py-1 text-xs">
            Trải nghiệm trực quan
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2422]">
            Khám phá 5 trụ cột tinh hoa của nền tảng
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E5B] max-w-xl mx-auto">
            Bấm chọn từng hạng mục để xem cách Weddingly vận hành tự động và mượt mà.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-[#F5EFE7] max-w-3xl mx-auto mb-8 scrollbar-none">
          <button
            onClick={() => setActiveTab("budget")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "budget"
                ? "bg-[#8B5E5A] text-white shadow-md"
                : "text-[#6B5E5B] hover:bg-white/60"
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Ngân sách 300M</span>
          </button>

          <button
            onClick={() => setActiveTab("rsvp")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "rsvp"
                ? "bg-[#8B5E5A] text-white shadow-md"
                : "text-[#6B5E5B] hover:bg-white/60"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Điểm danh RSVP</span>
          </button>

          <button
            onClick={() => setActiveTab("tables")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "tables"
                ? "bg-[#8B5E5A] text-white shadow-md"
                : "text-[#6B5E5B] hover:bg-white/60"
            }`}
          >
            <Armchair className="h-4 w-4" />
            <span>Sơ đồ bàn tiệc</span>
          </button>

          <button
            onClick={() => setActiveTab("website")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "website"
                ? "bg-[#8B5E5A] text-white shadow-md"
                : "text-[#6B5E5B] hover:bg-white/60"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Website & Thiệp</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ai"
                ? "bg-[#8B5E5A] text-white shadow-md"
                : "text-[#6B5E5B] hover:bg-white/60"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Emma AI Pro</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="rounded-[24px] border border-[#EADBCE] bg-white p-6 sm:p-10 shadow-lg min-h-[380px]">
          {activeTab === "budget" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E5A]">
                  Kiểm soát tài chính thông minh
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2422]">
                  Không bao giờ lo vượt ngân sách dự trù
                </h3>
                <p className="text-xs sm:text-sm text-[#6B5E5B] leading-relaxed">
                  Hệ thống tự động chia sẻ ngân sách thành từng danh mục cụ thể (Sảnh tiệc, trang phục, chụp ảnh, hoa tươi), cảnh báo ngay khi chi phí chạm mốc 85% hạn mức và quản lý lịch thanh toán đặt cọc theo đợt.
                </p>
                <div className="space-y-2 pt-2 text-xs font-medium text-[#2C2422]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Tải ảnh hóa đơn thanh toán trực tiếp từ máy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Nhắc nhở ngày hẹn cọc hợp đồng tiếp theo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Xuất báo cáo PDF chi tiêu đầy đủ gửi phụ huynh</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#FFFDF9] border border-[#EADBCE] p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#EADBCE]">
                  <span className="font-serif text-sm font-bold text-[#2C2422]">Cơ cấu phân bổ chi phí</span>
                  <Badge variant="success">An toàn trong hạn mức</Badge>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Sảnh tiệc & Menu ẩm thực (50%)</span>
                      <span className="font-bold text-[#2C2422]">150.000.000 ₫</span>
                    </div>
                    <div className="w-full bg-[#F5EFE7] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#8B5E5A] h-full rounded-full" style={{ width: "50%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Studio & Phóng sự ngày cưới (15%)</span>
                      <span className="font-bold text-[#2C2422]">45.000.000 ₫</span>
                    </div>
                    <div className="w-full bg-[#F5EFE7] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#D6BE91] h-full rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Trang phục & Trang điểm cô dâu (12%)</span>
                      <span className="font-bold text-[#2C2422]">36.000.000 ₫</span>
                    </div>
                    <div className="w-full bg-[#F5EFE7] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#3F7D5A] h-full rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rsvp" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3F7D5A]">
                  Tự động hóa khách mời & RSVP
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2422]">
                  Gửi link mời qua Zalo, nhận phản hồi tức thì
                </h3>
                <p className="text-xs sm:text-sm text-[#6B5E5B] leading-relaxed">
                  Mỗi khách mời có một mã và link RSVP duy nhất. Khách chọn số người lớn, trẻ em, ghi chú món ăn chay/mặn và gửi lời chúc trực tiếp đến hai bạn.
                </p>
                <div className="space-y-2 pt-2 text-xs font-medium text-[#2C2422]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Copy link 1 chạm gửi Zalo / Messenger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Phân nhóm Nhà Trai, Nhà Gái, Đồng nghiệp, Bạn thân</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Bộ lọc khách VIP và xuất danh bạ gọi điện thoại trực tiếp</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#FFFDF9] border border-[#EADBCE] p-6 text-center space-y-4 max-w-sm mx-auto">
                <span className="text-[10px] uppercase font-bold text-[#8B5E5A] tracking-wider">
                  Mẫu thiệp xác nhận RSVP trên điện thoại
                </span>
                <div className="rounded-xl border border-[#EADBCE] bg-white p-5 space-y-3">
                  <h4 className="font-serif text-lg font-bold text-[#8B5E5A]">Kính mời: Anh Vũ Phương Thảo</h4>
                  <p className="text-xs text-[#6B5E5B]">Bạn sẽ đến chung vui cùng Minh Anh & Quốc Minh chứ?</p>
                  <div className="flex gap-2 justify-center pt-2">
                    <span className="rounded-lg bg-[#3F7D5A] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
                      ✓ Chắc chắn tham dự
                    </span>
                    <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs text-[#6B5E5B]">
                      Rất tiếc không thể
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tables" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C68A27]">
                  Sơ đồ xếp bàn tiệc (Table Planner)
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2422]">
                  Sắp xếp bàn tiệc trực quan, chuẩn sức chứa
                </h3>
                <p className="text-xs sm:text-sm text-[#6B5E5B] leading-relaxed">
                  Tạo các bàn tròn, bàn dài, bàn VIP đại diện hai họ. Gán từng khách mời vào bàn và hệ thống tự động ngăn chặn vượt quá sức chứa tối đa của sảnh tiệc.
                </p>
                <div className="space-y-2 pt-2 text-xs font-medium text-[#2C2422]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Phân loại Bàn VIP, Bàn bạn học, Bàn công ty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Hiển thị danh sách khách chưa có chỗ để gán nhanh</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#FFFDF9] border border-[#EADBCE] p-6 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#EADBCE]">
                  <span className="font-serif text-xs font-bold text-[#2C2422]">Bàn 01 — VIP Họ Nhà Gái</span>
                  <Badge variant="champagne">10 / 10 chỗ (Đầy)</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white border border-[#EADBCE]">1. Ông Nguyễn Văn Hùng</div>
                  <div className="p-2 rounded-lg bg-white border border-[#EADBCE]">2. Bà Trần Thị Lan</div>
                  <div className="p-2 rounded-lg bg-white border border-[#EADBCE]">3. Bác Hai (Đại diện)</div>
                  <div className="p-2 rounded-lg bg-white border border-[#EADBCE]">4. Cô Ba Thảo</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "website" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E5A]">
                  Website Cưới Studio
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2422]">
                  Website mang tên hai bạn với câu chuyện tình yêu
                </h3>
                <p className="text-xs sm:text-sm text-[#6B5E5B] leading-relaxed">
                  Tự do kéo thả thay đổi vị trí các phần: Lời mở đầu, Album kỷ niệm, Cột mốc yêu thương, Hộp mừng cưới (QR Code) và Sổ ký tên điện tử lưu giữ lời chúc ngàn năm.
                </p>
                <div className="space-y-2 pt-2 text-xs font-medium text-[#2C2422]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>5 Bảng màu phong cách: Luxury Royal, Romantic Rose, Garden Blossom...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Tải ảnh trực tiếp từ máy tính không cần hosting bên ngoài</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-gradient-to-br from-[#2C2422] to-[#423633] p-6 text-white text-center space-y-3">
                <span className="text-[10px] text-[#D6BE91] tracking-widest uppercase">Wedding Website Preview</span>
                <h4 className="font-serif text-2xl font-bold text-[#FFFDF9]">Minh Anh & Quốc Minh</h4>
                <p className="text-xs text-[#EADBCE] italic">&quot;Hạnh phúc là một hành trình, không phải đích đến.&quot;</p>
                <div className="pt-2">
                  <span className="inline-block rounded-full bg-[#D6BE91] px-4 py-1.5 text-xs font-bold text-[#2C2422]">
                    Gửi lời chúc mừng cưới
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E5A]">
                  Trợ lý trí tuệ nhân tạo (AI Assistant)
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2422]">
                  Emma AI — Người bạn đồng hành 24/7
                </h3>
                <p className="text-xs sm:text-sm text-[#6B5E5B] leading-relaxed">
                  Hỏi Emma bất kỳ điều gì: từ cách phân bổ ngân sách 300 triệu, thủ tục lễ ăn hỏi miền Trung, kịch bản dẫn chương trình MC đến mẹo chọn studio chụp ảnh cưới đẹp.
                </p>
                <div className="space-y-2 pt-2 text-xs font-medium text-[#2C2422]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Hiểu sâu sắc văn hóa cưới hỏi truyền thống Việt Nam</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3F7D5A]" />
                    <span>Tích hợp trực tiếp với cơ sở dữ liệu kế hoạch của bạn</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#FFFDF9] border border-[#EADBCE] p-5 space-y-3 text-xs">
                <div className="flex justify-end">
                  <div className="rounded-xl bg-[#8B5E5A] p-2.5 text-white max-w-[80%]">
                    Ngân sách 300 triệu thì nên phân bổ sảnh tiệc bao nhiêu hả Emma?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-xl bg-white border border-[#EADBCE] p-3 text-[#2C2422] max-w-[85%] space-y-1.5">
                    <p className="font-bold text-[#8B5E5A] flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#D6BE91]" />
                      Emma AI:
                    </p>
                    <p className="leading-relaxed text-[#6B5E5B]">
                      Với 300 triệu, tỷ lệ vàng là dành 50% (150 triệu) cho sảnh tiệc và thực đơn 25 bàn tiệc (~6 triệu/bàn đã gồm đồ uống). Bạn nên để 24 triệu (8%) làm quỹ dự phòng nhé!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. INTERACTIVE WEDDING BUDGET ESTIMATOR */}
      <section id="budget-calculator" className="py-20 px-4 sm:px-6 bg-[#F8F2EB] border-y border-[#EADBCE]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[#8B5E5A] border border-[#D6BE91]">
              <Calculator className="h-3.5 w-3.5 text-[#D6BE91]" />
              <span>Công cụ tính toán tài chính tức thì</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2422]">
              Dự toán ngân sách cưới tiêu chuẩn Việt Nam
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E5B] max-w-lg mx-auto">
              Kéo thanh trượt hoặc chọn mức dự trù của bạn để xem gợi ý phân bổ chuẩn xác nhất.
            </p>
          </div>

          {/* Calculator Card */}
          <Card className="p-6 sm:p-8 bg-white border-[#D6BE91] shadow-xl space-y-8">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <label className="font-serif text-base font-bold text-[#2C2422]">
                  Tổng mức ngân sách dự kiến của bạn:
                </label>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#8B5E5A]">
                  {formatCurrencyVND(customBudget)}
                </span>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-2 pt-2 mb-4">
                {[150000000, 250000000, 300000000, 500000000, 800000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCustomBudget(amt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      customBudget === amt
                        ? "bg-[#8B5E5A] text-white shadow-sm"
                        : "bg-[#F5EFE7] text-[#6B5E5B] hover:bg-[#EADBCE]"
                    }`}
                  >
                    {amt / 1000000} Triệu
                  </button>
                ))}
              </div>

              {/* Range slider */}
              <input
                type="range"
                min={100000000}
                max={1000000000}
                step={10000000}
                value={customBudget}
                onChange={(e) => setCustomBudget(Number(e.target.value))}
                className="w-full accent-[#8B5E5A] cursor-pointer h-2 bg-[#F5EFE7] rounded-lg"
              />
            </div>

            {/* Dynamic Allocation Result Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="rounded-[16px] bg-[#FFFDF9] p-4 border border-[#EADBCE]">
                <span className="text-[11px] font-semibold text-[#8B5E5A] uppercase tracking-wider block">
                  Tiệc & Sảnh cưới (50%)
                </span>
                <p className="font-serif text-xl font-bold text-[#2C2422] mt-1">
                  {formatCurrencyVND(venueCost)}
                </p>
                <p className="text-[11px] text-[#A69591] mt-0.5">Khoảng 20-30 bàn tiệc trọn gói</p>
              </div>

              <div className="rounded-[16px] bg-[#FFFDF9] p-4 border border-[#EADBCE]">
                <span className="text-[11px] font-semibold text-[#8B5E5A] uppercase tracking-wider block">
                  Chụp ảnh & Phóng sự (15%)
                </span>
                <p className="font-serif text-xl font-bold text-[#2C2422] mt-1">
                  {formatCurrencyVND(photoCost)}
                </p>
                <p className="text-[11px] text-[#A69591] mt-0.5">Pre-wedding & 2 máy ngày cưới</p>
              </div>

              <div className="rounded-[16px] bg-[#FFFDF9] p-4 border border-[#EADBCE]">
                <span className="text-[11px] font-semibold text-[#8B5E5A] uppercase tracking-wider block">
                  Váy cưới & Trang phục (12%)
                </span>
                <p className="font-serif text-xl font-bold text-[#2C2422] mt-1">
                  {formatCurrencyVND(attireCost)}
                </p>
                <p className="text-[11px] text-[#A69591] mt-0.5">2 Váy chính, 2 Vest & Áo dài</p>
              </div>

              <div className="rounded-[16px] bg-[#FFFDF9] p-4 border border-[#EADBCE]">
                <span className="text-[11px] font-semibold text-[#8B5E5A] uppercase tracking-wider block">
                  Hoa tươi & Trang trí (10%)
                </span>
                <p className="font-serif text-xl font-bold text-[#2C2422] mt-1">
                  {formatCurrencyVND(decorCost)}
                </p>
                <p className="text-[11px] text-[#A69591] mt-0.5">Backdrop chụp ảnh & Bàn Gallery</p>
              </div>

              <div className="rounded-[16px] bg-[#FFFDF9] p-4 border border-[#EADBCE]">
                <span className="text-[11px] font-semibold text-[#8B5E5A] uppercase tracking-wider block">
                  Thiệp cưới & Quà tặng (5%)
                </span>
                <p className="font-serif text-xl font-bold text-[#2C2422] mt-1">
                  {formatCurrencyVND(invitationCost)}
                </p>
                <p className="text-[11px] text-[#A69591] mt-0.5">In thiệp truyền thống & quà tri ân</p>
              </div>

              <div className="rounded-[16px] bg-[#FEF8EC] p-4 border border-[#F6E1B6]">
                <span className="text-[11px] font-semibold text-[#C68A27] uppercase tracking-wider block">
                  Dự phòng phát sinh (8%)
                </span>
                <p className="font-serif text-xl font-bold text-[#C68A27] mt-1">
                  {formatCurrencyVND(contingencyCost)}
                </p>
                <p className="text-[11px] text-[#C68A27]/80 mt-0.5">Quỹ an toàn cho các việc phát sinh</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href="/onboarding">
                <Button variant="primary" size="md" className="gap-2 shadow-md">
                  <span>Áp dụng hạn mức này vào kế hoạch của tôi</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. VERIFIED COUPLE STORIES & TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-14">
          <Badge variant="champagne" className="px-3.5 py-1 text-xs">
            Hạnh phúc lan tỏa
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2422]">
            Được tin yêu bởi các cặp đôi trên toàn quốc
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E5B] max-w-lg mx-auto">
            Lắng nghe chia sẻ thực tế từ những người đã trải qua ngày cưới trọn vẹn và an yên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <Card
              key={idx}
              className="p-4 sm:p-6 flex flex-col justify-between hover:border-[#D6BE91] transition-all bg-white relative rounded-[20px]"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#C68A27]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-[#2C2422] leading-relaxed italic">
                  &quot;{item.quote}&quot;
                </p>

                <div className="p-2.5 rounded-xl bg-[#F5EFE7]/60 text-[11px] font-semibold text-[#8B5E5A]">
                  ★ {item.highlight}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EADBCE] flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.couple}
                  className="h-10 w-10 rounded-full object-cover border-2 border-[#D6BE91]"
                />
                <div>
                  <h4 className="font-serif text-xs font-bold text-[#2C2422]">
                    {item.couple}
                  </h4>
                  <p className="text-[10px] text-[#A69591]">{item.venue}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. PRICING PLANS */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-[#F5EFE7]/50 border-t border-[#EADBCE]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B5E5A]">
              Bảng giá minh bạch
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2422]">
              Đầu tư nhỏ cho sự an tâm trọn vẹn
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E5B] max-w-lg mx-auto">
              Không chi phí ẩn, đồng bộ dữ liệu trọn đời cho hôn lễ của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className="p-6 flex flex-col justify-between bg-white">
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2C2422]">Khởi Đầu (Free)</h3>
                  <p className="text-xs text-[#6B5E5B] mt-1">Dành cho cặp đôi lập kế hoạch cơ bản</p>
                </div>
                <p className="font-serif text-3xl font-bold text-[#2C2422]">0 ₫</p>
                <ul className="text-xs text-[#6B5E5B] space-y-2.5 pt-3 border-t border-[#EADBCE]">
                  <li className="flex items-center gap-2">✓ 1 Workspace đám cưới</li>
                  <li className="flex items-center gap-2">✓ Quản lý tối đa 100 khách mời</li>
                  <li className="flex items-center gap-2">✓ Phân bổ ngân sách cơ bản</li>
                  <li className="flex items-center gap-2">✓ Checklist việc cưới tự động</li>
                </ul>
              </div>
              <Link href="/register" className="pt-6">
                <Button variant="outline" size="md" className="w-full">
                  Bắt đầu miễn phí
                </Button>
              </Link>
            </Card>

            {/* Premium Plan (Featured) */}
            <Card className="p-6 flex flex-col justify-between border-2 border-[#8B5E5A] ring-4 ring-[#8B5E5A]/10 shadow-2xl relative bg-[#FFFDF9]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-[#8B5E5A] px-4 py-1 text-[11px] font-bold text-white shadow-md uppercase tracking-wider">
                  Được 90% Cặp Đôi Lựa Chọn
                </span>
              </div>
              <div className="space-y-4 pt-1">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#8B5E5A]">Hôn Lễ Hoàn Mỹ (Suite)</h3>
                  <p className="text-xs text-[#6B5E5B] mt-1">Trọn gói quyền năng cho ngày cưới trong mơ</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="font-serif text-3xl font-bold text-[#8B5E5A]">499.000 ₫</p>
                  <span className="text-xs text-[#A69591]">/ trọn đời</span>
                </div>
                <ul className="text-xs text-[#2C2422] space-y-2.5 pt-3 border-t border-[#EADBCE] font-medium">
                  <li className="flex items-center gap-2 text-[#3F7D5A]">✓ Không giới hạn số lượng khách mời</li>
                  <li className="flex items-center gap-2 text-[#3F7D5A]">✓ Website đám cưới & Studio kéo thả</li>
                  <li className="flex items-center gap-2 text-[#3F7D5A]">✓ Thiệp online gửi 1 chạm qua Zalo / Facebook</li>
                  <li className="flex items-center gap-2 text-[#3F7D5A]">✓ Sơ đồ xếp bàn tiệc thông minh (Tables)</li>
                  <li className="flex items-center gap-2 text-[#3F7D5A]">✓ Trợ lý Emma AI không giới hạn câu hỏi</li>
                  <li className="flex items-center gap-2 text-[#3F7D5A]">✓ Chế độ Ngày Cưới & danh bạ khẩn cấp</li>
                </ul>
              </div>
              <Link href="/onboarding" className="pt-6">
                <Button variant="primary" size="md" className="w-full shadow-lg bg-[#8B5E5A] hover:bg-[#724B47]">
                  Đăng ký gói Hoàn Mỹ
                </Button>
              </Link>
            </Card>

            {/* Pro / Planner Plan */}
            <Card className="p-6 flex flex-col justify-between bg-white">
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2C2422]">Weddingly Pro</h3>
                  <p className="text-xs text-[#6B5E5B] mt-1">Dành cho Wedding Planner & Agency chuyên nghiệp</p>
                </div>
                <p className="font-serif text-3xl font-bold text-[#2C2422]">1.299.000 ₫</p>
                <ul className="text-xs text-[#6B5E5B] space-y-2.5 pt-3 border-t border-[#EADBCE]">
                  <li className="flex items-center gap-2">✓ Quản lý không giới hạn đám cưới</li>
                  <li className="flex items-center gap-2">✓ Phân quyền cộng tác cùng cặp đôi</li>
                  <li className="flex items-center gap-2">✓ Xuất file báo cáo tài chính chuyên sâu</li>
                  <li className="flex items-center gap-2">✓ Hỗ trợ kỹ thuật VIP 24/7</li>
                </ul>
              </div>
              <Link href="/register" className="pt-6">
                <Button variant="outline" size="md" className="w-full">
                  Liên hệ hợp tác Agency
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="champagne" className="px-3.5 py-1 text-xs">
            Hỏi đáp
          </Badge>
          <h2 className="font-serif text-3xl font-bold text-[#2C2422]">
            Những câu hỏi thường gặp
          </h2>
          <p className="text-xs text-[#6B5E5B]">
            Mọi thông tin bạn cần biết trước khi bắt đầu hành trình cùng chúng tôi.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="p-5 cursor-pointer bg-white hover:border-[#D6BE91] transition-all"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-[#2C2422]">
                  {faq.q}
                </h4>
                <ChevronDown
                  className={`h-4 w-4 text-[#8B5E5A] transition-transform duration-200 shrink-0 ml-2 ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-[#6B5E5B] mt-3 pt-3 border-t border-[#EADBCE] leading-relaxed animate-in fade-in">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* 9. FINAL ROYAL CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 text-center bg-gradient-to-r from-[#2C2422] via-[#423633] to-[#2C2422] text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D6BE91] via-transparent to-transparent" />

        <div className="max-w-2xl mx-auto space-y-5 relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs text-[#D6BE91] backdrop-blur-sm">
            <Heart className="h-3.5 w-3.5 text-[#D6BE91] fill-current" />
            <span>Ngày cưới chỉ có một lần trong đời</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#FFFDF9] leading-snug">
            Hãy để từng khoảnh khắc chuẩn bị <br className="hidden sm:inline" />
            trở thành kỷ niệm ngọt ngào nhất.
          </h2>

          <p className="text-xs sm:text-sm text-[#EADBCE] leading-relaxed">
            Hơn 1,200+ cặp đôi đã lựa chọn buông bỏ âu lo để tận hưởng trọn vẹn hạnh phúc. Tham gia cùng chúng tôi ngay hôm nay!
          </p>

          <div className="pt-3">
            <Link href="/onboarding">
              <Button
                variant="champagne"
                size="lg"
                className="shadow-2xl px-8 py-3.5 text-sm font-bold text-[#2C2422] hover:scale-105 transition-all"
              >
                <span>Bắt đầu miễn phí ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. LUXURY FOOTER */}
      <footer className="py-12 px-6 sm:px-8 bg-[#181413] text-[#A69591] text-xs border-t border-[#3A302E]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#2A2321]">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden ring-1 ring-[#8B5E5A]/40 bg-[#FFFDF9]">
                <Image
                  src="/logo.png"
                  alt="Weddingly Logo"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="font-serif font-black text-white text-base tracking-wider">
                WEDDINGLY
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#D6BE91] font-medium">
              “Cưới thông minh – Tài chính an tâm”
            </p>
            <p className="text-[11px] leading-relaxed">
              Weddingly không chỉ là app ghi chép tiền mừng mà là Nền tảng quản lý đám cưới thông minh toàn diện cho các cặp đôi Việt Nam.
            </p>
            <p className="text-[11px] text-[#D6BE91]">
              Hotline Concierge: 1900 8888 (24/7)
            </p>
          </div>

          {/* Col 2: Features */}
          <div className="space-y-2">
            <p className="font-serif font-bold text-white text-xs uppercase tracking-wider">Hệ Sinh Thái</p>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Bảng điều khiển (Dashboard)</Link></li>
              <li><Link href="/budget" className="hover:text-white transition-colors">Quản lý Ngân sách & Hóa đơn</Link></li>
              <li><Link href="/guests" className="hover:text-white transition-colors">Khách mời & Điểm danh RSVP</Link></li>
              <li><Link href="/tables" className="hover:text-white transition-colors">Sơ đồ xếp bàn tiệc</Link></li>
              <li><Link href="/wedding-website" className="hover:text-white transition-colors">Thiết kế Website đám cưới</Link></li>
            </ul>
          </div>

          {/* Col 3: Tools */}
          <div className="space-y-2">
            <p className="font-serif font-bold text-white text-xs uppercase tracking-wider">Công Cụ Độc Quyền</p>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/timeline" className="hover:text-white transition-colors">Lịch trình & Kịch bản ngày cưới</Link></li>
              <li><Link href="/wedding-day" className="hover:text-white transition-colors">Chế độ Ngày Cưới (Live Mode)</Link></li>
              <li><Link href="/invitations" className="hover:text-white transition-colors">Thiệp cưới điện tử Luxury</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Album ảnh cưới độ phân giải cao</Link></li>
              <li><Link href="/notes" className="hover:text-white transition-colors">Sổ tay ghi chép ý tưởng</Link></li>
            </ul>
          </div>

          {/* Col 4: Locations */}
          <div className="space-y-2">
            <p className="font-serif font-bold text-white text-xs uppercase tracking-wider">Văn Phòng Đại Diện</p>
            <p className="text-[11px] leading-relaxed">
              TP.HCM: Tòa nhà Bitexco Financial Tower, Q.1<br />
              Hà Nội: Lotte Center Hanoi, Q.Ba Đình
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-white/50 block">Hỗ trợ đối tác & Wedding Planners:</span>
              <span className="text-[11px] text-white">partner@weddingly.vn</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>&copy; 2026-2027 Weddingly. All Rights Reserved. Cưới thông minh – Tài chính an tâm.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white">Đăng nhập</Link>
            <Link href="/register" className="hover:text-white">Đăng ký</Link>
            <Link href="/admin" className="hover:text-white">Quản trị hệ thống</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
