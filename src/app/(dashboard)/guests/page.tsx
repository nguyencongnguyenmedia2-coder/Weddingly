"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Armchair,
  Crown,
  Sparkles,
  Lock,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { GuestService, GuestStats } from "@/services/guest.service";
import { Guest, RSVPStatus, GuestSide, WeddingTable } from "@/types/database";
import { AuthService } from "@/services/auth.service";
import { TierService } from "@/services/tier.service";
import { UpgradePlanModal } from "@/components/modals/upgrade-plan-modal";

export default function GuestsPage() {
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [tables, setTables] = React.useState<WeddingTable[]>([]);
  const [stats, setStats] = React.useState<GuestStats | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [groupFilter, setGroupFilter] = React.useState("ALL");
  const [rsvpFilter, setRsvpFilter] = React.useState("ALL");
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingGuest, setEditingGuest] = React.useState<Guest | null>(null);

  // Subscription plan & quota states
  const [userPlan, setUserPlan] = React.useState<"FREE" | "PRO">("FREE");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<string | undefined>(undefined);

  // Form state
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [groupName, setGroupName] = React.useState<"Gia đình" | "Bạn bè" | "Đồng nghiệp" | "VIP" | "Nhà gái" | "Nhà trai">("Bạn bè");
  const [side, setSide] = React.useState<GuestSide>("BOTH");
  const [plusOne, setPlusOne] = React.useState(false);
  const [childrenCount, setChildrenCount] = React.useState(0);
  const [rsvpStatus, setRsvpStatus] = React.useState<RSVPStatus>("PENDING");
  const [mealPreference, setMealPreference] = React.useState("");
  const [tableId, setTableId] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const loadData = React.useCallback(async () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setUserPlan(user.plan || "FREE");
    }
    const list = await GuestService.getGuests();
    setGuests(list);
    const s = await GuestService.getGuestStats();
    setStats(s);
    const tList = await GuestService.getTables();
    setTables(tList);
  }, []);

  React.useEffect(() => {
    loadData();
    const handleStoreChange = () => loadData();
    window.addEventListener("wedding_store_updated", handleStoreChange);
    return () => window.removeEventListener("wedding_store_updated", handleStoreChange);
  }, [loadData]);

  const handleDelete = async (id: string) => {
    await GuestService.deleteGuest(id);
    loadData();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa khách mời thành công!" }));
    }
  };

  const handleOpenAdd = () => {
    const user = AuthService.getCurrentUser();
    const plan = user?.plan || userPlan || "FREE";
    const quotaCheck = TierService.canAddGuest(guests.length, plan);
    if (!quotaCheck.allowed) {
      setUpgradeReason(quotaCheck.message);
      setIsUpgradeModalOpen(true);
      return;
    }

    setName("");
    setPhone("");
    setEmail("");
    setGroupName("Bạn bè");
    setSide("BOTH");
    setPlusOne(false);
    setChildrenCount(0);
    setRsvpStatus("PENDING");
    setMealPreference("");
    setTableId("");
    setNotes("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (g: Guest) => {
    setEditingGuest(g);
    setName(g.name);
    setPhone(g.phone || "");
    setEmail(g.email || "");
    setGroupName(g.group_name);
    setSide(g.side);
    setPlusOne(g.plus_one);
    setChildrenCount(g.children || 0);
    setRsvpStatus(g.rsvp_status);
    setMealPreference(g.meal_preference || "");
    setTableId(g.table_id || "");
    setNotes(g.notes || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingGuest) {
      await GuestService.updateGuest(editingGuest.id, {
        name,
        phone: phone || null,
        email: email || null,
        group_name: groupName,
        side,
        plus_one: plusOne,
        children: Number(childrenCount),
        rsvp_status: rsvpStatus,
        meal_preference: mealPreference || null,
        table_id: tableId || null,
        notes: notes || null,
      });
      setEditingGuest(null);
    } else {
      await GuestService.addGuest({
        name,
        phone: phone || null,
        email: email || null,
        groupName,
        side,
        plusOne,
        children: Number(childrenCount),
        rsvpStatus,
        mealPreference: mealPreference || null,
        tableId: tableId || null,
        notes: notes || null,
      });
      setIsAddModalOpen(false);
    }
    loadData();
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const exportCSV = () => {
    if (userPlan !== "PRO") {
      setUpgradeReason(
        "Chức năng xuất dữ liệu danh sách khách mời ra file CSV/Excel là tiện ích độc quyền của Gói Hoàn Mỹ (PRO VIP). Nâng cấp ngay để xuất báo cáo!"
      );
      setIsUpgradeModalOpen(true);
      return;
    }

    const headers = ["Họ và tên", "Số điện thoại", "Email", "Nhóm", "Phía", "RSVP", "Bàn tiệc", "Đi kèm", "Trẻ em", "Ghi chú"];
    const rows = guests.map((g) => {
      const assignedTbl = tables.find((t) => t.id === g.table_id);
      return [
        g.name,
        g.phone || "",
        g.email || "",
        g.group_name,
        g.side,
        g.rsvp_status,
        assignedTbl ? assignedTbl.name : "Chưa xếp",
        g.plus_one ? "Có" : "Không",
        g.children,
        g.notes || "",
      ];
    });
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danh_sach_khach_moi_wedding.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = guests.filter((g) => {
    const matchGroup = groupFilter === "ALL" || g.group_name === groupFilter;
    const matchRsvp = rsvpFilter === "ALL" || g.rsvp_status === rsvpFilter;
    const matchSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.phone && g.phone.includes(searchQuery));
    return matchGroup && matchRsvp && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
              Danh sách Khách mời & Điểm danh (RSVP)
            </h1>
            {userPlan === "PRO" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold shadow-xs">
                <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>PRO VIP (Không giới hạn)</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setUpgradeReason("Nâng cấp lên Gói Hoàn Mỹ (PRO VIP) để không giới hạn danh sách khách mời và bàn tiệc.");
                  setIsUpgradeModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8B5E5A]/10 border border-[#8B5E5A]/30 text-[#8B5E5A] dark:text-[#D6BE91] text-[10px] font-semibold hover:bg-[#8B5E5A]/20 transition-all cursor-pointer"
                title="Bấm để mở khoá không giới hạn khách mời"
              >
                <span>{guests.length}/50 khách (Miễn phí)</span>
                <span className="underline ml-0.5">Nâng cấp PRO &rarr;</span>
              </button>
            )}
          </div>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Chỉnh sửa thông tin khách, phân bàn tiệc, xuất CSV và cấp link RSVP cá nhân
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={exportCSV}
            title={userPlan !== "PRO" ? "Tính năng xuất CSV độc quyền PRO VIP (Đang bị khóa)" : "Xuất file CSV"}
          >
            <Download className="h-4 w-4" />
            <span>Xuất CSV</span>
            {userPlan !== "PRO" && (
              <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 ml-0.5" />
            )}
          </Button>
          <Button variant="primary" size="md" onClick={handleOpenAdd}>
            {userPlan !== "PRO" && guests.length >= 50 ? (
              <Lock className="h-4 w-4 text-amber-300" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Thêm khách mới</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="hover:border-[#D6BE91] transition-all">
            <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">Tổng thiệp phát đi</span>
            <p className="font-serif text-xl font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-1">
              {stats.total} Khách mời
            </p>
            <p className="text-[11px] text-[#A69591] mt-0.5">VIP: {stats.vip}</p>
          </Card>

          <Card className="hover:border-[#D6BE91] transition-all">
            <span className="text-xs font-semibold text-[#3F7D5A]">Đã xác nhận tham dự</span>
            <p className="font-serif text-xl font-bold text-[#3F7D5A] mt-1">
              {stats.confirmed} ({stats.confirmedGuestsTotal} người đi)
            </p>
            <p className="text-[11px] text-[#3F7D5A] mt-0.5">Bao gồm người đi kèm & trẻ em</p>
          </Card>

          <Card className="hover:border-[#D6BE91] transition-all">
            <span className="text-xs font-semibold text-[#C68A27]">Đang chờ phản hồi</span>
            <p className="font-serif text-xl font-bold text-[#C68A27] mt-1">
              {stats.pending} Khách
            </p>
            <p className="text-[11px] text-[#C68A27] mt-0.5">Cần nhắc nhở qua link</p>
          </Card>

          <Card className="hover:border-[#D6BE91] transition-all">
            <span className="text-xs font-semibold text-[#B44A4A]">Báo không tham dự</span>
            <p className="font-serif text-xl font-bold text-[#B44A4A] mt-1">
              {stats.declined} Khách
            </p>
            <p className="text-[11px] text-[#B44A4A] mt-0.5">Đã gửi lời chúc mừng</p>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8B5E5A]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc số điện thoại..."
            className="pl-10 h-10"
          />
        </div>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
        >
          <option value="ALL">Tất cả nhóm</option>
          <option value="Gia đình">Gia đình</option>
          <option value="Bạn bè">Bạn bè</option>
          <option value="Đồng nghiệp">Đồng nghiệp</option>
          <option value="VIP">Khách VIP</option>
          <option value="Nhà gái">Nhà Gái</option>
          <option value="Nhà trai">Nhà Trai</option>
        </select>
        <select
          value={rsvpFilter}
          onChange={(e) => setRsvpFilter(e.target.value)}
          className="rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
        >
          <option value="ALL">Tất cả trạng thái RSVP</option>
          <option value="CONFIRMED">Đã xác nhận (Confirmed)</option>
          <option value="PENDING">Chờ phản hồi (Pending)</option>
          <option value="DECLINED">Từ chối (Declined)</option>
        </select>
      </div>

      {/* 1. Mobile Cards View (block md:hidden) */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#6B5E5B] dark:text-[#A69591]">
            Không tìm thấy khách mời nào phù hợp
          </Card>
        ) : (
          filtered.map((g) => {
            const assignedTbl = tables.find((t) => t.id === g.table_id);
            return (
              <Card key={g.id} className="p-4 space-y-3 border-[#EADBCE] shadow-sm dark:border-[#3A302E]">
                {/* Header: Name and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                      {g.name}
                    </h4>
                    {g.notes && <p className="text-[11px] text-[#A69591] mt-0.5">{g.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={g.group_name === "VIP" ? "champagne" : "default"} className="text-[10px]">
                      {g.group_name} • {g.side === "BRIDE" ? "Nhà Gái" : g.side === "GROOM" ? "Nhà Trai" : "Hai họ"}
                    </Badge>
                    <Badge
                      variant={
                        g.rsvp_status === "CONFIRMED"
                          ? "success"
                          : g.rsvp_status === "PENDING"
                          ? "warning"
                          : "danger"
                      }
                      className="text-[10px]"
                    >
                      {g.rsvp_status === "CONFIRMED" ? "Xác nhận đi" : g.rsvp_status === "PENDING" ? "Chờ phản hồi" : "Không đi"}
                    </Badge>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#F5EFE7] dark:border-[#2A2321]">
                  <div>
                    <span className="text-[10px] text-[#A69591] block">Liên hệ</span>
                    {g.phone ? (
                      <a href={`tel:${g.phone}`} className="font-semibold text-[#8B5E5A] hover:underline flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{g.phone}</span>
                      </a>
                    ) : (
                      <span className="text-[#A69591] italic">Chưa có SĐT</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A69591] block">Bàn tiệc</span>
                    {assignedTbl ? (
                      <span className="font-semibold text-[#3F7D5A] flex items-center gap-1 truncate">
                        <Armchair className="h-3 w-3 shrink-0" />
                        <span className="truncate">{assignedTbl.name}</span>
                      </span>
                    ) : (
                      <span className="text-[#A69591] italic">Chưa xếp bàn</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A69591] block">Đi cùng</span>
                    <span className="font-medium text-[#2C2422] dark:text-[#F5EFE7]">
                      {g.plus_one ? "+1 người lớn" : "1 người"}
                      {g.children > 0 && ` • ${g.children} trẻ`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A69591] block">Ghi chú cỗ</span>
                    <span className="text-[#6B5E5B] dark:text-[#A69591] truncate block">
                      {g.meal_preference || "Tiêu chuẩn"}
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => handleCopyLink(g.rsvp_token)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#EADBCE] bg-[#FFFDF9] text-xs font-semibold text-[#8B5E5A] hover:bg-[#F5EFE7] active:scale-95 transition-all dark:bg-[#221C1B] dark:border-[#3A302E]"
                  >
                    {copiedToken === g.rsvp_token ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#3F7D5A]" />
                        <span className="text-[#3F7D5A]">Đã copy link</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy link RSVP</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="p-2 rounded-xl border border-[#EADBCE] text-[#8B5E5A] hover:bg-[#F5EFE7] active:scale-95 transition-all dark:bg-[#221C1B] dark:border-[#3A302E]"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 active:scale-95 transition-all dark:border-red-900/40 dark:hover:bg-red-950/20"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* 2. Desktop Table View (hidden md:block) */}
      <Card className="p-0 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] text-[#6B5E5B] border-b border-[#EADBCE] dark:bg-[#2A2321] dark:border-[#3A302E] dark:text-[#A69591]">
              <tr>
                <th className="p-4 font-semibold">Tên khách mời</th>
                <th className="p-4 font-semibold">Liên hệ</th>
                <th className="p-4 font-semibold">Nhóm & Phía</th>
                <th className="p-4 font-semibold">Bàn tiệc</th>
                <th className="p-4 font-semibold">Người đi kèm</th>
                <th className="p-4 font-semibold">Trạng thái RSVP</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
              {filtered.map((g) => {
                const assignedTbl = tables.find((t) => t.id === g.table_id);
                return (
                  <tr key={g.id} className="hover:bg-[#FFFDF9]/60 transition-colors">
                    <td className="p-4 font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                      <p>{g.name}</p>
                      {g.notes && <p className="text-[11px] text-[#A69591] font-normal">{g.notes}</p>}
                    </td>
                    <td className="p-4 text-[#6B5E5B] dark:text-[#A69591]">
                      <p>{g.phone || "—"}</p>
                      {g.email && <p className="text-[10px] text-[#A69591]">{g.email}</p>}
                    </td>
                    <td className="p-4">
                      <Badge variant={g.group_name === "VIP" ? "champagne" : "default"}>
                        {g.group_name} ({g.side === "BRIDE" ? "Gái" : g.side === "GROOM" ? "Trai" : "Hai họ"})
                      </Badge>
                    </td>
                    <td className="p-4 text-[#2C2422] dark:text-[#F5EFE7]">
                      {assignedTbl ? (
                        <span className="flex items-center gap-1.5 text-[#3F7D5A] font-medium">
                          <Armchair className="h-3.5 w-3.5" />
                          <span>{assignedTbl.name}</span>
                        </span>
                      ) : (
                        <span className="text-[#A69591] italic">Chưa xếp bàn</span>
                      )}
                    </td>
                    <td className="p-4 text-[#2C2422] dark:text-[#F5EFE7]">
                      {g.plus_one ? "+1 người lớn" : "1 người"}
                      {g.children > 0 && ` • ${g.children} trẻ em`}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          g.rsvp_status === "CONFIRMED"
                            ? "success"
                            : g.rsvp_status === "PENDING"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {g.rsvp_status === "CONFIRMED" ? "Xác nhận đi" : g.rsvp_status === "PENDING" ? "Chờ phản hồi" : "Không đi"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyLink(g.rsvp_token)}
                          title="Copy link RSVP gửi Zalo/SMS"
                          className="inline-flex items-center gap-1 rounded-[8px] border border-[#EADBCE] bg-white px-2 py-1 text-[11px] text-[#8B5E5A] hover:bg-[#F5EFE7] transition-colors dark:bg-[#221C1B] dark:border-[#3A302E]"
                        >
                          {copiedToken === g.rsvp_token ? (
                            <>
                              <Check className="h-3 w-3 text-[#3F7D5A]" />
                              <span className="text-[#3F7D5A]">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy RSVP</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(g)}
                          title="Chỉnh sửa thông tin khách"
                          className="p-1 rounded text-[#A69591] hover:text-[#8B5E5A] hover:bg-[#F5EFE7]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          title="Xóa khách mời"
                          className="p-1 rounded text-[#A69591] hover:text-[#B44A4A] hover:bg-[#FDF2F2]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add or Edit Guest Modal */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingGuest)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGuest(null);
        }}
        title={editingGuest ? "Chỉnh sửa thông tin khách mời" : "Thêm khách mời mới"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Họ và tên khách mời <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Anh Trần Tuấn Tú"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Số điện thoại</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: tuantu@gmail.com"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Nhóm khách</label>
              <select
                value={groupName}
                onChange={(e) => setGroupName(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="Bạn bè">Bạn bè</option>
                <option value="Gia đình">Gia đình</option>
                <option value="Đồng nghiệp">Đồng nghiệp</option>
                <option value="VIP">Khách VIP</option>
                <option value="Nhà gái">Họ Nhà Gái</option>
                <option value="Nhà trai">Họ Nhà Trai</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Phía khách</label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="BOTH">Cả hai</option>
                <option value="BRIDE">Nhà Gái (Cô dâu)</option>
                <option value="GROOM">Nhà Trai (Chú rể)</option>
              </select>
            </div>
          </div>

          {/* Table assignment selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Bàn tiệc xếp chỗ</label>
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="">-- Chưa xếp bàn --</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Tối đa {t.capacity} khách)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Trạng thái RSVP</label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="PENDING">Chờ phản hồi (Pending)</option>
                <option value="CONFIRMED">Đã xác nhận tham dự (Confirmed)</option>
                <option value="DECLINED">Từ chối (Declined)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Số trẻ em đi kèm</label>
              <Input
                type="number"
                min={0}
                value={childrenCount}
                onChange={(e) => setChildrenCount(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Khẩu vị / Dị ứng</label>
              <Input
                value={mealPreference}
                onChange={(e) => setMealPreference(e.target.value)}
                placeholder="Ăn chay, không hải sản..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] cursor-pointer">
              <input
                type="checkbox"
                checked={plusOne}
                onChange={(e) => setPlusOne(e.target.checked)}
                className="h-4 w-4 rounded border-[#D6BE91] text-[#8B5E5A]"
              />
              <span>Cho phép đi kèm (+1 người lớn)</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Ghi chú</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bạn cùng đại học, trưởng họ..."
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingGuest(null);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingGuest ? "Lưu thay đổi" : "Lưu khách mời"}
            </Button>
          </div>
        </form>
      </Modal>

      <UpgradePlanModal
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        reason={upgradeReason}
      />
    </div>
  );
}
