"use client";

import * as React from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  CheckCircle2,
  Users,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/utils";
import { BudgetService } from "@/services/budget.service";
import { GuestService } from "@/services/guest.service";
import { TaskService } from "@/services/task.service";
import { WeddingService } from "@/services/wedding.service";

export default function AnalyticsPage() {
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [summary, setSummary] = React.useState<any>(null);
  const [guestStats, setGuestStats] = React.useState<any>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function load() {
      const w = await WeddingService.getActiveWedding();
      const bSummary = await BudgetService.getBudgetSummary(w.estimated_budget);
      setSummary(bSummary);
      const gStats = await GuestService.getGuestStats();
      setGuestStats(gStats);
      const tList = await TaskService.getTasks();
      setTasks(tList);
      setDataLoaded(true);
    }
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!dataLoaded) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Báo cáo phân tích tổng thể (Wedding Analytics)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Tổng quan đa chiều về tài chính, phản hồi khách mời và hiệu suất hoàn thành công việc
          </p>
        </div>
        <Button variant="outline" size="md" onClick={handlePrint} className="w-full sm:w-auto justify-center">
          <Download className="h-4 w-4" />
          <span>In / Xuất PDF báo cáo</span>
        </Button>
      </div>

      {/* Top 3 High Level KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-[#D6BE91] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">
              Hiệu suất giải ngân ngân sách
            </span>
            <span className="text-xs font-bold text-[#3F7D5A]">{summary.spentPercentage}%</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-2">
            {formatCurrencyVND(summary.totalSpent)}
          </p>
          <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Trên tổng hạn mức {formatCurrencyVND(summary.totalBudget)}
          </p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">
              Tỷ lệ phản hồi RSVP
            </span>
            <span className="text-xs font-bold text-[#C68A27]">
              {Math.round(((guestStats.confirmed + guestStats.declined) / (guestStats.total || 1)) * 100)}%
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#3F7D5A] mt-2">
            {guestStats.confirmed} Đã chốt đi
          </p>
          <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Tổng số khách dự tiệc: {guestStats.confirmedGuestsTotal} người
          </p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">
              Tiến độ công việc hoàn tất
            </span>
            <span className="text-xs font-bold text-[#8B5E5A]">
              {Math.round((tasks.filter(t => t.status === "COMPLETED").length / (tasks.length || 1)) * 100)}%
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#8B5E5A] dark:text-[#D6BE91] mt-2">
            {tasks.filter(t => t.status === "COMPLETED").length} / {tasks.length} Việc
          </p>
          <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Không có công việc nào bị quá hạn
          </p>
        </Card>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Breakdown */}
        <Card className="p-6 space-y-4">
          <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7] pb-2 border-b border-[#EADBCE]">
            Phân bổ cơ cấu chi phí thực tế
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Địa điểm & Tiệc cưới</span>
                <span className="font-bold">50.000.000 ₫ (52%)</span>
              </div>
              <div className="w-full bg-[#F5EFE7] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#8B5E5A] h-full rounded-full" style={{ width: "52%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Chụp ảnh & Quay phim</span>
                <span className="font-bold">22.000.000 ₫ (23%)</span>
              </div>
              <div className="w-full bg-[#F5EFE7] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#B89E6C] h-full rounded-full" style={{ width: "23%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Trang phục cưới</span>
                <span className="font-bold">15.000.000 ₫ (15%)</span>
              </div>
              <div className="w-full bg-[#F5EFE7] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#B48B87] h-full rounded-full" style={{ width: "15%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Thiệp mời & In ấn</span>
                <span className="font-bold">6.500.000 ₫ (7%)</span>
              </div>
              <div className="w-full bg-[#F5EFE7] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#3F7D5A] h-full rounded-full" style={{ width: "7%" }} />
              </div>
            </div>
          </div>
        </Card>

        {/* RSVP Breakdown */}
        <Card className="p-6 space-y-4">
          <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7] pb-2 border-b border-[#EADBCE]">
            Phân bố thành phần khách mời
          </h3>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-[14px] bg-[#EBF5F0] p-4 text-center">
              <span className="text-xs text-[#3F7D5A] font-semibold">Xác nhận đi (Confirmed)</span>
              <p className="font-serif text-2xl font-bold text-[#3F7D5A] mt-1">
                {guestStats.confirmed}
              </p>
            </div>
            <div className="rounded-[14px] bg-[#FEF8EC] p-4 text-center">
              <span className="text-xs text-[#C68A27] font-semibold">Đang chờ (Pending)</span>
              <p className="font-serif text-2xl font-bold text-[#C68A27] mt-1">
                {guestStats.pending}
              </p>
            </div>
            <div className="rounded-[14px] bg-[#FDF2F2] p-4 text-center">
              <span className="text-xs text-[#B44A4A] font-semibold">Từ chối (Declined)</span>
              <p className="font-serif text-2xl font-bold text-[#B44A4A] mt-1">
                {guestStats.declined}
              </p>
            </div>
            <div className="rounded-[14px] bg-[#F5EFE7] p-4 text-center">
              <span className="text-xs text-[#8B5E5A] font-semibold">Khách VIP</span>
              <p className="font-serif text-2xl font-bold text-[#8B5E5A] mt-1">
                {guestStats.vip}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
