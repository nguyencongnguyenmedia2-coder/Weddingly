"use client";

import * as React from "react";
import {
  ShieldAlert,
  Users,
  Heart,
  CreditCard,
  Database,
  Activity,
  Sparkles,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const auditLogs = [
    {
      actor: "minhanh@wedding.vn",
      action: "CREATE_GUEST",
      entity: "Khách mời: Vũ Phương Thảo",
      time: "15 phút trước",
    },
    {
      actor: "quocminh@wedding.vn",
      action: "UPDATE_BUDGET",
      entity: "Hạng mục: Địa điểm & Tiệc cưới",
      time: "1 giờ trước",
    },
    {
      actor: "admin@weddingplannerpro.vn",
      action: "UPDATE_SYSTEM_TEMPLATE",
      entity: "Template: Luxury Champagne Gold",
      time: "4 giờ trước",
    },
    {
      actor: "minhanh@wedding.vn",
      action: "ADD_PAYMENT_SCHEDULE",
      entity: "Nhà cung cấp: Lumière Studio",
      time: "1 ngày trước",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#2C2422] text-[#D6BE91]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
              Hệ thống Quản trị (Admin System Panel)
            </h1>
            <p className="text-xs text-[#6B5E5B] dark:text-[#A69591]">
              Giám sát tài nguyên nền tảng SaaS, người dùng, nhật ký kiểm toán (Audit Logs)
            </p>
          </div>
        </div>
        <Badge variant="champagne" className="self-start sm:self-auto">
          Role: SUPER_ADMIN
        </Badge>
      </div>

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">Người dùng đăng ký</span>
          <p className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-1">1,248</p>
          <p className="text-[11px] text-[#3F7D5A] mt-0.5">+18% tháng này</p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">Đám cưới đang hoạt động</span>
          <p className="font-serif text-2xl font-bold text-[#8B5E5A] dark:text-[#D6BE91] mt-1">982</p>
          <p className="text-[11px] text-[#8B5E5A] mt-0.5">Active workspaces</p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">Emma AI Tokens gọi</span>
          <p className="font-serif text-2xl font-bold text-[#C68A27] mt-1">45.2K</p>
          <p className="text-[11px] text-[#C68A27] mt-0.5">Gemini / OpenAI API</p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">Dung lượng lưu trữ</span>
          <p className="font-serif text-2xl font-bold text-[#3F7D5A] mt-1">12.4 GB</p>
          <p className="text-[11px] text-[#3F7D5A] mt-0.5">Supabase Storage</p>
        </Card>
      </div>

      {/* Audit Logs Table (Section 39) */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[#EADBCE] dark:border-[#3A302E] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#8B5E5A]" />
            <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
              Nhật ký kiểm toán an ninh (Audit Logs)
            </h3>
          </div>
          <span className="text-[11px] text-[#A69591]">Tự động ghi nhận mọi thay đổi dữ liệu</span>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
          {auditLogs.map((log, i) => (
            <div key={i} className="p-3.5 space-y-2 hover:bg-[#FFFDF9]/60">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="font-mono text-[10px]">
                  {log.action}
                </Badge>
                <span className="text-[11px] text-[#A69591]">{log.time}</span>
              </div>
              <p className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                {log.entity}
              </p>
              <p className="font-mono text-[11px] text-[#6B5E5B] dark:text-[#A69591] truncate">
                Actor: {log.actor}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] text-[#6B5E5B] border-b border-[#EADBCE] dark:bg-[#2A2321] dark:border-[#3A302E]">
              <tr>
                <th className="p-3.5 font-semibold">Tài khoản thực hiện (Actor)</th>
                <th className="p-3.5 font-semibold">Hành động (Action)</th>
                <th className="p-3.5 font-semibold">Đối tượng tác động (Entity)</th>
                <th className="p-3.5 font-semibold text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-[#FFFDF9]/60">
                  <td className="p-3.5 font-mono text-[11px] text-[#2C2422] dark:text-[#F5EFE7]">
                    {log.actor}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="default" className="font-mono text-[10px]">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-[#6B5E5B] dark:text-[#A69591]">
                    {log.entity}
                  </td>
                  <td className="p-3.5 text-right text-[11px] text-[#A69591]">
                    {log.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
