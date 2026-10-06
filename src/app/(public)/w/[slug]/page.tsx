"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  MessageCircle,
  Send,
  CheckCircle2,
  QrCode,
  Image as ImageIcon,
  Share2,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { WeddingService, CountdownResult } from "@/services/wedding.service";
import { TimelineService } from "@/services/timeline.service";
import { Wedding, TimelineEvent } from "@/types/database";
import { WeddingStore, WeddingWebsiteConfig, defaultWebsiteConfig } from "@/lib/wedding-store";

export default function PublicWeddingWebsitePage() {
  const params = useParams();
  const [wedding, setWedding] = React.useState<Wedding | null>(null);
  const [config, setConfig] = React.useState<WeddingWebsiteConfig>(defaultWebsiteConfig);
  const [countdown, setCountdown] = React.useState<CountdownResult | null>(null);
  const [events, setEvents] = React.useState<TimelineEvent[]>([]);
  const [guestMessages, setGuestMessages] = React.useState<
    { name: string; message: string; time: string }[]
  >([
    {
      name: "Gia đình Bác Thành",
      message: "Chúc hai cháu trăm năm hạnh phúc, răng long đầu bạc, sớm sinh quý tử!",
      time: "Hôm nay, 14:30",
    },
    {
      name: "Nhóm Bạn Đại Học Bách Khoa",
      message: "Chúc mừng hai bạn đã chính thức về chung một nhà! Hẹn quẩy hết mình ở bàn tiệc nhé!",
      time: "Hôm qua, 20:15",
    },
    {
      name: "Chị Thảo & Anh Duy",
      message: "Ngưỡng mộ tình yêu 5 năm tuyệt đẹp của hai em. Chúc tổ ấm nhỏ luôn rực rỡ tiếng cười!",
      time: "2 ngày trước",
    },
  ]);
  const [guestName, setGuestName] = React.useState("");
  const [guestText, setGuestText] = React.useState("");
  const [wishSent, setWishSent] = React.useState(false);

  React.useEffect(() => {
    const w = WeddingStore.getWedding();
    setWedding(w);
    setConfig(WeddingStore.getWebsiteConfig());
    setCountdown(WeddingService.calculateCountdown(w.wedding_date));
    setEvents(WeddingStore.getTimeline());

    const timer = setInterval(() => {
      setCountdown(WeddingService.calculateCountdown(w.wedding_date));
    }, 1000);

    const handleUpdate = () => {
      setWedding(WeddingStore.getWedding());
      setConfig(WeddingStore.getWebsiteConfig());
      setEvents(WeddingStore.getTimeline());
    };
    window.addEventListener("wedding_store_updated", handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener("wedding_store_updated", handleUpdate);
    };
  }, []);

  const handlePostWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestText.trim()) return;
    setGuestMessages([
      { name: guestName, message: guestText, time: "Vừa xong" },
      ...guestMessages,
    ]);
    setGuestName("");
    setGuestText("");
    setWishSent(true);
    setTimeout(() => setWishSent(false), 3500);
  };

  if (!wedding || !countdown) return null;

  // Theme palettes definitions
  const themes = {
    luxury: {
      bgClass: "bg-[#FFFDF9]",
      heroGradient: "from-[#2C2422] via-[#423633] to-[#2C2422]",
      accentColor: "#D6BE91",
      primaryText: "#2C2422",
      cardBg: "bg-white",
    },
    rose: {
      bgClass: "bg-[#FFF8F8]",
      heroGradient: "from-[#3D1D24] via-[#5C2E38] to-[#3D1D24]",
      accentColor: "#E5989B",
      primaryText: "#3D1D24",
      cardBg: "bg-white",
    },
    garden: {
      bgClass: "bg-[#F7F9F6]",
      heroGradient: "from-[#1F2E23] via-[#314837] to-[#1F2E23]",
      accentColor: "#8FA382",
      primaryText: "#1F2E23",
      cardBg: "bg-white",
    },
    minimal: {
      bgClass: "bg-[#FAFAFA]",
      heroGradient: "from-[#1F1F1F] via-[#2E2E2E] to-[#1F1F1F]",
      accentColor: "#B5A99A",
      primaryText: "#18181B",
      cardBg: "bg-white",
    },
    ocean: {
      bgClass: "bg-[#F4F7FB]",
      heroGradient: "from-[#122338] via-[#1B3654] to-[#122338]",
      accentColor: "#88B2D6",
      primaryText: "#122338",
      cardBg: "bg-white",
    },
  };

  const currentTheme = themes[config.theme] || themes.luxury;
  const imageMotion = config.imageMotion || defaultWebsiteConfig.imageMotion;

  const getHeroMotionClass = () => {
    if (!imageMotion.enabled || imageMotion.heroEffect === "none") return "transition-all duration-700";
    switch (imageMotion.heroEffect) {
      case "kenburns":
        return "motion-hero-kenburns";
      case "pan-horizontal":
        return "motion-hero-pan";
      case "pulse-zoom":
        return "motion-hero-pulse";
      case "float-tilt":
        return "motion-hero-float-tilt";
      default:
        return "motion-hero-kenburns";
    }
  };

  const getCoupleMotionClass = (role: "bride" | "groom") => {
    if (!imageMotion.enabled || imageMotion.coupleEffect === "classic") return "";
    switch (imageMotion.coupleEffect) {
      case "pulse-ring":
        return "motion-couple-ring";
      case "floating":
        return role === "bride" ? "motion-couple-float-1" : "motion-couple-float-2";
      case "glow-rotate":
        return "motion-couple-glow";
      case "soft-zoom":
        return "hover:scale-110 transition-transform duration-500";
      default:
        return "motion-couple-ring";
    }
  };

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} text-[#2C2422] motion-speed-${imageMotion.speed || "normal"}`}>
      {/* Dynamic Ordered Sections */}
      {config.sections
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map((sec) => {
          // 1. HERO BANNER
          if (sec.id === "hero") {
            return (
              <section
                key="hero"
                className={`relative min-h-[92vh] flex items-center justify-center text-center p-6 bg-gradient-to-b ${currentTheme.heroGradient} text-white overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 bg-cover bg-center opacity-30 ${getHeroMotionClass()}`}
                  style={{ backgroundImage: `url(${config.hero.coverImageUrl})` }}
                />
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D6BE91_1px,transparent_1px)] [background-size:20px_20px]" />

                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs backdrop-blur-md border border-white/15">
                    <Sparkles className="h-4 w-4" style={{ color: currentTheme.accentColor }} />
                    <span className="tracking-widest uppercase font-semibold text-[11px]">{config.hero.title}</span>
                  </div>

                  <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FFFDF9] leading-tight">
                    {config.couple.brideName}
                    <span
                      className="block text-2xl sm:text-4xl font-serif my-2"
                      style={{ color: currentTheme.accentColor }}
                    >
                      &
                    </span>
                    {config.couple.groomName}
                  </h1>

                  <p className="text-xs sm:text-sm text-white/90 font-light max-w-lg mx-auto leading-relaxed italic">
                    &ldquo;{config.hero.subTitle}&rdquo;
                  </p>

                  {/* Countdown Timer Clock */}
                  {config.hero.showCountdown && (
                    <div className="flex items-center justify-center gap-3 sm:gap-4 bg-white/10 p-4 rounded-[28px] backdrop-blur-md max-w-md mx-auto border border-white/20 shadow-2xl">
                      <div className="text-center px-2 sm:px-3">
                        <span
                          className="font-serif text-2xl sm:text-4xl font-bold"
                          style={{ color: currentTheme.accentColor }}
                        >
                          {countdown.totalDays}
                        </span>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Ngày</p>
                      </div>
                      <span className="font-serif text-2xl text-white/40">:</span>
                      <div className="text-center px-2 sm:px-3">
                        <span className="font-serif text-2xl sm:text-4xl font-bold text-white">
                          {String(countdown.hours).padStart(2, "0")}
                        </span>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Giờ</p>
                      </div>
                      <span className="font-serif text-2xl text-white/40">:</span>
                      <div className="text-center px-2 sm:px-3">
                        <span className="font-serif text-2xl sm:text-4xl font-bold text-white">
                          {String(countdown.minutes).padStart(2, "0")}
                        </span>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Phút</p>
                      </div>
                      <span className="font-serif text-2xl text-white/40">:</span>
                      <div className="text-center px-2 sm:px-3">
                        <span
                          className="font-serif text-2xl sm:text-4xl font-bold"
                          style={{ color: currentTheme.accentColor }}
                        >
                          {String(countdown.seconds).padStart(2, "0")}
                        </span>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Giây</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-xs text-white/90 flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" style={{ color: currentTheme.accentColor }} />
                      <span className="font-semibold">{wedding.wedding_date}</span>
                      <span>•</span>
                      <span>{wedding.venue}</span>
                    </p>
                  </div>
                </div>
              </section>
            );
          }

          // 2. COUPLE PROFILES
          if (sec.id === "couple") {
            return (
              <section key="couple" className="py-24 px-6 max-w-5xl mx-auto text-center space-y-12">
                <div className="space-y-2">
                  <Badge variant="champagne" className="text-xs tracking-widest uppercase">
                    {config.couple.title}
                  </Badge>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">{config.couple.brideName} & {config.couple.groomName}</h2>
                  <p className="text-xs sm:text-sm text-[#6B5E5B] max-w-lg mx-auto italic">
                    {config.couple.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Bride Profile Card */}
                  <div className="p-8 rounded-[28px] bg-white border border-[#EADBCE] shadow-sm hover:shadow-xl transition-all space-y-4">
                    <div className={`h-36 w-36 rounded-full overflow-hidden mx-auto border-4 border-[#D6BE91] shadow-md relative ${getCoupleMotionClass("bride")}`}>
                      <img
                        src={config.couple.bridePhotoUrl}
                        alt="Bride"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold">{config.couple.brideName}</h3>
                      <span className="text-xs font-semibold text-[#8B5E5A] tracking-wider uppercase mt-1 block">
                        {config.couple.brideTitle}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B5E5B] leading-relaxed max-w-xs mx-auto">
                      {config.couple.brideBio}
                    </p>
                  </div>

                  {/* Groom Profile Card */}
                  <div className="p-8 rounded-[28px] bg-white border border-[#EADBCE] shadow-sm hover:shadow-xl transition-all space-y-4">
                    <div className={`h-36 w-36 rounded-full overflow-hidden mx-auto border-4 border-[#D6BE91] shadow-md relative ${getCoupleMotionClass("groom")}`}>
                      <img
                        src={config.couple.groomPhotoUrl}
                        alt="Groom"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold">{config.couple.groomName}</h3>
                      <span className="text-xs font-semibold text-[#8B5E5A] tracking-wider uppercase mt-1 block">
                        {config.couple.groomTitle}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B5E5B] leading-relaxed max-w-xs mx-auto">
                      {config.couple.groomBio}
                    </p>
                  </div>
                </div>
              </section>
            );
          }

          // 3. LOVE STORY MILESTONES
          if (sec.id === "story") {
            return (
              <section key="story" className="py-24 px-6 bg-white/70 border-y border-[#EADBCE]/60">
                <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
                  <Heart className="h-8 w-8 text-[#8B5E5A] fill-current mx-auto" />
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">{config.story.title}</h2>
                  <p className="text-xs sm:text-sm text-[#6B5E5B] max-w-md mx-auto">
                    {config.story.description}
                  </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-8">
                  {config.story.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[24px] bg-white border border-[#EADBCE] shadow-sm hover:shadow-md transition-all group ${
                        idx % 2 === 1 ? "sm:flex-row-reverse" : ""
                      }`}
                    >
                      {m.imageUrl && (
                        <div className="w-full sm:w-44 h-44 rounded-[18px] overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={m.imageUrl}
                            alt={m.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                          />
                        </div>
                      )}
                      <div className="space-y-2 text-left flex-1">
                        <span className="text-xs font-bold text-[#8B5E5A] tracking-wider uppercase bg-[#F5EFE7] px-3 py-1 rounded-full">
                          {m.year}
                        </span>
                        <h4 className="font-serif text-base sm:text-lg font-bold text-[#2C2422]">
                          {m.title}
                        </h4>
                        <p className="text-xs text-[#6B5E5B] leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // 4. EVENTS & LOCATION
          if (sec.id === "events") {
            return (
              <section key="events" className="py-24 px-6 max-w-4xl mx-auto text-center space-y-12">
                <div className="space-y-2">
                  <Clock className="h-8 w-8 text-[#8B5E5A] mx-auto" />
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">{config.events.title}</h2>
                  <p className="text-xs sm:text-sm text-[#6B5E5B] max-w-md mx-auto">
                    {config.events.description}
                  </p>
                  {config.events.dresscode && (
                    <div className="pt-2">
                      <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F5EFE7] text-[#8B5E5A]">
                        Dresscode: {config.events.dresscode}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto text-left">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-6 rounded-[24px] bg-white border border-[#EADBCE] shadow-sm hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="champagne" className="font-mono text-xs font-bold">
                          {evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ""}
                        </Badge>
                        <span className="text-[11px] text-[#A69591]">{evt.event_date}</span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-[#2C2422]">{evt.title}</h4>
                      {evt.location && (
                        <p className="text-xs text-[#6B5E5B] flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#8B5E5A] shrink-0" />
                          <span>{evt.location}</span>
                        </p>
                      )}
                      {evt.description && (
                        <p className="text-[11px] text-[#A69591] italic pt-1">{evt.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // 5. GALLERY SHOWCASE
          if (sec.id === "gallery") {
            return (
              <section key="gallery" className="py-24 px-6 bg-white/70 border-y border-[#EADBCE]/60">
                <div className="max-w-4xl mx-auto text-center space-y-4 mb-14">
                  <ImageIcon className="h-8 w-8 text-[#8B5E5A] mx-auto" />
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">{config.gallery.title}</h2>
                  <p className="text-xs sm:text-sm text-[#6B5E5B] max-w-md mx-auto">
                    {config.gallery.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                  {config.gallery.photos.map((photo, idx) => {
                    let cardMotionClass = "shadow-sm hover:shadow-xl";
                    let imgMotionClass = "group-hover:scale-105";

                    if (imageMotion.enabled) {
                      if (imageMotion.galleryHover === "hover-zoom-glow") {
                        cardMotionClass = "motion-gallery-zoom-glow";
                      } else if (imageMotion.galleryHover === "hover-tilt-3d") {
                        cardMotionClass = "motion-gallery-tilt";
                      } else if (imageMotion.galleryHover === "shimmer-shine") {
                        cardMotionClass = "image-shimmer-effect hover:shadow-xl";
                      } else if (imageMotion.galleryHover === "floating-soft") {
                        cardMotionClass = idx % 2 === 0 ? "motion-gallery-float-odd hover:shadow-xl" : "motion-gallery-float-even hover:shadow-xl";
                      } else if (imageMotion.galleryHover === "kenburns-card") {
                        imgMotionClass = idx % 2 === 0 ? "motion-gallery-kenburns-odd" : "motion-gallery-kenburns-even";
                      }
                    }

                    return (
                      <div
                        key={photo.id}
                        className={`group relative overflow-hidden rounded-[20px] bg-white border border-[#EADBCE] transition-all aspect-[4/3] ${cardMotionClass}`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || "Wedding photo"}
                          className={`h-full w-full object-cover transition-transform duration-700 ${imgMotionClass}`}
                        />
                        {photo.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // 6. GUESTBOOK & WISHES
          if (sec.id === "guestbook") {
            return (
              <section key="guestbook" className="py-24 px-6 max-w-3xl mx-auto space-y-10">
                <div className="text-center space-y-2">
                  <MessageCircle className="h-8 w-8 text-[#8B5E5A] mx-auto" />
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">{config.guestbook.title}</h2>
                  <p className="text-xs sm:text-sm text-[#6B5E5B]">{config.guestbook.description}</p>
                </div>

                {/* Wish Submission Form */}
                <Card className="p-6 sm:p-8 bg-white shadow-md">
                  <form onSubmit={handlePostWish} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                        Tên hoặc danh xưng của bạn <span className="text-[#B44A4A]">*</span>
                      </label>
                      <Input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="VD: Chị Thảo & Anh Duy (Bạn thân cô dâu)"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                        Lời chúc mừng hạnh phúc <span className="text-[#B44A4A]">*</span>
                      </label>
                      <textarea
                        value={guestText}
                        onChange={(e) => setGuestText(e.target.value)}
                        placeholder="Hãy gửi những lời chúc ấm áp nhất dành cho cô dâu & chú rể..."
                        rows={3}
                        required
                        className="w-full rounded-[14px] border border-[#EADBCE] bg-[#FFFDF9] p-3 text-xs text-[#2C2422] focus:ring-2 focus:ring-[#D6BE91]"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#3F7D5A] font-semibold">
                        {wishSent && "✓ Cảm ơn bạn! Lời chúc đã được gửi thành công!"}
                      </span>
                      <Button type="submit" variant="primary" size="md">
                        <Send className="h-4 w-4" />
                        <span>Gửi lời chúc mừng</span>
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Wishes List */}
                <div className="space-y-3 pt-2">
                  {guestMessages.map((msg, i) => (
                    <Card key={i} className="p-4 bg-white border border-[#EADBCE]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#F5EFE7]">
                        <h4 className="font-serif text-xs font-bold text-[#8B5E5A]">{msg.name}</h4>
                        <span className="text-[10px] text-[#A69591]">{msg.time}</span>
                      </div>
                      <p className="text-xs text-[#2C2422] mt-2 leading-relaxed italic">
                        &ldquo;{msg.message}&rdquo;
                      </p>
                    </Card>
                  ))}
                </div>
              </section>
            );
          }

          // 7. ONLINE GIFT BOX & QR CODE
          if (sec.id === "gift" && config.gift.enabled) {
            return (
              <section key="gift" className="py-24 px-6 bg-white/70 border-t border-[#EADBCE]/60 text-center space-y-8">
                <div className="space-y-2 max-w-md mx-auto">
                  <QrCode className="h-8 w-8 text-[#8B5E5A] mx-auto" />
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">{config.gift.title}</h2>
                  <p className="text-xs sm:text-sm text-[#6B5E5B]">{config.gift.description}</p>
                </div>

                <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#EADBCE] shadow-lg max-w-sm mx-auto space-y-4">
                  {config.gift.qrCodeUrl && (
                    <div className="h-44 w-44 mx-auto rounded-2xl overflow-hidden border border-[#EADBCE] p-2 bg-white">
                      <img src={config.gift.qrCodeUrl} alt="Mã QR mừng cưới" className="h-full w-full object-contain" />
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-[#2C2422]">
                    <p className="font-bold text-sm text-[#8B5E5A]">{config.gift.bankName}</p>
                    <p className="font-mono text-base font-extrabold tracking-wider">{config.gift.accountNumber}</p>
                    <p className="text-xs text-[#6B5E5B] uppercase font-semibold">{config.gift.accountHolder}</p>
                  </div>
                </div>
              </section>
            );
          }

          // 8. FOOTER
          if (sec.id === "footer") {
            return (
              <footer key="footer" className="py-14 bg-[#2C2422] text-white text-center px-6 space-y-4">
                <p className="text-xs sm:text-sm text-white/80 italic max-w-md mx-auto leading-relaxed">
                  &ldquo;{config.footer.quote}&rdquo;
                </p>
                <div className="space-y-1">
                  <p className="font-serif font-bold text-lg" style={{ color: currentTheme.accentColor }}>
                    {config.couple.brideName} & {config.couple.groomName}
                  </p>
                  <p className="font-mono text-xs opacity-75">{config.footer.hashtag}</p>
                </div>
                <p className="text-white/40 text-[10px] pt-4 border-t border-white/10 max-w-xs mx-auto">
                  Weddingly • Cưới thông minh – Tài chính an tâm
                </p>
              </footer>
            );
          }

          return null;
        })}
    </div>
  );
}
