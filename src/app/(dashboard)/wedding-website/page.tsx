"use client";

import * as React from "react";
import Link from "next/link";
import {
  Globe,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Save,
  Palette,
  Heart,
  UploadCloud,
  FileImage,
  MapPin,
  Calendar,
  Users,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  Clock,
  QrCode,
  Image as ImageIcon,
  Type,
  Layout,
  Sliders,
  Settings,
  Film,
  Zap,
  Play,
  Wand2,
  Flame,
  Crown,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Download,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import {
  WeddingStore,
  WeddingWebsiteConfig,
  WebsiteSectionConfig,
  LoveStoryItem,
  ImageMotionConfig,
  defaultWebsiteConfig,
} from "@/lib/wedding-store";
import { Wedding } from "@/types/database";
import { AuthService } from "@/services/auth.service";
import { UpgradePlanModal } from "@/components/modals/upgrade-plan-modal";

export default function WeddingWebsiteBuilderPage() {
  const [wedding, setWedding] = React.useState<Wedding | null>(null);
  const [config, setConfig] = React.useState<WeddingWebsiteConfig>(defaultWebsiteConfig);
  const [activeTab, setActiveTab] = React.useState<"sections" | "design" | "motion" | "content">("sections");
  const [selectedSectionId, setSelectedSectionId] = React.useState<string>("hero");
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "mobile">("desktop");
  const [zoomScale, setZoomScale] = React.useState<number>(100);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState<boolean>(false);
  const [previewKey, setPreviewKey] = React.useState<number>(0);
  const [copied, setCopied] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Subscription plan states
  const [userPlan, setUserPlan] = React.useState<"FREE" | "PRO">("FREE");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<string | undefined>(undefined);

  // Milestone modal
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = React.useState(false);
  const [newMilestoneYear, setNewMilestoneYear] = React.useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = React.useState("");
  const [newMilestoneImg, setNewMilestoneImg] = React.useState("");

  const loadData = React.useCallback(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setUserPlan(user.plan || "FREE");
    }
    setWedding(WeddingStore.getWedding());
    setConfig(WeddingStore.getWebsiteConfig());
  }, []);

  React.useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("wedding_store_updated", handleUpdate);
    return () => window.removeEventListener("wedding_store_updated", handleUpdate);
  }, [loadData]);

  const handleCopyLink = () => {
    if (!wedding) return;
    const url = `${window.location.origin}/w/${wedding.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    WeddingStore.saveWebsiteConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ bố cục và thiết kế về mẫu mặc định?")) {
      WeddingStore.saveWebsiteConfig(defaultWebsiteConfig);
      setConfig(defaultWebsiteConfig);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // Section Reordering & Toggling
  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...config.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update order numbers
    newSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    const updated = { ...config, sections: newSections };
    setConfig(updated);
    WeddingStore.saveWebsiteConfig(updated);
  };

  const toggleSection = (id: string) => {
    const newSections = config.sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    const updated = { ...config, sections: newSections };
    setConfig(updated);
    WeddingStore.saveWebsiteConfig(updated);
  };

  // File Upload Helper
  const handleGenericFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onComplete(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Theme palettes definitions
  const themes = [
    {
      id: "luxury",
      name: "Luxury Royal",
      subtitle: "Vàng Champagne & Nâu ấm hoàng gia",
      bgClass: "bg-[#FFFDF9]",
      heroGradient: "from-[#2C2422] via-[#423633] to-[#2C2422]",
      accentColor: "#D6BE91",
      primaryText: "#2C2422",
    },
    {
      id: "rose",
      name: "Romantic Rose",
      subtitle: "Hồng pastel & Đỏ rượu vang lãng mạn",
      bgClass: "bg-[#FFF8F8]",
      heroGradient: "from-[#3D1D24] via-[#5C2E38] to-[#3D1D24]",
      accentColor: "#E5989B",
      primaryText: "#3D1D24",
    },
    {
      id: "garden",
      name: "Garden Blossom",
      subtitle: "Xanh olive thiên nhiên & Trắng tinh khôi",
      bgClass: "bg-[#F7F9F6]",
      heroGradient: "from-[#1F2E23] via-[#314837] to-[#1F2E23]",
      accentColor: "#8FA382",
      primaryText: "#1F2E23",
    },
    {
      id: "minimal",
      name: "Modern Minimal",
      subtitle: "Beige, Xám khói & Đen thanh lịch",
      bgClass: "bg-[#FAFAFA]",
      heroGradient: "from-[#1F1F1F] via-[#2E2E2E] to-[#1F1F1F]",
      accentColor: "#B5A99A",
      primaryText: "#18181B",
    },
    {
      id: "ocean",
      name: "Ocean Breeze",
      subtitle: "Xanh Navy biển cả & Ánh kim rạng rỡ",
      bgClass: "bg-[#F4F7FB]",
      heroGradient: "from-[#122338] via-[#1B3654] to-[#122338]",
      accentColor: "#88B2D6",
      primaryText: "#122338",
    },
  ];

  const currentTheme = themes.find((t) => t.id === config.theme) || themes[0];

  // Image Motion System Config & Helpers
  const imageMotion = config.imageMotion || defaultWebsiteConfig.imageMotion;

  const updateImageMotion = (changes: Partial<ImageMotionConfig>) => {
    const updated = {
      ...config,
      imageMotion: {
        ...imageMotion,
        ...changes,
      },
    };
    setConfig(updated);
    WeddingStore.saveWebsiteConfig(updated);
  };

  const motionPresets = [
    {
      id: "cinematic",
      name: "Điện ảnh Hoàng gia",
      badge: "Được yêu thích nhất",
      subtitle: "Ken Burns slow + Vòng hào quang vàng champagne",
      icon: "👑",
      config: {
        enabled: true,
        heroEffect: "kenburns" as const,
        galleryHover: "hover-zoom-glow" as const,
        coupleEffect: "pulse-ring" as const,
        speed: "slow" as const,
      },
    },
    {
      id: "sparkle",
      name: "Kim cương Lấp lánh",
      badge: "Lãng mạn & Quý phái",
      subtitle: "Tia sáng quét qua ảnh album + Nhịp thở tình yêu",
      icon: "✨",
      config: {
        enabled: true,
        heroEffect: "pulse-zoom" as const,
        galleryHover: "shimmer-shine" as const,
        coupleEffect: "glow-rotate" as const,
        speed: "normal" as const,
      },
    },
    {
      id: "dreamy",
      name: "Bồng bềnh Thơ mộng",
      badge: "Êm ái & Tinh tế",
      subtitle: "Nghiêng 3D đa trục + Album ảnh lướt sóng nhịp nhàng",
      icon: "🕊️",
      config: {
        enabled: true,
        heroEffect: "float-tilt" as const,
        galleryHover: "floating-soft" as const,
        coupleEffect: "floating" as const,
        speed: "slow" as const,
      },
    },
    {
      id: "exhibition",
      name: "Triển lãm Tự động",
      badge: "Hiện đại & Sống động",
      subtitle: "Album tự động chuyển động zoom + Lướt toàn cảnh",
      icon: "🎬",
      config: {
        enabled: true,
        heroEffect: "pan-horizontal" as const,
        galleryHover: "kenburns-card" as const,
        coupleEffect: "soft-zoom" as const,
        speed: "normal" as const,
      },
    },
  ];

  const getHeroMotionClass = () => {
    if (!imageMotion.enabled || imageMotion.heroEffect === "none") return "";
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

  const getGalleryMotionClass = (index: number) => {
    if (!imageMotion.enabled) return "hover:scale-105 transition-transform duration-500";
    switch (imageMotion.galleryHover) {
      case "hover-zoom-glow":
        return "motion-gallery-zoom-glow";
      case "hover-tilt-3d":
        return "motion-gallery-tilt";
      case "kenburns-card":
        return index % 2 === 0 ? "motion-gallery-kenburns-odd" : "motion-gallery-kenburns-even";
      case "shimmer-shine":
        return "image-shimmer-effect group-hover:scale-105 transition-transform duration-500";
      case "floating-soft":
        return index % 2 === 0 ? "motion-gallery-float-odd" : "motion-gallery-float-even";
      default:
        return "motion-gallery-zoom-glow";
    }
  };

  // Helper for adding milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !newMilestoneYear.trim()) return;

    const newMilestone: LoveStoryItem = {
      id: crypto.randomUUID(),
      year: newMilestoneYear,
      title: newMilestoneTitle,
      description: newMilestoneDesc,
      imageUrl:
        newMilestoneImg ||
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    };

    const updated = {
      ...config,
      story: {
        ...config.story,
        milestones: [...config.story.milestones, newMilestone],
      },
    };
    setConfig(updated);
    WeddingStore.saveWebsiteConfig(updated);

    setNewMilestoneTitle("");
    setNewMilestoneYear("");
    setNewMilestoneDesc("");
    setNewMilestoneImg("");
    setIsAddMilestoneOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    const updated = {
      ...config,
      story: {
        ...config.story,
        milestones: config.story.milestones.filter((m) => m.id !== id),
      },
    };
    setConfig(updated);
    WeddingStore.saveWebsiteConfig(updated);
  };

  // Helper for Gallery in Website
  const handleAddGalleryPhoto = (url: string) => {
    const updated = {
      ...config,
      gallery: {
        ...config.gallery,
        photos: [
          ...config.gallery.photos,
          { id: crypto.randomUUID(), url, caption: "Ảnh kỷ niệm ngày cưới" },
        ],
      },
    };
    setConfig(updated);
    WeddingStore.saveWebsiteConfig(updated);
  };

  const handleDeleteGalleryPhoto = (id: string) => {
    const updated = {
      ...config,
      gallery: {
        ...config.gallery,
        photos: config.gallery.photos.filter((p) => p.id !== id),
      },
    };
    setConfig(updated);
    WeddingStore.saveWebsiteConfig(updated);
  };

  if (!wedding) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Studio Command Center */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-white via-[#FFFDF9] to-[#FAF6F0] p-5 sm:p-6 border border-[#EADBCE] shadow-card dark:from-[#1C1716] dark:via-[#221C1B] dark:to-[#181413] dark:border-[#3A302E]">
        {/* Soft Golden Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-96 h-48 bg-gradient-to-bl from-[#D6BE91]/25 via-[#B89E6C]/10 to-transparent pointer-events-none blur-3xl rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-64 h-32 bg-gradient-to-tr from-[#8B5E5A]/10 to-transparent pointer-events-none blur-2xl rounded-full" />

        <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          {/* Brand & Crest */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#D6BE91] via-[#C9B07F] to-[#B89E6C] text-white shadow-md shadow-[#D6BE91]/30 ring-4 ring-[#D6BE91]/20">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2C2422] dark:text-[#F5EFE7]">
                    Wedding Website Studio
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang hoạt động (Live)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5E5B] dark:text-[#A69591] mt-0.5">
                  <span>Trình thiết kế trực quan thời gian thực</span>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-[#8B5E5A] dark:text-[#D6BE91] font-semibold bg-[#F5EFE7] dark:bg-[#2A2321] px-2 py-0.5 rounded-md">
                    /w/{wedding.slug}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Device Switcher Pill */}
            <div className="flex items-center bg-[#F5EFE7] rounded-2xl p-1 border border-[#EADBCE] dark:bg-[#2A2321] dark:border-[#3A302E]">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  previewDevice === "desktop"
                    ? "bg-white text-[#2C2422] shadow-sm font-bold dark:bg-[#1C1716] dark:text-[#F5EFE7]"
                    : "text-[#6B5E5B] hover:text-[#2C2422] dark:text-[#A69591]"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Máy tính</span>
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  previewDevice === "mobile"
                    ? "bg-white text-[#2C2422] shadow-sm font-bold dark:bg-[#1C1716] dark:text-[#F5EFE7]"
                    : "text-[#6B5E5B] hover:text-[#2C2422] dark:text-[#A69591]"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Điện thoại</span>
              </button>
            </div>

            {/* Quick QR Code */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQrModalOpen(true)}
              className="bg-white/90 hover:bg-white border-[#EADBCE] text-[#2C2422] shadow-xs dark:bg-[#1C1716] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              title="Quét mã QR để xem ngay trên điện thoại"
            >
              <QrCode className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
              <span className="hidden sm:inline">Quét QR</span>
            </Button>

            {/* Copy Link */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="bg-white/90 hover:bg-white border-[#EADBCE] text-[#2C2422] shadow-xs dark:bg-[#1C1716] dark:border-[#3A302E] dark:text-[#F5EFE7]"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Đã copy link!" : "Copy link"}</span>
            </Button>

            {/* View Live */}
            <Link href={`/w/${wedding.slug}`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white border-[#EADBCE] text-[#2C2422] shadow-xs dark:bg-[#1C1716] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <ExternalLink className="h-4 w-4 text-[#8B5E5A] dark:text-[#D6BE91]" />
                <span className="hidden sm:inline">Xem thực tế</span>
                <span className="sm:hidden">Xem</span>
              </Button>
            </Link>

            {/* Save CTA */}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8B5E5A] via-[#9E6C68] to-[#8B5E5A] shadow-md shadow-[#8B5E5A]/25 hover:shadow-lg hover:shadow-[#8B5E5A]/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Lưu thiết kế</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>✓ Đã lưu toàn bộ thiết kế, bố cục và hiệu ứng vào hệ sinh thái cưới thành công!</span>
          </span>
        </div>
      )}

      {/* 2. Main Studio Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Editor & Customization Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Editor Mode Tabs */}
          <div className="grid grid-cols-4 rounded-2xl bg-white p-1.5 border border-[#EADBCE] shadow-sm dark:bg-[#1C1716] dark:border-[#3A302E]">
            <button
              onClick={() => setActiveTab("sections")}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "sections"
                  ? "bg-gradient-to-r from-[#8B5E5A] to-[#734A46] text-white shadow-sm"
                  : "text-[#6B5E5B] hover:bg-[#F5EFE7] dark:text-[#A69591] dark:hover:bg-[#2A2321]"
              }`}
            >
              <Layout className="h-3.5 w-3.5" />
              <span>Bố cục</span>
            </button>

            <button
              onClick={() => setActiveTab("design")}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "design"
                  ? "bg-gradient-to-r from-[#8B5E5A] to-[#734A46] text-white shadow-sm"
                  : "text-[#6B5E5B] hover:bg-[#F5EFE7] dark:text-[#A69591] dark:hover:bg-[#2A2321]"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Màu & Font</span>
            </button>

            <button
              onClick={() => {
                if (userPlan !== "PRO") {
                  setUpgradeReason(
                    "Bộ hiệu ứng Chuyển động Motion VIP cao cấp là tiện ích độc quyền của Gói Hoàn Mỹ (PRO VIP). Nâng cấp ngay để mở khóa toàn bộ hiệu ứng sinh động!"
                  );
                  setIsUpgradeModalOpen(true);
                  return;
                }
                setActiveTab("motion");
              }}
              className={`relative flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "motion"
                  ? "bg-gradient-to-r from-[#8B5E5A] to-[#734A46] text-white shadow-sm"
                  : "text-[#6B5E5B] hover:bg-[#F5EFE7] dark:text-[#A69591] dark:hover:bg-[#2A2321]"
              }`}
              title={userPlan !== "PRO" ? "Tính năng Motion VIP (Đang bị khóa)" : undefined}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Chuyển động</span>
              {userPlan !== "PRO" ? (
                <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <span className="absolute -top-1 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("content")}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "content"
                  ? "bg-gradient-to-r from-[#8B5E5A] to-[#734A46] text-white shadow-sm"
                  : "text-[#6B5E5B] hover:bg-[#F5EFE7] dark:text-[#A69591] dark:hover:bg-[#2A2321]"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Nội dung</span>
            </button>
          </div>

          {/* TAB 1: SECTIONS & DRAG REORDERING */}
          {activeTab === "sections" && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE] dark:border-[#3A302E]">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                    Sắp xếp thứ tự các khối
                  </h3>
                  <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591]">
                    Dùng nút mũi tên để di chuyển vị trí, bấm con mắt để ẩn/hiện khối
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleResetDefault} title="Đặt lại mẫu chuẩn">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Progress completion bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-[#F5EFE7] border border-[#EADBCE] dark:from-[#221C1B] dark:to-[#181413] dark:border-[#3A302E]">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#2C2422] dark:text-[#F5EFE7] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#8B5E5A]" />
                    <span>Trạng thái hoàn thiện bố cục</span>
                  </span>
                  <span className="text-[#8B5E5A] dark:text-[#D6BE91]">
                    {config.sections.filter((s) => s.enabled).length}/8 Khối đang bật
                  </span>
                </div>
                <div className="w-full bg-[#EADBCE]/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D6BE91] to-[#8B5E5A] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(config.sections.filter((s) => s.enabled).length / 8) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {config.sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      sec.enabled
                        ? "bg-white border-[#EADBCE] shadow-sm hover:border-[#8B5E5A] dark:bg-[#221C1B] dark:border-[#3A302E]"
                        : "bg-[#F5EFE7]/50 border-dashed border-[#D6BE91] opacity-60 dark:bg-[#181413]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-[#A69591] cursor-grab" />
                      <div>
                        <span className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] block">
                          {idx + 1}. {sec.name}
                        </span>
                        <span className="text-[10px] text-[#A69591] uppercase">{sec.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-[#6B5E5B] hover:text-[#8B5E5A] disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển lên trên"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === config.sections.length - 1}
                        className="p-1 text-[#6B5E5B] hover:text-[#8B5E5A] disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển xuống dưới"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleSection(sec.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          sec.enabled
                            ? "text-[#8B5E5A] hover:bg-[#F5EFE7] dark:hover:bg-[#2A2321]"
                            : "text-[#A69591] hover:text-[#2C2422]"
                        }`}
                        title={sec.enabled ? "Đang hiển thị (Bấm để ẩn)" : "Đang ẩn (Bấm để hiện)"}
                      >
                        {sec.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                      {/* Direct Edit Content button */}
                      <button
                        onClick={() => {
                          setSelectedSectionId(sec.id);
                          setActiveTab("content");
                        }}
                        className="ml-1 text-[11px] font-semibold text-[#8B5E5A] hover:underline"
                      >
                        Sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 2: THEME & FONT CUSTOMIZER */}
          {activeTab === "design" && (
            <Card className="p-5 space-y-5">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7] mb-1">
                  Bảng màu chủ đạo (Color Themes)
                </h3>
                <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mb-3">
                  Chọn tông màu phù hợp với phong cách trang trí đám cưới của bạn
                </p>

                <div className="space-y-2.5">
                  {themes.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        const updated = { ...config, theme: t.id as any };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        config.theme === t.id
                          ? "border-[#8B5E5A] bg-[#FFFDF9] ring-2 ring-[#8B5E5A]/20 shadow-md dark:bg-[#221C1B]"
                          : "border-[#EADBCE] bg-white hover:border-[#8B5E5A]/50 dark:bg-[#181413] dark:border-[#3A302E]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl shadow-inner border border-black/10 flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: t.accentColor, color: t.primaryText }}
                        >
                          Aa
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">{t.name}</p>
                          <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591]">{t.subtitle}</p>
                        </div>
                      </div>

                      {config.theme === t.id && (
                        <Badge variant="champagne" className="text-[10px]">
                          Đang dùng
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Font Selector */}
              <div className="pt-4 border-t border-[#EADBCE] dark:border-[#3A302E]">
                <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7] mb-2">
                  Bộ phông chữ tiêu đề (Typography)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "playfair", name: "Playfair", label: "Cổ điển sang trọng" },
                    { id: "cinzel", name: "Cinzel", label: "Hoàng gia uy nghi" },
                    { id: "montserrat", name: "Montserrat", label: "Hiện đại tối giản" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        const updated = { ...config, fontFamily: f.id as any };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        config.fontFamily === f.id
                          ? "border-[#8B5E5A] bg-[#F5EFE7] font-bold text-[#8B5E5A] dark:bg-[#2A2321]"
                          : "border-[#EADBCE] bg-white text-[#6B5E5B] hover:bg-[#FAF6F0] dark:bg-[#181413] dark:border-[#3A302E]"
                      }`}
                    >
                      <p className="text-sm font-serif">{f.name}</p>
                      <p className="text-[10px] text-[#A69591] mt-0.5">{f.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion link shortcut banner */}
              <div className="pt-3 border-t border-[#EADBCE] dark:border-[#3A302E]">
                <button
                  type="button"
                  onClick={() => setActiveTab("motion")}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-[#F5EFE7] to-[#FFFDF9] border border-[#D6BE91]/50 flex items-center justify-between text-left hover:border-[#8B5E5A] transition-all group dark:from-[#2A2321] dark:to-[#1C1716]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#8B5E5A] text-white shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] flex items-center gap-1.5">
                        <span>Hiệu ứng chuyển động ảnh</span>
                        <Badge variant="champagne" className="text-[9px] px-1.5 py-0">MỚI</Badge>
                      </p>
                      <p className="text-[10px] text-[#6B5E5B] dark:text-[#A69591]">
                        Ken Burns, lướt sáng kim cương, vòng hào quang ảnh cưới
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#8B5E5A] group-hover:translate-x-1 transition-transform">
                    Tùy chỉnh →
                  </span>
                </button>
              </div>
            </Card>
          )}

          {/* TAB: IMAGE MOTION & ANIMATION STUDIO */}
          {activeTab === "motion" && (
            <Card className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Header & Master Toggle */}
              <div className="flex items-start justify-between pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                      Hiệu ứng chuyển động ảnh (Image Motion)
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1">
                    Công nghệ chuyển động điện ảnh mượt mà 60 FPS, thổi hồn vào album cưới
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={imageMotion.enabled}
                      onChange={(e) => updateImageMotion({ enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B5E5A]"></div>
                  </label>
                </div>
              </div>

              {!imageMotion.enabled && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300 flex items-center justify-between">
                  <span>Toàn bộ hiệu ứng chuyển động ảnh đang tắt. Bật công tắc phía trên để kích hoạt.</span>
                  <button
                    onClick={() => updateImageMotion({ enabled: true })}
                    className="ml-2 font-bold underline shrink-0 hover:text-amber-900"
                  >
                    Bật ngay
                  </button>
                </div>
              )}

              {/* 1-Click Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] flex items-center gap-1.5">
                    <Wand2 className="h-3.5 w-3.5 text-[#8B5E5A]" />
                    <span>Bộ mẫu chuyển động 1-Chạm (Presets)</span>
                  </h4>
                  <span className="text-[10px] text-[#A69591]">Chọn nhanh phong cách</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {motionPresets.map((preset) => {
                    const isSelected =
                      imageMotion.enabled &&
                      imageMotion.heroEffect === preset.config.heroEffect &&
                      imageMotion.galleryHover === preset.config.galleryHover &&
                      imageMotion.coupleEffect === preset.config.coupleEffect &&
                      imageMotion.speed === preset.config.speed;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => updateImageMotion(preset.config)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? "border-[#8B5E5A] bg-[#FFFDF9] ring-2 ring-[#8B5E5A]/25 shadow-sm dark:bg-[#221C1B]"
                            : "border-[#EADBCE] bg-white hover:border-[#8B5E5A]/50 dark:bg-[#181413] dark:border-[#3A302E]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{preset.icon}</span>
                          <span className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] truncate">
                            {preset.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6B5E5B] dark:text-[#A69591] line-clamp-2 leading-tight">
                          {preset.subtitle}
                        </p>
                        {isSelected && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-[#8B5E5A] bg-[#F5EFE7] px-1.5 py-0.5 rounded-full dark:bg-[#2A2321]">
                            ✓ Đang kích hoạt
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Settings */}
              <div className="space-y-4 pt-3 border-t border-[#EADBCE] dark:border-[#3A302E]">
                {/* 1. Hero Cover Effect */}
                <div>
                  <label className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                    1. Hiệu ứng Ảnh bìa chính (Hero Banner Motion)
                  </label>
                  <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mb-2">
                    Kiểu chuyển động của ảnh nền tiêu đề đón khách
                  </p>

                  <div className="space-y-1.5">
                    {[
                      {
                        id: "kenburns",
                        name: "Ken Burns Hollywood",
                        desc: "Thu phóng chậm rãi & di chuyển góc nhìn điện ảnh sang trọng",
                        tag: "Sang trọng nhất",
                      },
                      {
                        id: "pan-horizontal",
                        name: "Lướt ngang toàn cảnh (Panoramic Pan)",
                        desc: "Quét góc máy ngang êm dịu, thấy rõ toàn bộ không gian ảnh cưới",
                        tag: "Toàn cảnh",
                      },
                      {
                        id: "pulse-zoom",
                        name: "Nhịp thở tình yêu (Breathing Pulse)",
                        desc: "Co giãn nhẹ nhàng theo nhịp tim, tạo cảm xúc ấm áp",
                        tag: "Êm ái",
                      },
                      {
                        id: "float-tilt",
                        name: "Nghiêng 3D & Lơ lửng (Floating 3D)",
                        desc: "Chuyển động đa trục nhẹ, tạo chiều sâu thị giác đa tầng",
                        tag: "Hiện đại",
                      },
                      {
                        id: "none",
                        name: "Ảnh tĩnh cố định",
                        desc: "Không chuyển động ảnh bìa chính",
                        tag: "Tĩnh",
                      },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => updateImageMotion({ heroEffect: opt.id as any })}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          imageMotion.heroEffect === opt.id
                            ? "border-[#8B5E5A] bg-[#FFFDF9] ring-1 ring-[#8B5E5A] dark:bg-[#221C1B]"
                            : "border-[#EADBCE] bg-white hover:border-[#8B5E5A]/50 dark:bg-[#181413] dark:border-[#3A302E]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">{opt.name}</p>
                          <p className="text-[10px] text-[#6B5E5B] dark:text-[#A69591]">{opt.desc}</p>
                        </div>
                        <Badge variant={imageMotion.heroEffect === opt.id ? "champagne" : "default"} className="text-[9px] shrink-0 ml-2">
                          {opt.tag}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Gallery Photos Effect */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                    2. Hiệu ứng Album ảnh cưới & Kỷ niệm (Gallery Effects)
                  </label>
                  <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mb-2">
                    Cách các bức ảnh tương tác khi rê chuột hoặc tự động chuyển động
                  </p>

                  <div className="space-y-1.5">
                    {[
                      {
                        id: "hover-zoom-glow",
                        name: "Phóng to & Ánh hào quang vàng (Zoom & Glow)",
                        desc: "Zoom 1.05x, viền sáng vàng champagne và đổ bóng sâu",
                        tag: "Hoàng gia",
                      },
                      {
                        id: "hover-tilt-3d",
                        name: "Nghiêng 3D Parallax (3D Perspective Tilt)",
                        desc: "Nổi khối 3D theo góc nhìn như bức tranh trưng bày bảo tàng",
                        tag: "3D Art",
                      },
                      {
                        id: "kenburns-card",
                        name: "Ken Burns tự động trong từng ảnh album",
                        desc: "Mỗi ảnh tự động chuyển động zoom chậm rãi xen kẽ liên tục",
                        tag: "Tự động chạy",
                      },
                      {
                        id: "shimmer-shine",
                        name: "Lướt tia sáng kim cương (Diamond Shimmer)",
                        desc: "Tia sáng quét qua lấp lánh như viên kim cương khi rê chuột",
                        tag: "Lấp lánh",
                      },
                      {
                        id: "floating-soft",
                        name: "Bồng bềnh lượn sóng (Floating Wave)",
                        desc: "Các bức ảnh nhấp nhô nhịp nhàng tự nhiên trên trang",
                        tag: "Thơ mộng",
                      },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => updateImageMotion({ galleryHover: opt.id as any })}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          imageMotion.galleryHover === opt.id
                            ? "border-[#8B5E5A] bg-[#FFFDF9] ring-1 ring-[#8B5E5A] dark:bg-[#221C1B]"
                            : "border-[#EADBCE] bg-white hover:border-[#8B5E5A]/50 dark:bg-[#181413] dark:border-[#3A302E]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">{opt.name}</p>
                          <p className="text-[10px] text-[#6B5E5B] dark:text-[#A69591]">{opt.desc}</p>
                        </div>
                        <Badge variant={imageMotion.galleryHover === opt.id ? "champagne" : "default"} className="text-[9px] shrink-0 ml-2">
                          {opt.tag}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Couple Avatar Effect */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                    3. Hiệu ứng Ảnh Cô dâu & Chú rể (Couple Profile Avatars)
                  </label>
                  <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mb-2">
                    Hiệu ứng hào quang xung quanh ảnh đại diện hai nhân vật chính
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "pulse-ring", name: "Vòng sóng hào quang", desc: "Sóng ánh sáng vàng tỏa lan tỏa" },
                      { id: "floating", name: "Bồng bềnh lơ lửng", desc: "Nâng hạ nhẹ nhàng êm ái" },
                      { id: "glow-rotate", name: "Tỏa sáng kim tuyến", desc: "Ánh sáng vàng dịu bao bọc" },
                      { id: "soft-zoom", name: "Phóng to êm dịu", desc: "Zoom mềm mại khi rê chuột" },
                      { id: "classic", name: "Cổ điển tĩnh", desc: "Viền tròn truyền thống" },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => updateImageMotion({ coupleEffect: opt.id as any })}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          imageMotion.coupleEffect === opt.id
                            ? "border-[#8B5E5A] bg-[#FFFDF9] ring-1 ring-[#8B5E5A] dark:bg-[#221C1B]"
                            : "border-[#EADBCE] bg-white hover:border-[#8B5E5A]/50 dark:bg-[#181413] dark:border-[#3A302E]"
                        }`}
                      >
                        <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">{opt.name}</p>
                        <p className="text-[10px] text-[#6B5E5B] dark:text-[#A69591] mt-0.5">{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Motion Speed */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                    4. Tốc độ chuyển động (Animation Speed)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "slow", name: "Chậm quý phái", time: "18s - 22s", desc: "Êm ái, sang trọng" },
                      { id: "normal", name: "Tiêu chuẩn điện ảnh", time: "10s - 12s", desc: "Cân bằng, hoàn hảo" },
                      { id: "dynamic", name: "Năng động tươi trẻ", time: "5s - 6s", desc: "Bắt mắt, ấn tượng" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => updateImageMotion({ speed: s.id as any })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          imageMotion.speed === s.id
                            ? "border-[#8B5E5A] bg-[#F5EFE7] font-bold text-[#8B5E5A] dark:bg-[#2A2321]"
                            : "border-[#EADBCE] bg-white text-[#6B5E5B] hover:bg-[#FAF6F0] dark:bg-[#181413] dark:border-[#3A302E]"
                        }`}
                      >
                        <p className="text-xs">{s.name}</p>
                        <p className="text-[10px] opacity-75 mt-0.5">{s.time}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Mini Preview Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-[#F5EFE7] border border-[#D6BE91]/50 space-y-3 dark:from-[#221C1B] dark:to-[#181413]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8B5E5A] flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Thử nghiệm nhanh hiệu ứng ngay tại đây:</span>
                    </span>
                    <span className="text-[10px] text-[#6B5E5B] dark:text-[#A69591] italic">
                      Rê chuột để thử
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    {/* Mini Hero Cover */}
                    <div className="relative h-16 rounded-xl overflow-hidden border border-[#EADBCE] shadow-inner text-center flex items-center justify-center">
                      <div
                        className={`absolute inset-0 bg-cover bg-center ${getHeroMotionClass()}`}
                        style={{ backgroundImage: `url(${config.hero.coverImageUrl})` }}
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <span className="relative z-10 text-[9px] font-bold text-white uppercase px-1">
                        Hero Motion
                      </span>
                    </div>

                    {/* Mini Couple Avatar */}
                    <div className="text-center">
                      <div className={`h-12 w-12 rounded-full overflow-hidden mx-auto border-2 border-[#D6BE91] shadow-sm relative ${getCoupleMotionClass("bride")}`}>
                        <img src={config.couple.bridePhotoUrl} alt="Demo" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-[9px] text-[#6B5E5B] font-semibold mt-1 block">Avatar</span>
                    </div>

                    {/* Mini Gallery Card */}
                    <div className={`rounded-xl overflow-hidden aspect-square border border-[#EADBCE] group relative ${getGalleryMotionClass(0)}`}>
                      <img
                        src={config.gallery.photos[0]?.url || config.hero.coverImageUrl}
                        alt="Demo Gallery"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] text-white font-bold">Album Hover</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#6B5E5B] dark:text-[#A69591] text-center">
                    👉 Khung xem trước bên phải màn hình đang cập nhật chuyển động thực tế tương ứng!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: CONTENT BLOCKS EDITOR */}
          {activeTab === "content" && (
            <Card className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
                <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                  Chỉnh sửa chi tiết nội dung
                </h3>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="rounded-xl border border-[#EADBCE] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#8B5E5A] dark:bg-[#221C1B] dark:border-[#3A302E]"
                >
                  <option value="hero">Ảnh bìa & Tiêu đề (Hero)</option>
                  <option value="couple">Cô dâu & Chú rể</option>
                  <option value="story">Câu chuyện tình yêu (Milestones)</option>
                  <option value="events">Lịch trình hôn lễ</option>
                  <option value="gallery">Album ảnh kỷ niệm</option>
                  <option value="guestbook">Sổ ký tên lưu bút</option>
                  <option value="gift">Mừng cưới & QR Bank</option>
                  <option value="footer">Lời cảm ơn & Chân trang</option>
                </select>
              </div>

              {/* 1. HERO EDITOR */}
              {selectedSectionId === "hero" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                      Tiêu đề chính trên ảnh bìa
                    </label>
                    <Input
                      value={config.hero.title}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          hero: { ...config.hero, title: e.target.value },
                        };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                      Lời đề từ / Lời mời
                    </label>
                    <textarea
                      value={config.hero.subTitle}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          hero: { ...config.hero, subTitle: e.target.value },
                        };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                      rows={3}
                      className="w-full rounded-xl border border-[#EADBCE] bg-white p-2.5 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
                    />
                  </div>

                  {/* Hero Cover Photo Replacement */}
                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                      Ảnh bìa chính (Cover Photo)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#8B5E5A] bg-[#FFFDF9] hover:bg-[#F5EFE7] dark:bg-[#221C1B] dark:border-[#3A302E]">
                        <UploadCloud className="h-4 w-4" />
                        <span>Tải ảnh bìa từ máy tính</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            handleGenericFileUpload(e, (dataUrl) => {
                              const updated = {
                                ...config,
                                hero: { ...config.hero, coverImageUrl: dataUrl },
                              };
                              setConfig(updated);
                              WeddingStore.saveWebsiteConfig(updated);
                            })
                          }
                        />
                      </label>
                      <span className="text-[11px] text-[#A69591]">JPG, PNG, WebP (tối đa 5MB)</span>
                    </div>

                    <div className="mt-2 relative rounded-xl overflow-hidden border border-[#EADBCE] h-32 bg-neutral-100">
                      <img
                        src={config.hero.coverImageUrl}
                        alt="Hero Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                      Bật đồng hồ đếm ngược
                    </span>
                    <input
                      type="checkbox"
                      checked={config.hero.showCountdown}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          hero: { ...config.hero, showCountdown: e.target.checked },
                        };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                      className="h-4 w-4 rounded accent-[#8B5E5A]"
                    />
                  </div>
                </div>
              )}

              {/* 2. COUPLE PROFILES EDITOR */}
              {selectedSectionId === "couple" && (
                <div className="space-y-5">
                  {/* Bride */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADBCE] space-y-3 dark:bg-[#181413] dark:border-[#3A302E]">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden border border-[#D6BE91] relative shrink-0">
                        <img
                          src={config.couple.bridePhotoUrl}
                          alt="Bride"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5E5A] hover:underline">
                          <UploadCloud className="h-3.5 w-3.5" />
                          <span>Tải ảnh Cô dâu từ máy</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) =>
                              handleGenericFileUpload(e, (dataUrl) => {
                                const updated = {
                                  ...config,
                                  couple: { ...config.couple, bridePhotoUrl: dataUrl },
                                };
                                setConfig(updated);
                                WeddingStore.saveWebsiteConfig(updated);
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-[#6B5E5B] dark:text-[#A69591]">
                          Tên Cô dâu
                        </label>
                        <Input
                          value={config.couple.brideName}
                          onChange={(e) => {
                            const updated = {
                              ...config,
                              couple: { ...config.couple, brideName: e.target.value },
                            };
                            setConfig(updated);
                            WeddingStore.saveWebsiteConfig(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#6B5E5B] dark:text-[#A69591]">
                          Danh xưng
                        </label>
                        <Input
                          value={config.couple.brideTitle}
                          onChange={(e) => {
                            const updated = {
                              ...config,
                              couple: { ...config.couple, brideTitle: e.target.value },
                            };
                            setConfig(updated);
                            WeddingStore.saveWebsiteConfig(updated);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#6B5E5B] dark:text-[#A69591]">
                        Lời tự bạch ngắn của Cô dâu
                      </label>
                      <textarea
                        value={config.couple.brideBio}
                        onChange={(e) => {
                          const updated = {
                            ...config,
                            couple: { ...config.couple, brideBio: e.target.value },
                          };
                          setConfig(updated);
                          WeddingStore.saveWebsiteConfig(updated);
                        }}
                        rows={2}
                        className="w-full rounded-xl border border-[#EADBCE] bg-white p-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
                      />
                    </div>
                  </div>

                  {/* Groom */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADBCE] space-y-3 dark:bg-[#181413] dark:border-[#3A302E]">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden border border-[#D6BE91] relative shrink-0">
                        <img
                          src={config.couple.groomPhotoUrl}
                          alt="Groom"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5E5A] hover:underline">
                          <UploadCloud className="h-3.5 w-3.5" />
                          <span>Tải ảnh Chú rể từ máy</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) =>
                              handleGenericFileUpload(e, (dataUrl) => {
                                const updated = {
                                  ...config,
                                  couple: { ...config.couple, groomPhotoUrl: dataUrl },
                                };
                                setConfig(updated);
                                WeddingStore.saveWebsiteConfig(updated);
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-[#6B5E5B] dark:text-[#A69591]">
                          Tên Chú rể
                        </label>
                        <Input
                          value={config.couple.groomName}
                          onChange={(e) => {
                            const updated = {
                              ...config,
                              couple: { ...config.couple, groomName: e.target.value },
                            };
                            setConfig(updated);
                            WeddingStore.saveWebsiteConfig(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#6B5E5B] dark:text-[#A69591]">
                          Danh xưng
                        </label>
                        <Input
                          value={config.couple.groomTitle}
                          onChange={(e) => {
                            const updated = {
                              ...config,
                              couple: { ...config.couple, groomTitle: e.target.value },
                            };
                            setConfig(updated);
                            WeddingStore.saveWebsiteConfig(updated);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#6B5E5B] dark:text-[#A69591]">
                        Lời tự bạch ngắn của Chú rể
                      </label>
                      <textarea
                        value={config.couple.groomBio}
                        onChange={(e) => {
                          const updated = {
                            ...config,
                            couple: { ...config.couple, groomBio: e.target.value },
                          };
                          setConfig(updated);
                          WeddingStore.saveWebsiteConfig(updated);
                        }}
                        rows={2}
                        className="w-full rounded-xl border border-[#EADBCE] bg-white p-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. LOVE STORY MILESTONES */}
              {selectedSectionId === "story" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                      Các mốc kỷ niệm ({config.story.milestones.length})
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setIsAddMilestoneOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Thêm mốc mới</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {config.story.milestones.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#EADBCE] space-y-2 dark:bg-[#181413] dark:border-[#3A302E]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {m.imageUrl && (
                              <img
                                src={m.imageUrl}
                                alt={m.title}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <span className="text-[10px] font-bold text-[#8B5E5A] uppercase">{m.year}</span>
                              <h4 className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">{m.title}</h4>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteMilestone(m.id)}
                            className="text-[#A69591] hover:text-[#B44A4A] p-1"
                            title="Xoá mốc này"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] italic">{m.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. EVENTS & LOCATIONS */}
              {selectedSectionId === "events" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                      Quy định trang phục (Dresscode gợi ý)
                    </label>
                    <Input
                      value={config.events.dresscode}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          events: { ...config.events, dresscode: e.target.value },
                        };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5EFE7] dark:bg-[#2A2321] text-xs text-[#6B5E5B] dark:text-[#A69591]">
                    Lịch trình chi tiết các nghi lễ được tự động lấy từ danh sách sự kiện bên mục <b>Timeline & Lịch trình</b> để đồng bộ thống nhất!
                  </div>
                </div>
              )}

              {/* 5. GALLERY SHOWCASE */}
              {selectedSectionId === "gallery" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                        Ảnh trưng bày trên website ({config.gallery.photos.length})
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EADBCE] bg-[#8B5E5A] text-white text-xs font-semibold hover:bg-[#6e4946]">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tải thêm ảnh từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleGenericFileUpload(e, handleAddGalleryPhoto)}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {config.gallery.photos.map((p) => (
                      <div key={p.id} className="relative rounded-xl overflow-hidden aspect-square group border border-[#EADBCE]">
                        <img src={p.url} alt="Photo" className="h-full w-full object-cover" />
                        <button
                          onClick={() => handleDeleteGalleryPhoto(p.id)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xoá ảnh này"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. GIFT REGISTRY & BANK QR */}
              {selectedSectionId === "gift" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                      Bật khối Hộp mừng cưới online
                    </span>
                    <input
                      type="checkbox"
                      checked={config.gift.enabled}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          gift: { ...config.gift, enabled: e.target.checked },
                        };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                      className="h-4 w-4 rounded accent-[#8B5E5A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                      Tên Ngân hàng
                    </label>
                    <Input
                      value={config.gift.bankName}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          gift: { ...config.gift, bankName: e.target.value },
                        };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                        Số tài khoản
                      </label>
                      <Input
                        value={config.gift.accountNumber}
                        onChange={(e) => {
                          const updated = {
                            ...config,
                            gift: { ...config.gift, accountNumber: e.target.value },
                          };
                          setConfig(updated);
                          WeddingStore.saveWebsiteConfig(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                        Chủ tài khoản
                      </label>
                      <Input
                        value={config.gift.accountHolder}
                        onChange={(e) => {
                          const updated = {
                            ...config,
                            gift: { ...config.gift, accountHolder: e.target.value },
                          };
                          setConfig(updated);
                          WeddingStore.saveWebsiteConfig(updated);
                        }}
                      />
                    </div>
                  </div>

                  {/* QR Code Upload */}
                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                      Ảnh mã QR thanh toán (QR Code Image)
                    </label>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#8B5E5A] bg-[#FFFDF9] hover:bg-[#F5EFE7] dark:bg-[#221C1B] dark:border-[#3A302E]">
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Tải ảnh mã QR từ máy tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          handleGenericFileUpload(e, (dataUrl) => {
                            const updated = {
                              ...config,
                              gift: { ...config.gift, qrCodeUrl: dataUrl },
                            };
                            setConfig(updated);
                            WeddingStore.saveWebsiteConfig(updated);
                          })
                        }
                      />
                    </label>
                    {config.gift.qrCodeUrl && (
                      <div className="mt-2 h-28 w-28 rounded-xl overflow-hidden border border-[#EADBCE]">
                        <img src={config.gift.qrCodeUrl} alt="QR Code" className="h-full w-full object-contain bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 7. FOOTER */}
              {selectedSectionId === "footer" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                      Lời cảm ơn chân thành
                    </label>
                    <textarea
                      value={config.footer.quote}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          footer: { ...config.footer, quote: e.target.value },
                        };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                      rows={3}
                      className="w-full rounded-xl border border-[#EADBCE] bg-white p-2.5 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                      Hashtag đám cưới
                    </label>
                    <Input
                      value={config.footer.hashtag}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          footer: { ...config.footer, hashtag: e.target.value },
                        };
                        setConfig(updated);
                        WeddingStore.saveWebsiteConfig(updated);
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* RIGHT PANEL: Luxury Live Interactive Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Stage Top Bar / Inspector Controls */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] flex items-center gap-1.5">
                <span>Sân khấu trực quan</span>
                <span className="text-[10px] text-[#A69591] font-normal hidden sm:inline">(Live Studio Stage)</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Scale Selector */}
              <div className="flex items-center bg-white rounded-xl p-0.5 border border-[#EADBCE] text-[11px] font-semibold dark:bg-[#1C1716] dark:border-[#3A302E]">
                {[
                  { label: "100%", val: 100 },
                  { label: "90%", val: 90 },
                  { label: "80%", val: 80 },
                ].map((z) => (
                  <button
                    key={z.val}
                    type="button"
                    onClick={() => setZoomScale(z.val)}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      zoomScale === z.val
                        ? "bg-[#8B5E5A] text-white shadow-xs font-bold"
                        : "text-[#6B5E5B] hover:text-[#2C2422] dark:text-[#A69591]"
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>

              {/* Refresh Animation Key */}
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="p-1.5 rounded-xl bg-white border border-[#EADBCE] text-[#6B5E5B] hover:text-[#8B5E5A] hover:border-[#8B5E5A] shadow-xs transition-all dark:bg-[#1C1716] dark:border-[#3A302E]"
                title="Làm mới lại chuyển động ảnh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Luxury Studio Canvas Stage */}
          <div className="w-full p-4 sm:p-7 rounded-[32px] studio-canvas-backdrop border border-[#EADBCE] shadow-card flex items-center justify-center min-h-[84vh] overflow-hidden">
            <div
              key={previewKey}
              style={{
                transform: `scale(${zoomScale / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.25s ease-out",
              }}
              className="w-full flex justify-center"
            >
              {previewDevice === "desktop" ? (
                /* Desktop Macbook Pro Safari Frame */
                <div className="w-full max-w-[820px] rounded-[24px] overflow-hidden macbook-chassis-frame bg-white dark:bg-[#1C1716] transition-all">
                  {/* Safari Window Header Bar */}
                  <div className="bg-[#FAF6F0] border-b border-[#EADBCE] px-4 py-2.5 flex items-center justify-between dark:bg-[#221C1B] dark:border-[#3A302E]">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-1.5 w-16">
                      <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 inline-block shadow-xs" />
                      <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 inline-block shadow-xs" />
                      <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 inline-block shadow-xs" />
                    </div>

                    {/* Simulated URL bar */}
                    <div className="flex-1 max-w-md mx-auto">
                      <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-white/95 rounded-lg border border-[#EADBCE] text-[11px] text-[#6B5E5B] shadow-inner font-mono dark:bg-[#181413] dark:border-[#3A302E] dark:text-[#A69591]">
                        <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">https://wedding.pro/w/{wedding.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 w-16 text-[#A69591]">
                      <Link href={`/w/${wedding.slug}`} target="_blank" title="Mở trang trong tab mới">
                        <ExternalLink className="h-3.5 w-3.5 hover:text-[#8B5E5A]" />
                      </Link>
                    </div>
                  </div>

                  {/* Webpage Content Viewport */}
                  <div className={`overflow-y-auto max-h-[76vh] ${currentTheme.bgClass} text-[#2C2422] motion-speed-${imageMotion.speed || "normal"}`}>
                    {config.sections
                      .filter((s) => s.enabled)
                      .sort((a, b) => a.order - b.order)
                      .map((sec) => {
                        if (sec.id === "hero") {
                          return (
                            <div
                              key="hero"
                              className={`relative min-h-[460px] flex items-center justify-center text-center p-6 bg-gradient-to-b ${currentTheme.heroGradient} text-white overflow-hidden`}
                            >
                              <div
                                className={`absolute inset-0 bg-cover bg-center opacity-30 ${getHeroMotionClass()}`}
                                style={{ backgroundImage: `url(${config.hero.coverImageUrl})` }}
                              />
                              <div className="relative z-10 space-y-4 max-w-md mx-auto">
                                <Badge variant="champagne" className="text-[10px] uppercase tracking-widest font-semibold">
                                  {config.hero.title}
                                </Badge>
                                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                                  {config.couple.brideName}
                                  <span className="block text-xl font-serif my-1" style={{ color: currentTheme.accentColor }}>
                                    &
                                  </span>
                                  {config.couple.groomName}
                                </h2>
                                <p className="text-xs text-white/85 italic font-light px-4">
                                  &ldquo;{config.hero.subTitle}&rdquo;
                                </p>

                                {config.hero.showCountdown && (
                                  <div className="flex items-center justify-center gap-2 bg-white/10 p-2.5 rounded-2xl backdrop-blur-md max-w-xs mx-auto border border-white/20 shadow-md">
                                    <div className="text-center px-2">
                                      <span className="font-serif text-lg font-bold" style={{ color: currentTheme.accentColor }}>220</span>
                                      <p className="text-[8px] uppercase tracking-wider text-white/70">Ngày</p>
                                    </div>
                                    <span>:</span>
                                    <div className="text-center px-2">
                                      <span className="font-serif text-lg font-bold">14</span>
                                      <p className="text-[8px] uppercase tracking-wider text-white/70">Giờ</p>
                                    </div>
                                    <span>:</span>
                                    <div className="text-center px-2">
                                      <span className="font-serif text-lg font-bold">35</span>
                                      <p className="text-[8px] uppercase tracking-wider text-white/70">Phút</p>
                                    </div>
                                  </div>
                                )}

                                <div className="text-[11px] text-white/90 pt-1 flex items-center justify-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" style={{ color: currentTheme.accentColor }} />
                                  <span>{wedding.wedding_date} • {wedding.venue}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (sec.id === "couple") {
                          return (
                            <div key="couple" className="py-12 px-6 text-center space-y-6">
                              <div>
                                <Badge variant="default" className="text-[10px] mb-1">
                                  {config.couple.title}
                                </Badge>
                                <p className="text-xs text-[#6B5E5B] italic">{config.couple.description}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                {/* Bride Card */}
                                <div className="p-4 rounded-2xl bg-white/80 border border-[#EADBCE] shadow-sm text-center space-y-2">
                                  <div className={`h-20 w-20 rounded-full overflow-hidden mx-auto border-2 border-[#D6BE91] shadow-sm relative ${getCoupleMotionClass("bride")}`}>
                                    <img src={config.couple.bridePhotoUrl} alt="Bride" className="h-full w-full object-cover" />
                                  </div>
                                  <h4 className="font-serif text-sm font-bold text-[#2C2422]">{config.couple.brideName}</h4>
                                  <span className="text-[10px] text-[#8B5E5A] font-semibold block">{config.couple.brideTitle}</span>
                                  <p className="text-[10px] text-[#6B5E5B] line-clamp-3 leading-relaxed">{config.couple.brideBio}</p>
                                </div>

                                {/* Groom Card */}
                                <div className="p-4 rounded-2xl bg-white/80 border border-[#EADBCE] shadow-sm text-center space-y-2">
                                  <div className={`h-20 w-20 rounded-full overflow-hidden mx-auto border-2 border-[#D6BE91] shadow-sm relative ${getCoupleMotionClass("groom")}`}>
                                    <img src={config.couple.groomPhotoUrl} alt="Groom" className="h-full w-full object-cover" />
                                  </div>
                                  <h4 className="font-serif text-sm font-bold text-[#2C2422]">{config.couple.groomName}</h4>
                                  <span className="text-[10px] text-[#8B5E5A] font-semibold block">{config.couple.groomTitle}</span>
                                  <p className="text-[10px] text-[#6B5E5B] line-clamp-3 leading-relaxed">{config.couple.groomBio}</p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (sec.id === "story") {
                          return (
                            <div key="story" className="py-12 px-6 bg-white/60 space-y-6 text-center">
                              <div>
                                <Heart className="h-6 w-6 text-[#8B5E5A] fill-current mx-auto mb-2" />
                                <h3 className="font-serif text-xl font-bold">{config.story.title}</h3>
                                <p className="text-[11px] text-[#6B5E5B] mt-1">{config.story.description}</p>
                              </div>

                              <div className="space-y-4 max-w-sm mx-auto text-left">
                                {config.story.milestones.map((m) => (
                                  <div key={m.id} className="p-3.5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm flex gap-3 group">
                                    {m.imageUrl && (
                                      <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 shadow-xs">
                                        <img
                                          src={m.imageUrl}
                                          alt={m.title}
                                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                      </div>
                                    )}
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] font-bold text-[#8B5E5A] uppercase">{m.year}</span>
                                      <h5 className="font-serif text-xs font-bold text-[#2C2422]">{m.title}</h5>
                                      <p className="text-[10px] text-[#6B5E5B] leading-relaxed line-clamp-2">{m.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (sec.id === "events") {
                          return (
                            <div key="events" className="py-12 px-6 space-y-4 text-center">
                              <Clock className="h-6 w-6 text-[#8B5E5A] mx-auto" />
                              <h3 className="font-serif text-xl font-bold">{config.events.title}</h3>
                              <p className="text-[11px] text-[#6B5E5B]">{config.events.dresscode}</p>

                              <div className="space-y-2 max-w-sm mx-auto text-left">
                                <div className="p-3 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-between">
                                  <div>
                                    <Badge variant="champagne" className="text-[9px]">09:00</Badge>
                                    <h5 className="text-xs font-bold mt-1">Lễ Gia Tiên & Rước Dâu</h5>
                                    <p className="text-[10px] text-[#A69591]">Tư gia hai họ</p>
                                  </div>
                                </div>
                                <div className="p-3 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-between">
                                  <div>
                                    <Badge variant="champagne" className="text-[9px]">18:00</Badge>
                                    <h5 className="text-xs font-bold mt-1">Tiệc Cưới & Khiêu vũ First Dance</h5>
                                    <p className="text-[10px] text-[#A69591]">Khoảnh khắc ngọt ngào</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (sec.id === "gallery") {
                          return (
                            <div key="gallery" className="py-12 px-6 bg-white/60 space-y-4 text-center">
                              <ImageIcon className="h-6 w-6 text-[#8B5E5A] mx-auto" />
                              <h3 className="font-serif text-xl font-bold">{config.gallery.title}</h3>
                              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2">
                                {config.gallery.photos.slice(0, 6).map((p, idx) => (
                                  <div
                                    key={p.id}
                                    className={`rounded-xl overflow-hidden aspect-square border border-[#EADBCE] group relative ${getGalleryMotionClass(idx)}`}
                                  >
                                    <img
                                      src={p.url}
                                      alt="Gallery"
                                      className={`h-full w-full object-cover transition-transform duration-500 ${
                                        imageMotion.enabled && imageMotion.galleryHover === "kenburns-card"
                                          ? idx % 2 === 0
                                            ? "motion-gallery-kenburns-odd"
                                            : "motion-gallery-kenburns-even"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (sec.id === "gift" && config.gift.enabled) {
                          return (
                            <div key="gift" className="py-12 px-6 space-y-4 text-center">
                              <QrCode className="h-6 w-6 text-[#8B5E5A] mx-auto" />
                              <h3 className="font-serif text-xl font-bold">{config.gift.title}</h3>
                              <p className="text-[11px] text-[#6B5E5B] max-w-xs mx-auto">{config.gift.description}</p>

                              <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] max-w-xs mx-auto text-center space-y-3">
                                {config.gift.qrCodeUrl && (
                                  <img src={config.gift.qrCodeUrl} alt="QR Code" className="h-32 w-32 mx-auto object-contain bg-white rounded-lg p-1 border border-[#EADBCE]" />
                                )}
                                <div className="text-[11px] text-[#2C2422]">
                                  <p className="font-bold">{config.gift.bankName}</p>
                                  <p className="font-mono text-xs text-[#8B5E5A] font-bold mt-0.5">{config.gift.accountNumber}</p>
                                  <p className="text-[10px] text-[#6B5E5B] uppercase">{config.gift.accountHolder}</p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (sec.id === "footer") {
                          return (
                            <div key="footer" className="py-10 px-6 bg-[#2C2422] text-white text-center space-y-2">
                              <p className="text-xs italic text-white/80 max-w-xs mx-auto">
                                &ldquo;{config.footer.quote}&rdquo;
                              </p>
                              <p className="font-serif font-bold text-sm" style={{ color: currentTheme.accentColor }}>
                                {config.footer.hashtag}
                              </p>
                            </div>
                          );
                        }

                        return null;
                      })}
                  </div>
                </div>
              ) : (
                /* iPhone 16 Pro Titanium Chassis Frame */
                <div className="w-full max-w-[370px] sm:max-w-[395px] rounded-[52px] overflow-hidden iphone-titanium-frame bg-[#1E1918] p-3 border-4 border-[#3D3330] transition-all">
                  <div className={`w-full rounded-[42px] overflow-hidden ${currentTheme.bgClass} text-[#2C2422] flex flex-col relative`}>
                    {/* Dynamic Island Status Bar */}
                    <div className="bg-[#2C2422] text-white pt-2.5 pb-2 px-6 flex items-center justify-between text-[11px] font-semibold select-none z-30 shrink-0">
                      <span>9:41</span>
                      <div className="h-5 w-24 bg-black rounded-full mx-auto flex items-center justify-end px-2">
                        <span className="h-2 w-2 rounded-full bg-[#1A1A1A] border border-white/20 mr-1" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span>5G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Scrollable Mobile Viewport */}
                    <div className={`overflow-y-auto max-h-[72vh] ${currentTheme.bgClass} text-[#2C2422] motion-speed-${imageMotion.speed || "normal"}`}>
                      {config.sections
                        .filter((s) => s.enabled)
                        .sort((a, b) => a.order - b.order)
                        .map((sec) => {
                          if (sec.id === "hero") {
                            return (
                              <div
                                key="hero"
                                className={`relative min-h-[460px] flex items-center justify-center text-center p-6 bg-gradient-to-b ${currentTheme.heroGradient} text-white overflow-hidden`}
                              >
                                <div
                                  className={`absolute inset-0 bg-cover bg-center opacity-30 ${getHeroMotionClass()}`}
                                  style={{ backgroundImage: `url(${config.hero.coverImageUrl})` }}
                                />
                                <div className="relative z-10 space-y-4 max-w-md mx-auto">
                                  <Badge variant="champagne" className="text-[10px] uppercase tracking-widest font-semibold">
                                    {config.hero.title}
                                  </Badge>
                                  <h2 className="font-serif text-3xl font-extrabold tracking-tight text-white leading-tight">
                                    {config.couple.brideName}
                                    <span className="block text-xl font-serif my-1" style={{ color: currentTheme.accentColor }}>
                                      &
                                    </span>
                                    {config.couple.groomName}
                                  </h2>
                                  <p className="text-xs text-white/85 italic font-light px-4">
                                    &ldquo;{config.hero.subTitle}&rdquo;
                                  </p>

                                  {config.hero.showCountdown && (
                                    <div className="flex items-center justify-center gap-2 bg-white/10 p-2.5 rounded-2xl backdrop-blur-md max-w-xs mx-auto border border-white/20 shadow-md">
                                      <div className="text-center px-2">
                                        <span className="font-serif text-lg font-bold" style={{ color: currentTheme.accentColor }}>220</span>
                                        <p className="text-[8px] uppercase tracking-wider text-white/70">Ngày</p>
                                      </div>
                                      <span>:</span>
                                      <div className="text-center px-2">
                                        <span className="font-serif text-lg font-bold">14</span>
                                        <p className="text-[8px] uppercase tracking-wider text-white/70">Giờ</p>
                                      </div>
                                      <span>:</span>
                                      <div className="text-center px-2">
                                        <span className="font-serif text-lg font-bold">35</span>
                                        <p className="text-[8px] uppercase tracking-wider text-white/70">Phút</p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="text-[11px] text-white/90 pt-1 flex items-center justify-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" style={{ color: currentTheme.accentColor }} />
                                    <span>{wedding.wedding_date} • {wedding.venue}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (sec.id === "couple") {
                            return (
                              <div key="couple" className="py-12 px-6 text-center space-y-6">
                                <div>
                                  <Badge variant="default" className="text-[10px] mb-1">
                                    {config.couple.title}
                                  </Badge>
                                  <p className="text-xs text-[#6B5E5B] italic">{config.couple.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  {/* Bride Card */}
                                  <div className="p-4 rounded-2xl bg-white/80 border border-[#EADBCE] shadow-sm text-center space-y-2">
                                    <div className={`h-20 w-20 rounded-full overflow-hidden mx-auto border-2 border-[#D6BE91] shadow-sm relative ${getCoupleMotionClass("bride")}`}>
                                      <img src={config.couple.bridePhotoUrl} alt="Bride" className="h-full w-full object-cover" />
                                    </div>
                                    <h4 className="font-serif text-sm font-bold text-[#2C2422]">{config.couple.brideName}</h4>
                                    <span className="text-[10px] text-[#8B5E5A] font-semibold block">{config.couple.brideTitle}</span>
                                    <p className="text-[10px] text-[#6B5E5B] line-clamp-3 leading-relaxed">{config.couple.brideBio}</p>
                                  </div>

                                  {/* Groom Card */}
                                  <div className="p-4 rounded-2xl bg-white/80 border border-[#EADBCE] shadow-sm text-center space-y-2">
                                    <div className={`h-20 w-20 rounded-full overflow-hidden mx-auto border-2 border-[#D6BE91] shadow-sm relative ${getCoupleMotionClass("groom")}`}>
                                      <img src={config.couple.groomPhotoUrl} alt="Groom" className="h-full w-full object-cover" />
                                    </div>
                                    <h4 className="font-serif text-sm font-bold text-[#2C2422]">{config.couple.groomName}</h4>
                                    <span className="text-[10px] text-[#8B5E5A] font-semibold block">{config.couple.groomTitle}</span>
                                    <p className="text-[10px] text-[#6B5E5B] line-clamp-3 leading-relaxed">{config.couple.groomBio}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (sec.id === "story") {
                            return (
                              <div key="story" className="py-12 px-6 bg-white/60 space-y-6 text-center">
                                <div>
                                  <Heart className="h-6 w-6 text-[#8B5E5A] fill-current mx-auto mb-2" />
                                  <h3 className="font-serif text-xl font-bold">{config.story.title}</h3>
                                  <p className="text-[11px] text-[#6B5E5B] mt-1">{config.story.description}</p>
                                </div>

                                <div className="space-y-4 max-w-sm mx-auto text-left">
                                  {config.story.milestones.map((m) => (
                                    <div key={m.id} className="p-3.5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm flex gap-3 group">
                                      {m.imageUrl && (
                                        <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 shadow-xs">
                                          <img
                                            src={m.imageUrl}
                                            alt={m.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                          />
                                        </div>
                                      )}
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-bold text-[#8B5E5A] uppercase">{m.year}</span>
                                        <h5 className="font-serif text-xs font-bold text-[#2C2422]">{m.title}</h5>
                                        <p className="text-[10px] text-[#6B5E5B] leading-relaxed line-clamp-2">{m.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (sec.id === "events") {
                            return (
                              <div key="events" className="py-12 px-6 space-y-4 text-center">
                                <Clock className="h-6 w-6 text-[#8B5E5A] mx-auto" />
                                <h3 className="font-serif text-xl font-bold">{config.events.title}</h3>
                                <p className="text-[11px] text-[#6B5E5B]">{config.events.dresscode}</p>

                                <div className="space-y-2 max-w-sm mx-auto text-left">
                                  <div className="p-3 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-between">
                                    <div>
                                      <Badge variant="champagne" className="text-[9px]">09:00</Badge>
                                      <h5 className="text-xs font-bold mt-1">Lễ Gia Tiên & Rước Dâu</h5>
                                      <p className="text-[10px] text-[#A69591]">Tư gia hai họ</p>
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-between">
                                    <div>
                                      <Badge variant="champagne" className="text-[9px]">18:00</Badge>
                                      <h5 className="text-xs font-bold mt-1">Tiệc Cưới & Khiêu vũ First Dance</h5>
                                      <p className="text-[10px] text-[#A69591]">Khoảnh khắc ngọt ngào</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (sec.id === "gallery") {
                            return (
                              <div key="gallery" className="py-12 px-6 bg-white/60 space-y-4 text-center">
                                <ImageIcon className="h-6 w-6 text-[#8B5E5A] mx-auto" />
                                <h3 className="font-serif text-xl font-bold">{config.gallery.title}</h3>
                                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2">
                                  {config.gallery.photos.slice(0, 6).map((p, idx) => (
                                    <div
                                      key={p.id}
                                      className={`rounded-xl overflow-hidden aspect-square border border-[#EADBCE] group relative ${getGalleryMotionClass(idx)}`}
                                    >
                                      <img
                                        src={p.url}
                                        alt="Gallery"
                                        className={`h-full w-full object-cover transition-transform duration-500 ${
                                          imageMotion.enabled && imageMotion.galleryHover === "kenburns-card"
                                            ? idx % 2 === 0
                                              ? "motion-gallery-kenburns-odd"
                                              : "motion-gallery-kenburns-even"
                                            : ""
                                        }`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (sec.id === "gift" && config.gift.enabled) {
                            return (
                              <div key="gift" className="py-12 px-6 space-y-4 text-center">
                                <QrCode className="h-6 w-6 text-[#8B5E5A] mx-auto" />
                                <h3 className="font-serif text-xl font-bold">{config.gift.title}</h3>
                                <p className="text-[11px] text-[#6B5E5B] max-w-xs mx-auto">{config.gift.description}</p>

                                <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] max-w-xs mx-auto text-center space-y-3">
                                  {config.gift.qrCodeUrl && (
                                    <img src={config.gift.qrCodeUrl} alt="QR Code" className="h-32 w-32 mx-auto object-contain bg-white rounded-lg p-1 border border-[#EADBCE]" />
                                  )}
                                  <div className="text-[11px] text-[#2C2422]">
                                    <p className="font-bold">{config.gift.bankName}</p>
                                    <p className="font-mono text-xs text-[#8B5E5A] font-bold mt-0.5">{config.gift.accountNumber}</p>
                                    <p className="text-[10px] text-[#6B5E5B] uppercase">{config.gift.accountHolder}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (sec.id === "footer") {
                            return (
                              <div key="footer" className="py-10 px-6 bg-[#2C2422] text-white text-center space-y-2">
                                <p className="text-xs italic text-white/80 max-w-xs mx-auto">
                                  &ldquo;{config.footer.quote}&rdquo;
                                </p>
                                <p className="font-serif font-bold text-sm" style={{ color: currentTheme.accentColor }}>
                                  {config.footer.hashtag}
                                </p>
                              </div>
                            );
                          }

                          return null;
                        })}
                    </div>

                    {/* Bottom iOS Home Indicator */}
                    <div className="py-2 bg-[#2C2422]/90 flex justify-center shrink-0">
                      <div className="h-1 w-32 bg-white/70 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      <Modal isOpen={isAddMilestoneOpen} onClose={() => setIsAddMilestoneOpen(false)} title="Thêm cột mốc câu chuyện tình yêu">
        <form onSubmit={handleAddMilestone} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                Thời gian (Năm hoặc Ngày) <span className="text-[#B44A4A]">*</span>
              </label>
              <Input
                value={newMilestoneYear}
                onChange={(e) => setNewMilestoneYear(e.target.value)}
                placeholder="VD: 15/10/2021"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                Tiêu đề kỷ niệm <span className="text-[#B44A4A]">*</span>
              </label>
              <Input
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="VD: Lần đầu hẹn hò"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Mô tả kỷ niệm ngọt ngào
            </label>
            <textarea
              value={newMilestoneDesc}
              onChange={(e) => setNewMilestoneDesc(e.target.value)}
              placeholder="Kể lại cảm xúc và khoảnh khắc đáng nhớ..."
              rows={3}
              className="mt-1 w-full rounded-xl border border-[#EADBCE] bg-[#FFFDF9] p-2.5 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
              Hình ảnh kỷ niệm
            </label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#8B5E5A] bg-[#FFFDF9] hover:bg-[#F5EFE7] dark:bg-[#221C1B] dark:border-[#3A302E]">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Tải ảnh từ máy tính</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleGenericFileUpload(e, setNewMilestoneImg)}
              />
            </label>
            {newMilestoneImg && (
              <div className="mt-2 h-20 w-20 rounded-xl overflow-hidden border border-[#EADBCE]">
                <img src={newMilestoneImg} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddMilestoneOpen(false)} className="w-full sm:w-auto">
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              Lưu cột mốc
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Quick Modal */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Mã QR Website Đám Cưới">
        {(() => {
          const currentUrl =
            typeof window !== "undefined" && wedding?.slug
              ? `${window.location.origin}/w/${wedding.slug}`
              : wedding?.slug
              ? `/w/${wedding.slug}`
              : "";

          return (
            <div className="space-y-4 text-center py-2">
              <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] dark:bg-[#1E1918] dark:border-[#3A302E] inline-block shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}`}
                  alt="QR Code Website Đám Cưới"
                  className="h-48 w-48 mx-auto rounded-xl object-contain bg-white p-2"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                  Quét mã để truy cập trực tiếp trên điện thoại
                </p>
                <p className="text-[11px] text-[#A69591] break-all font-mono">
                  {currentUrl}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleCopyLink();
                    setIsQrModalOpen(false);
                  }}
                  className="gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? "Đã sao chép liên kết" : "Sao chép Link Website"}</span>
                </Button>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(currentUrl)}`}
                  download="wedding-qr.png"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button type="button" variant="primary" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải ảnh QR gốc</span>
                  </Button>
                </a>
              </div>
            </div>
          );
        })()}
      </Modal>

      <UpgradePlanModal
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        reason={upgradeReason}
      />
    </div>
  );
}
