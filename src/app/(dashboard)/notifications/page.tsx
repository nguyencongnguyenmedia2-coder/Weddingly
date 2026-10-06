"use client";

import * as React from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Users,
  Calendar,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  type: "TASK_DUE" | "PAYMENT_DUE" | "RSVP" | "BUDGET_ALERT" | "MILESTONE";
  title: string;
  message: string;
  isRead: boolean;
  time: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: "nt1",
      type: "RSVP",
      title: "Khách mời vừa xác nhận tham dự",
      message: "Khách mời 'Vũ Phương Thảo' vừa xác nhận tham dự hôn lễ kèm 1 người lớn qua link RSVP online!",
      isRead: false,
      time: "15 phút trước",
    },
    {
      id: "nt2",
      type: "PAYMENT_DUE",
      title: "Lịch thanh toán sắp đến hạn",
      message: "Khoản đặt cọc đợt 2 sảnh tiệc Riverside Palace (100.000.000 ₫) cần thanh toán trước ngày cưới 1 tháng.",
      isRead: false,
      time: "2 giờ trước",
    },
    {
      id: "nt3",
      type: "TASK_DUE",
      title: "Nhắc nhở hạn hoàn thành công việc",
      message: "Công việc 'Thử váy cưới chính và chốt số đo' có hạn hoàn thành vào ngày 20/11/2026.",
      isRead: false,
      time: "1 ngày trước",
    },
    {
      id: "nt4",
      type: "MILESTONE",
      title: "Chúc mừng mốc kế hoạch quan trọng",
      message: "Đám cưới của hai bạn chỉ còn cách 186 ngày! Mọi công tác chuẩn bị đang đúng tiến độ!",
      isRead: true,
      time: "3 ngày trước",
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "RSVP":
        return <Users className="h-4 w-4 text-[#3F7D5A]" />;
      case "PAYMENT_DUE":
        return <CreditCard className="h-4 w-4 text-[#C68A27]" />;
      case "TASK_DUE":
        return <CheckCircle2 className="h-4 w-4 text-[#8B5E5A]" />;
      case "BUDGET_ALERT":
        return <AlertTriangle className="h-4 w-4 text-[#B44A4A]" />;
      case "MILESTONE":
        return <Sparkles className="h-4 w-4 text-[#D6BE91]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Trung tâm thông báo (Notifications)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Cập nhật biến động phản hồi RSVP, các mốc thanh toán và cảnh báo ngân sách
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} className="w-full sm:w-auto justify-center">
          <CheckCheck className="h-4 w-4" />
          <span>Đánh dấu đã đọc tất cả</span>
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            onClick={() => markSingleRead(n.id)}
            className={`p-4 flex items-start gap-3.5 cursor-pointer transition-all ${
              !n.isRead
                ? "bg-[#FFFDF9] border-[#D6BE91] shadow-md dark:bg-[#221C1B]"
                : "opacity-85 hover:border-[#EADBCE]"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F5EFE7] dark:bg-[#2A2321]">
              {getIcon(n.type)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                  {n.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#A69591]">{n.time}</span>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-[#8B5E5A]" />
                  )}
                </div>
              </div>
              <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1 leading-relaxed">
                {n.message}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
