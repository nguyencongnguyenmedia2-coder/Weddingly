"use client";

import * as React from "react";
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/primitives";
import { TaskService, SmartChecklistMilestone } from "@/services/task.service";

export default function ChecklistsPage() {
  const [milestones, setMilestones] = React.useState<SmartChecklistMilestone[]>([]);
  const [completedItems, setCompletedItems] = React.useState<Record<string, boolean>>({
    "Xác định ngân sách tổng và phong cách tiệc": true,
    "Khảo sát và đặt cọc địa điểm tiệc cưới": true,
    "Lựa chọn ekip chụp ảnh & quay phim phóng sự": true,
  });

  React.useEffect(() => {
    setMilestones(TaskService.getSmartMilestones());
  }, []);

  const toggleItem = (title: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Calculate overall checklist progress
  const allItems = milestones.flatMap((m) => m.items);
  const totalCount = allItems.length;
  const completedCount = allItems.filter((i) => completedItems[i.title]).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Checklist cưới thông minh (Smart Timeline)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Lộ trình tự động tính toán dựa trên ngày cưới của bạn từ 12 tháng trước đến tuần lễ vàng
          </p>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="rounded-[20px] bg-[#F5EFE7] p-6 border border-[#EADBCE] dark:bg-[#221C1B] dark:border-[#3A302E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#8B5E5A] dark:text-[#D6BE91] uppercase tracking-wider">
              Tổng tiến độ hoàn thiện
            </span>
            <p className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
              {completedCount} / {totalCount} Hạng mục trọng điểm ({progressPct}%)
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-[#EADBCE] dark:bg-[#2A2321]">
              <div
                className="bg-[#3F7D5A] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestones list */}
      <div className="space-y-6">
        {milestones.map((m, mIdx) => (
          <div key={mIdx} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5E5A] text-white text-xs font-bold font-serif">
                {mIdx + 1}
              </span>
              <h3 className="font-serif text-base font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                {m.label}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 sm:pl-9">
              {m.items.map((item, iIdx) => {
                const isDone = Boolean(completedItems[item.title]);
                return (
                  <Card
                    key={iIdx}
                    onClick={() => toggleItem(item.title)}
                    className={`cursor-pointer transition-all p-4 border ${
                      isDone
                        ? "bg-[#EBF5F0]/50 border-[#C2E3D0]"
                        : "hover:border-[#D6BE91]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 text-[#3F7D5A]">
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 fill-[#3F7D5A] text-white" />
                        ) : (
                          <Circle className="h-5 w-5 text-[#A69591]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs font-bold leading-snug ${
                              isDone
                                ? "line-through text-[#6B5E5B]"
                                : "text-[#2C2422] dark:text-[#F5EFE7]"
                            }`}
                          >
                            {item.title}
                          </p>
                          <Badge
                            variant={
                              item.priority === "URGENT"
                                ? "danger"
                                : item.priority === "HIGH"
                                ? "warning"
                                : "champagne"
                            }
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-[#A69591]">
                          <span>{item.category}</span>
                          <span className="text-[#8B5E5A] dark:text-[#D6BE91] font-medium">
                            {isDone ? "Đã xong ✓" : "Bấm để hoàn thành"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
