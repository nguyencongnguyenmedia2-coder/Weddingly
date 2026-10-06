"use client";

import * as React from "react";
import Link from "next/link";
import {
  Send,
  Sparkles,
  Share2,
  Copy,
  Check,
  Eye,
  Heart,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { WeddingService } from "@/services/wedding.service";
import { Wedding } from "@/types/database";

export default function InvitationsPage() {
  const [wedding, setWedding] = React.useState<Wedding | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [template, setTemplate] = React.useState("Luxury Gold");
  const [dressCode, setDressCode] = React.useState("Trang phục trang nhã, tone màu Pastel / Be / Trắng");
  const [bankInfo, setBankInfo] = React.useState("Vietcombank - STK: 1012345678 - NGUYEN MINH ANH");

  React.useEffect(() => {
    WeddingService.getActiveWedding().then(setWedding);
  }, []);

  const handleCopyShare = () => {
    if (!wedding) return;
    const shareText = `Trân trọng kính mời bạn đến chung vui cùng đám cưới của ${wedding.bride_name} & ${wedding.groom_name} vào ngày ${wedding.wedding_date} tại ${wedding.venue}. Xem thiệp online và xác nhận tham dự tại: ${window.location.origin}/w/${wedding.slug}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!wedding) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Thiệp cưới điện tử (Digital Invitations)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Thiết kế thiệp cưới online sang trọng, đính kèm nhạc nền lãng mạn và gửi link qua Zalo / Facebook
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="champagne" size="md" onClick={handleCopyShare} className="w-full justify-center">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Đã copy nội dung gửi!" : "Copy nội dung mời"}</span>
          </Button>
          <Link href={`/w/${wedding.slug}`} target="_blank" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full justify-center">
              <Eye className="h-4 w-4" />
              <span>Xem trước thiệp</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customization Settings */}
        <div className="space-y-5 lg:col-span-1">
          <Card className="p-5 space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7] pb-2 border-b border-[#EADBCE]">
              Cấu hình thiệp cưới
            </h3>

            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                Mẫu phong cách thiệp
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full rounded-[12px] border border-[#EADBCE] bg-[#FFFDF9] p-2.5 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="Luxury Gold">Luxury Champagne Gold</option>
                <option value="Floral Pastel">Floral Romantic Pastel</option>
                <option value="Minimal Modern">Minimalist Modern</option>
                <option value="Traditional Red">Truyền Thống Á Đông</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                Quy định trang phục (Dress Code)
              </label>
              <Input
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
                Tài khoản mừng cưới (Gift / Hỷ sự)
              </label>
              <Input
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-[#A69591] leading-relaxed">
                Thiệp cưới tự động tích hợp form điểm danh RSVP và đếm ngược thời gian cho khách mời.
              </p>
            </div>
          </Card>
        </div>

        {/* Right: Realtime Invitation Preview */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="w-full max-w-md rounded-[24px] sm:rounded-[28px] border-4 sm:border-8 border-[#2C2422] bg-[#FFFDF9] p-5 sm:p-8 shadow-2xl space-y-6 text-center text-[#2C2422] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-3 bg-[#D6BE91]" />

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8B5E5A] font-bold">
                Save The Date
              </span>
              <p className="text-xs font-serif italic text-[#A69591]">Trân trọng kính mời</p>
            </div>

            <div className="py-2">
              <h2 className="font-serif text-3xl font-extrabold text-[#8B5E5A]">
                {wedding.bride_name}
              </h2>
              <span className="font-serif text-lg text-[#D6BE91] my-1 block">&</span>
              <h2 className="font-serif text-3xl font-extrabold text-[#2C2422]">
                {wedding.groom_name}
              </h2>
            </div>

            <div className="space-y-2 border-y border-[#EADBCE] py-4 text-xs text-[#6B5E5B]">
              <p className="flex items-center justify-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-[#8B5E5A]" />
                <span>{wedding.wedding_date} (Tức ngày 10 tháng 4 Âm lịch)</span>
              </p>
              <p className="flex items-center justify-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-[#8B5E5A]" />
                <span>{wedding.venue}</span>
              </p>
            </div>

            <div className="rounded-[16px] bg-[#F5EFE7] p-4 text-xs space-y-2">
              <p className="font-bold text-[#8B5E5A]">DRESS CODE:</p>
              <p className="text-[#2C2422] text-[11px]">{dressCode}</p>
            </div>

            <div className="pt-2">
              <span className="inline-block rounded-full bg-[#8B5E5A] px-6 py-2.5 text-xs font-bold text-white shadow-md">
                Xác nhận tham dự (RSVP)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
