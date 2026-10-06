"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  User,
  Phone,
  HeartHandshake,
  Edit2,
  Trash2,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { TimelineService } from "@/services/timeline.service";
import { TimelineEvent } from "@/types/database";

export default function TimelinePage() {
  const [events, setEvents] = React.useState<TimelineEvent[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<TimelineEvent | null>(null);

  // Form state
  const [title, setTitle] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:00");
  const [location, setLocation] = React.useState("");
  const [assigneeName, setAssigneeName] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<"UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED">("UPCOMING");

  const loadEvents = React.useCallback(async () => {
    const list = await TimelineService.getEvents();
    setEvents(list);
  }, []);

  React.useEffect(() => {
    loadEvents();
    const handleStoreChange = () => loadEvents();
    window.addEventListener("wedding_store_updated", handleStoreChange);
    return () => window.removeEventListener("wedding_store_updated", handleStoreChange);
  }, [loadEvents]);

  const handleDelete = async (id: string) => {
    await TimelineService.deleteEvent(id);
    loadEvents();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa mốc sự kiện thành công!" }));
    }
  };

  const handleOpenAdd = () => {
    setTitle("");
    setStartTime("09:00");
    setEndTime("10:00");
    setLocation("");
    setAssigneeName("");
    setContactPhone("");
    setDescription("");
    setStatus("UPCOMING");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (evt: TimelineEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setStartTime(evt.start_time);
    setEndTime(evt.end_time || "");
    setLocation(evt.location || "");
    setAssigneeName(evt.assignee_name || "");
    setContactPhone(evt.contact_phone || "");
    setDescription(evt.description || "");
    setStatus(evt.status);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime) return;

    if (editingEvent) {
      await TimelineService.updateEvent(editingEvent.id, {
        title,
        start_time: startTime,
        end_time: endTime || null,
        location: location || null,
        assignee_name: assigneeName || null,
        contact_phone: contactPhone || null,
        description: description || null,
        status,
      });
      setEditingEvent(null);
    } else {
      await TimelineService.addEvent({
        title,
        eventDate: "2027-05-15",
        startTime,
        endTime: endTime || null,
        location: location || null,
        assigneeName: assigneeName || null,
        contactPhone: contactPhone || null,
        description: description || null,
      });
      setIsAddModalOpen(false);
    }
    loadEvents();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Lịch trình & Kịch bản ngày cưới (Timeline)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Chi tiết từng mốc thời gian, chỉnh sửa kịch bản và phân công người phụ trách
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Link href="/wedding-day" className="w-full sm:w-auto">
            <Button variant="champagne" size="md" className="w-full justify-center">
              <HeartHandshake className="h-4 w-4" />
              <span>Bật chế độ Ngày Cưới</span>
            </Button>
          </Link>
          <Button variant="primary" size="md" onClick={handleOpenAdd} className="w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4" />
            <span>Thêm mốc sự kiện</span>
          </Button>
        </div>
      </div>

      {/* Timeline Steps View */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:bottom-0 before:top-3 before:left-2.5 sm:before:left-3.5 before:w-0.5 before:bg-[#D6BE91]">
        {events.map((evt, idx) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Circle Bullet */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#8B5E5A] text-white shadow-sm ring-4 ring-[#FFFDF9] dark:ring-[#181413]">
              <span className="text-[10px] font-bold">{idx + 1}</span>
            </div>

            <Card className="p-5 hover:border-[#D6BE91] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EADBCE] pb-3 dark:border-[#3A302E]">
                <div className="flex items-center gap-2.5">
                  <Badge variant="champagne">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {evt.start_time} {evt.end_time ? `— ${evt.end_time}` : ""}
                  </Badge>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                    {evt.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={evt.status === "COMPLETED" ? "success" : "default"}>
                    {evt.status}
                  </Badge>
                  <button
                    onClick={() => handleOpenEdit(evt)}
                    className="p-1 text-[#A69591] hover:text-[#8B5E5A] rounded hover:bg-[#F5EFE7]"
                    title="Chỉnh sửa sự kiện"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="p-1 text-[#A69591] hover:text-[#B44A4A] rounded hover:bg-[#FDF2F2]"
                    title="Xóa sự kiện"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {evt.description && (
                <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-3 leading-relaxed">
                  {evt.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#6B5E5B] dark:text-[#A69591]">
                {evt.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#8B5E5A]" />
                    <span>{evt.location}</span>
                  </span>
                )}
                {evt.assignee_name && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#8B5E5A]" />
                    <span>Phụ trách: {evt.assignee_name}</span>
                  </span>
                )}
                {evt.contact_phone && (
                  <a
                    href={`tel:${evt.contact_phone}`}
                    className="flex items-center gap-1.5 text-[#8B5E5A] font-semibold hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{evt.contact_phone}</span>
                  </a>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Add or Edit Event Modal */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingEvent)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? "Chỉnh sửa sự kiện timeline" : "Thêm sự kiện kịch bản"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tên sự kiện / Nghi lễ <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Rước dâu qua nhà trai & Lễ gia tiên"
              required
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Giờ bắt đầu</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Giờ kết thúc</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Địa điểm diễn ra</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Tư gia nhà trai hoặc Sân khấu sảnh tiệc"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Người phụ trách</label>
              <Input
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="VD: Wedding Planner Hải Yến"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Số điện thoại liên hệ</label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="VD: 0908123456"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú các công việc cần chuẩn bị..."
              rows={2}
              className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white p-2.5 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingEvent(null);
              }}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              {editingEvent ? "Lưu thay đổi" : "Lưu sự kiện"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
