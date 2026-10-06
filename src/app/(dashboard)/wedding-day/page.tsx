"use client";

import * as React from "react";
import {
  HeartHandshake,
  Clock,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { TimelineService, EmergencyContact } from "@/services/timeline.service";
import { WeddingService } from "@/services/wedding.service";
import { TimelineEvent, Wedding } from "@/types/database";

export default function WeddingDayPage() {
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const [events, setEvents] = React.useState<TimelineEvent[]>([]);
  const [wedding, setWedding] = React.useState<Wedding | null>(null);
  const [emergencyContacts, setEmergencyContacts] = React.useState<EmergencyContact[]>([]);

  React.useEffect(() => {
    // Clock updater
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    TimelineService.getEvents().then(setEvents);
    TimelineService.getEmergencyContacts();
    setEmergencyContacts(TimelineService.getEmergencyContacts());
    WeddingService.getActiveWedding().then(setWedding);

    return () => clearInterval(timer);
  }, []);

  const currentEvent = events[3] || events[0]; // Active event in progress
  const nextEvent = events[4] || events[1]; // Next event

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* 1. Live Wedding Day Clock Card */}
      <div className="rounded-[24px] bg-gradient-to-br from-[#8B5E5A] via-[#724B47] to-[#423633] p-6 sm:p-8 text-white text-center shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-[#D6BE91] mb-3">
          <HeartHandshake className="h-4 w-4" />
          <span>CHẾ ĐỘ NGÀY CƯỚI (LIVE WEDDING MODE)</span>
        </div>

        <p className="font-serif text-3xl sm:text-5xl font-extrabold tracking-wider text-[#FFFDF9]">
          {currentTime || "00:00:00"}
        </p>

        {wedding && (
          <p className="text-xs text-[#EADBCE] mt-2 font-medium">
            Hôn lễ {wedding.bride_name} & {wedding.groom_name} • Ngày {wedding.wedding_date}
          </p>
        )}
      </div>

      {/* 2. Current Active Event Banner */}
      {currentEvent && (
        <div className="rounded-[20px] bg-[#EBF5F0] border-2 border-[#3F7D5A] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#C2E3D0]">
            <Badge variant="success" className="animate-pulse">
              Đang diễn ra ngay lúc này
            </Badge>
            <span className="text-xs font-bold text-[#3F7D5A] flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {currentEvent.start_time} — {currentEvent.end_time}
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold text-[#2C2422] mt-3">
            {currentEvent.title}
          </h3>
          {currentEvent.description && (
            <p className="text-xs text-[#6B5E5B] mt-1 leading-relaxed">
              {currentEvent.description}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-[#C2E3D0] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#2C2422] flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-[#3F7D5A]" />
              {currentEvent.location}
            </span>

            {currentEvent.contact_phone && (
              <a
                href={`tel:${currentEvent.contact_phone}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-[12px] bg-[#3F7D5A] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#326448] transition-colors w-full sm:w-auto"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Gọi người phụ trách ({currentEvent.assignee_name})</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 3. Next Upcoming Event */}
      {nextEvent && (
        <Card className="p-4 border-[#D6BE91] bg-[#FEF8EC]/40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#C68A27] uppercase tracking-wider">
              Nghi lễ tiếp theo
            </span>
            <span className="text-[#6B5E5B] font-semibold">
              Bắt đầu lúc {nextEvent.start_time}
            </span>
          </div>
          <h4 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-1">
            {nextEvent.title}
          </h4>
          <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-0.5">
            Tại: {nextEvent.location} • Phụ trách: {nextEvent.assignee_name}
          </p>
        </Card>
      )}

      {/* 4. Emergency Contacts Grid (Section 62) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#8B5E5A]" />
            <h3 className="font-serif text-base font-bold text-[#2C2422] dark:text-[#F5EFE7]">
              Danh bạ liên lạc khẩn cấp (Emergency Call)
            </h3>
          </div>
          <span className="text-[11px] text-[#A69591]">1 chạm gọi trực tiếp</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {emergencyContacts.map((contact, idx) => (
            <Card key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:border-[#D6BE91] transition-all">
              <div className="truncate">
                <span className="text-[10px] font-bold text-[#8B5E5A] uppercase tracking-wider block">
                  {contact.role}
                </span>
                <p className="font-serif text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7] truncate">
                  {contact.name}
                </p>
                {contact.note && (
                  <p className="text-[10px] text-[#A69591] truncate">{contact.note}</p>
                )}
              </div>

              <a
                href={`tel:${contact.phone}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B5E5A] text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
                title={`Gọi ${contact.name}`}
              >
                <Phone className="h-4 w-4" />
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
