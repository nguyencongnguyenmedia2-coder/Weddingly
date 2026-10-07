"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Globe,
  CreditCard,
  Settings,
  Activity,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink,
  Crown,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Eye,
  DollarSign,
  Save,
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Layers,
  Heart,
  UserPlus,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Link as LinkIcon,
  Palette,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import {
  SubscriptionOrder,
  SubscriptionOrderStatus,
  SubscriptionPlan,
  BankConfig,
} from "@/types/database";
import {
  AdminSystemService,
  SystemUserRecord,
  SystemWebsiteRecord,
  PlatformSystemConfig,
} from "@/services/admin-system.service";
import {
  SubscriptionService,
  AdminAuditLog,
} from "@/services/subscription.service";

export default function SuperAdminPortalPage() {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "users" | "websites" | "payments" | "settings" | "audit"
  >("overview");

  // State
  const [users, setUsers] = React.useState<SystemUserRecord[]>([]);
  const [websites, setWebsites] = React.useState<SystemWebsiteRecord[]>([]);
  const [orders, setOrders] = React.useState<SubscriptionOrder[]>([]);
  const [platformConfig, setPlatformConfig] = React.useState<PlatformSystemConfig>(
    AdminSystemService.getConfig()
  );
  const [bankConfig, setBankConfig] = React.useState<BankConfig>(
    SubscriptionService.getBankConfig()
  );
  const [auditLogs, setAuditLogs] = React.useState<AdminAuditLog[]>([]);

  // Search & Filters
  const [userSearch, setUserSearch] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState<string>("ALL");
  const [userPlanFilter, setUserPlanFilter] = React.useState<string>("ALL");
  const [userStatusFilter, setUserStatusFilter] = React.useState<string>("ALL");

  const [websiteSearch, setWebsiteSearch] = React.useState("");
  const [websiteStatusFilter, setWebsiteStatusFilter] = React.useState<string>("ALL");

  const [orderSearch, setOrderSearch] = React.useState("");
  const [orderStatusFilter, setOrderStatusFilter] = React.useState<string>("ALL");

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [newUserForm, setNewUserForm] = React.useState({
    email: "",
    full_name: "",
    phone: "",
    role: "USER" as "USER" | "PLANNER" | "ADMIN",
    plan: "FREE" as SubscriptionPlan,
    wedding_title: "",
  });

  const [editPlanUser, setEditPlanUser] = React.useState<SystemUserRecord | null>(null);
  const [newPlanChoice, setNewPlanChoice] = React.useState<SubscriptionPlan>("PRO");

  const [customDomainModalWeb, setCustomDomainModalWeb] = React.useState<SystemWebsiteRecord | null>(null);
  const [customDomainInput, setCustomDomainInput] = React.useState("");

  const [viewProofImage, setViewProofImage] = React.useState<string | null>(null);

  const [rejectOrderModal, setRejectOrderModal] = React.useState<SubscriptionOrder | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = React.useState("");

  // Feedback Toast
  const [actionAlert, setActionAlert] = React.useState<string | null>(null);

  const loadAllData = React.useCallback(() => {
    setUsers(AdminSystemService.getUsers());
    setWebsites(AdminSystemService.getWebsites());
    setOrders(SubscriptionService.getOrders());
    setPlatformConfig(AdminSystemService.getConfig());
    setBankConfig(SubscriptionService.getBankConfig());
    setAuditLogs(SubscriptionService.getAuditLogs());

    // Background sync with Next.js Server API
    SubscriptionService.syncFromApi()
      .then((syncedOrders) => {
        setOrders(syncedOrders);
        setUsers(AdminSystemService.getUsers());
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    loadAllData();

    // Sync tab from URL query param if present
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["overview", "users", "websites", "payments", "settings", "audit"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }

    const handleUsersUpdate = () => loadAllData();
    const handleWebsitesUpdate = () => loadAllData();
    const handleOrdersUpdate = () => loadAllData();
    const handleConfigUpdate = () => loadAllData();
    const handleTabSwitch = (e: any) => {
      if (e?.detail) setActiveTab(e.detail);
    };

    window.addEventListener("weddingly_users_changed", handleUsersUpdate);
    window.addEventListener("weddingly_websites_changed", handleWebsitesUpdate);
    window.addEventListener("weddingly_orders_changed", handleOrdersUpdate);
    window.addEventListener("weddingly_system_config_changed", handleConfigUpdate);
    window.addEventListener("storage", handleOrdersUpdate);
    window.addEventListener("admin_tab_switch", handleTabSwitch);

    return () => {
      window.removeEventListener("weddingly_users_changed", handleUsersUpdate);
      window.removeEventListener("weddingly_websites_changed", handleWebsitesUpdate);
      window.removeEventListener("weddingly_orders_changed", handleOrdersUpdate);
      window.removeEventListener("weddingly_system_config_changed", handleConfigUpdate);
      window.removeEventListener("storage", handleOrdersUpdate);
      window.removeEventListener("admin_tab_switch", handleTabSwitch);
    };
  }, [loadAllData]);

  const showToast = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 4000);
  };

  // Derived Stats
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === "ACTIVE").length;
  const proUsersCount = users.filter((u) => u.plan === "PRO").length;
  const vipUsersCount = users.filter((u) => u.plan === "VIP").length;

  const totalWebsitesCount = websites.length;
  const publishedWebsitesCount = websites.filter((w) => w.is_published).length;
  const totalWebsiteViews = websites.reduce((sum, w) => sum + (w.views_count || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const approvedOrders = orders.filter((o) => o.status === "APPROVED");
  const totalApprovedRevenue = approvedOrders.reduce((sum, o) => sum + o.amount, 0);

  // Filtered Users (Safe from undefined errors)
  const filteredUsers = React.useMemo(() => {
    return (users || []).filter((u) => {
      if (!u) return false;
      const q = (userSearch || "").trim().toLowerCase();
      const matchSearch =
        !q ||
        (u.full_name?.toLowerCase().includes(q) ?? false) ||
        (u.email?.toLowerCase().includes(q) ?? false) ||
        (u.phone?.includes(q) ?? false) ||
        (u.wedding_title?.toLowerCase().includes(q) ?? false);
      const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      const matchPlan = userPlanFilter === "ALL" || u.plan === userPlanFilter;
      const matchStatus = userStatusFilter === "ALL" || u.status === userStatusFilter;
      return matchSearch && matchRole && matchPlan && matchStatus;
    });
  }, [users, userSearch, userRoleFilter, userPlanFilter, userStatusFilter]);

  // Filtered Websites (Safe from undefined errors)
  const filteredWebsites = React.useMemo(() => {
    return (websites || []).filter((w) => {
      if (!w) return false;
      const q = (websiteSearch || "").trim().toLowerCase();
      const matchSearch =
        !q ||
        (w.title?.toLowerCase().includes(q) ?? false) ||
        (w.couple_names?.toLowerCase().includes(q) ?? false) ||
        (w.slug?.toLowerCase().includes(q) ?? false) ||
        (w.custom_domain?.toLowerCase().includes(q) ?? false);
      const matchStatus =
        websiteStatusFilter === "ALL" ||
        (websiteStatusFilter === "PUBLISHED" && w.is_published) ||
        (websiteStatusFilter === "DRAFT" && !w.is_published) ||
        (websiteStatusFilter === "CUSTOM_DOMAIN" && Boolean(w.custom_domain));
      return matchSearch && matchStatus;
    });
  }, [websites, websiteSearch, websiteStatusFilter]);

  // Filtered Orders (Safe from undefined errors, sorted newest first)
  const filteredOrders = React.useMemo(() => {
    return (orders || [])
      .filter((o) => {
        if (!o) return false;
        const q = (orderSearch || "").trim().toLowerCase();
        const matchSearch =
          !q ||
          (o.code?.toLowerCase().includes(q) ?? false) ||
          (o.user_name?.toLowerCase().includes(q) ?? false) ||
          (o.user_email?.toLowerCase().includes(q) ?? false) ||
          (o.user_phone?.includes(q) ?? false) ||
          (o.plan?.toLowerCase().includes(q) ?? false) ||
          (o.transfer_content?.toLowerCase().includes(q) ?? false);
        const matchStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, orderSearch, orderStatusFilter]);

  // User Actions
  const handleToggleUserStatus = (id: string, name: string) => {
    const res = AdminSystemService.toggleUserStatus(id);
    loadAllData();
    showToast(
      res?.status === "SUSPENDED"
        ? `Đã tạm khóa tài khoản: ${name}`
        : `Đã mở khóa hoạt động cho tài khoản: ${name}`
    );
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản ${name}?`)) {
      AdminSystemService.deleteUser(id);
      loadAllData();
      showToast(`Đã xóa tài khoản: ${name}`);
    }
  };

  const handleConfirmPlanChange = () => {
    if (!editPlanUser) return;
    AdminSystemService.updateUser(editPlanUser.id, { plan: newPlanChoice });
    setEditPlanUser(null);
    loadAllData();
    showToast(`Đã đổi gói tài khoản ${editPlanUser.full_name} sang ${newPlanChoice}!`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.full_name) {
      alert("Vui lòng điền đủ email và họ tên.");
      return;
    }
    AdminSystemService.createUser(newUserForm);
    setIsAddUserOpen(false);
    setNewUserForm({
      email: "",
      full_name: "",
      phone: "",
      role: "USER",
      plan: "FREE",
      wedding_title: "",
    });
    loadAllData();
    showToast(`Đã tạo thành công tài khoản mới: ${newUserForm.full_name}`);
  };

  // Website Actions
  const handleToggleWebsiteStatus = (id: string, title: string) => {
    const res = AdminSystemService.toggleWebsiteStatus(id);
    loadAllData();
    showToast(
      res?.is_published
        ? `Đã xuất bản hiển thị website: ${title}`
        : `Đã chuyển về bản nháp / tạm ngưng website: ${title}`
    );
  };

  const handleSaveCustomDomain = () => {
    if (!customDomainModalWeb) return;
    AdminSystemService.updateWebsite(customDomainModalWeb.id, {
      custom_domain: customDomainInput.trim() || undefined,
    });
    setCustomDomainModalWeb(null);
    loadAllData();
    showToast(`Đã cập nhật tên miền riêng cho website: ${customDomainModalWeb.title}!`);
  };

  const handleDeleteWebsite = (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa trang website "${title}" khỏi hệ thống?`)) {
      AdminSystemService.deleteWebsite(id);
      loadAllData();
      showToast(`Đã xóa trang website: ${title}`);
    }
  };

  // Payment Actions
  const handleApproveOrder = (order: SubscriptionOrder) => {
    SubscriptionService.approveOrder(order.id, "Super Admin");
    loadAllData();
    showToast(`Đã phê duyệt thành công đơn ${order.code}! Gói ${order.plan} đã được kích hoạt.`);
  };

  const handleConfirmRejectOrder = () => {
    if (!rejectOrderModal) return;
    SubscriptionService.rejectOrder(rejectOrderModal.id, rejectReasonInput, "Super Admin");
    setRejectOrderModal(null);
    loadAllData();
    showToast(`Đã từ chối đơn hàng ${rejectOrderModal.code}`);
  };

  // Settings Actions
  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    AdminSystemService.updateConfig(platformConfig);
    SubscriptionService.saveBankConfig(bankConfig);
    loadAllData();
    showToast("Đã lưu thành công cấu hình nền tảng SaaS & Ngân hàng!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {actionAlert && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#D6BE91] text-[#14100F] font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Hero Welcome & Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-[#201A18] via-[#2A2220] to-[#1C1615] border border-[#3A302E] gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5EFE7]">
              Bảng Điều Khiển Hệ Thống Toàn Diện
            </h1>
            <Badge variant="champagne" className="bg-[#D6BE91]/20 text-[#D6BE91] border-[#D6BE91]/40 text-[10px]">
              SUPER ADMIN
            </Badge>
          </div>
          <p className="text-xs text-[#A69591] max-w-2xl">
            Quản trị tập trung người dùng, hệ thống website đám cưới xuất bản, đơn thanh toán nâng cấp và cấu hình nền tảng SaaS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            className="border-[#3A302E] text-[#F5EFE7] hover:bg-white/5 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Đồng bộ dữ liệu</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddUserOpen(true)}
            className="bg-gradient-to-r from-[#D6BE91] to-[#B39366] text-[#14100F] font-extrabold text-xs gap-1.5 shadow-md hover:brightness-110"
          >
            <UserPlus className="h-4 w-4" />
            <span>Thêm tài khoản mới</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation Ribbon */}
      <div className="flex items-center gap-2 border-b border-[#2C2422] overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Tổng Quan Hệ Thống", icon: Activity },
          { id: "users", label: `Người Dùng (${totalUsersCount})`, icon: Users },
          { id: "websites", label: `Website Đám Cưới (${totalWebsitesCount})`, icon: Globe },
          {
            id: "payments",
            label: `Duyệt Thanh Toán ${pendingOrders.length > 0 ? `(${pendingOrders.length})` : ""}`,
            icon: CreditCard,
            badge: pendingOrders.length,
          },
          { id: "settings", label: "Cấu Hình SaaS & Ngân Hàng", icon: Settings },
          { id: "audit", label: "Nhật Ký An Ninh (Audit)", icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#201A18] text-[#D6BE91] border-t-2 border-[#D6BE91] shadow-xs"
                  : "text-[#A69591] hover:text-[#F5EFE7] hover:bg-[#1E1716]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-900 text-[10px] font-extrabold animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Urgent Pending Banner */}
          {pendingOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-stone-900 font-bold">
                  <Clock className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-sm text-amber-300">
                    Có {pendingOrders.length} đơn hàng chuyển khoản đang chờ duyệt!
                  </p>
                  <p className="text-[11px] text-amber-200/80">
                    Khách hàng đang chờ đối soát để kích hoạt tài khoản PRO/VIP.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => setActiveTab("payments")}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer shrink-0"
              >
                Mở bảng duyệt thanh toán ngay &rarr;
              </Button>
            </div>
          )}

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Doanh thu */}
            <div className="p-5 rounded-2xl bg-[#1C1615] border border-[#2C2422] hover:border-[#D6BE91] transition-all">
              <div className="flex items-center justify-between text-xs font-semibold text-[#A69591]">
                <span>Tổng doanh thu gói</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="font-serif text-3xl font-bold text-emerald-400 mt-2">
                {totalApprovedRevenue.toLocaleString("vi-VN")} ₫
              </p>
              <p className="text-[11px] text-[#80726F] mt-1">
                Từ {approvedOrders.length} giao dịch thành công
              </p>
            </div>

            {/* 2. Đơn chờ duyệt */}
            <div
              onClick={() => setActiveTab("payments")}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                pendingOrders.length > 0
                  ? "bg-amber-950/20 border-amber-500/50 hover:border-amber-400"
                  : "bg-[#1C1615] border-[#2C2422] hover:border-[#D6BE91]"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#A69591]">
                <span>Thanh toán chờ duyệt</span>
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="font-serif text-3xl font-bold text-amber-400">
                  {pendingOrders.length}
                </p>
                {pendingOrders.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-900 text-[10px] font-bold animate-pulse">
                    CẦN XỬ LÝ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#80726F] mt-1">Bấm để duyệt kích hoạt cho khách</p>
            </div>

            {/* 3. Người dùng */}
            <div
              onClick={() => setActiveTab("users")}
              className="p-5 rounded-2xl bg-[#1C1615] border border-[#2C2422] hover:border-[#D6BE91] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#A69591]">
                <span>Người dùng & Cặp đôi</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="font-serif text-3xl font-bold text-[#F5EFE7] mt-2">
                {totalUsersCount}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">
                {vipUsersCount} VIP • {proUsersCount} PRO
              </p>
            </div>

            {/* 4. Websites */}
            <div
              onClick={() => setActiveTab("websites")}
              className="p-5 rounded-2xl bg-[#1C1615] border border-[#2C2422] hover:border-[#D6BE91] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#A69591]">
                <span>Website Đám Cưới</span>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <Globe className="h-4 w-4" />
                </div>
              </div>
              <p className="font-serif text-3xl font-bold text-[#D6BE91] mt-2">
                {publishedWebsitesCount} <span className="text-xs text-[#80726F]">/ {totalWebsitesCount}</span>
              </p>
              <p className="text-[11px] text-[#80726F] mt-1">
                {totalWebsiteViews.toLocaleString("vi-VN")} lượt truy cập công khai
              </p>
            </div>
          </div>

          {/* Quick Actions & Pending Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Pending Payments Urgent Alert Box */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-[#1C1615] border border-[#2C2422] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <h3 className="font-serif text-base font-bold text-[#F5EFE7]">
                      Hàng đợi Duyệt Thanh Toán ({pendingOrders.length})
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("payments")}
                    className="text-xs text-[#D6BE91] border-[#3A302E] hover:bg-white/5"
                  >
                    Xem tất cả &rarr;
                  </Button>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#80726F] border border-dashed border-[#2C2422] rounded-xl">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    Tất cả yêu cầu thanh toán đã được xử lý hoàn tất! Không có đơn chờ.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-xl bg-[#241D1B] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400">
                              {order.code}
                            </span>
                            <Badge variant="champagne" className="text-[9px]">
                              {order.plan === "VIP" ? "Gói VIP Luxury" : "Gói PRO"}
                            </Badge>
                          </div>
                          <p className="font-semibold text-[#F5EFE7] mt-0.5">
                            {order.user_name} ({order.user_email})
                          </p>
                          <p className="text-[10px] text-[#A69591]">
                            {order.amount.toLocaleString("vi-VN")} ₫ • {new Date(order.created_at).toLocaleString("vi-VN")}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {order.proof_image_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewProofImage(order.proof_image_url || null)}
                              className="border-[#3A302E] text-xs text-[#D6BE91] hover:bg-white/5 py-1 px-2.5"
                            >
                              Xem bill
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApproveOrder(order)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1 px-3 shadow-xs"
                          >
                            Duyệt ngay
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Platform System Health Status */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#1C1615] border border-[#2C2422] space-y-3 text-xs">
                <h3 className="font-serif text-base font-bold text-[#F5EFE7] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Trạng Thái Kỹ Thuật Nền Tảng
                </h3>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#2C2422]">
                    <span className="text-[#A69591]">Cơ sở dữ liệu Supabase:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Trực tuyến (99.99%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#2C2422]">
                    <span className="text-[#A69591]">Máy chủ Website SSR/Edge:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Vercel Next.js OK
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#2C2422]">
                    <span className="text-[#A69591]">Emma AI Assistant API:</span>
                    <span className="text-amber-400 font-semibold">Gemini Flash Sẵn sàng</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#2C2422]">
                    <span className="text-[#A69591]">Cổng thanh toán VietQR:</span>
                    <span className="text-emerald-400 font-semibold">Napas 24/7 Hoạt động</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[#A69591]">Chế độ bảo trì hệ thống:</span>
                    <span className={platformConfig.maintenance_mode ? "text-red-400 font-bold" : "text-[#A69591]"}>
                      {platformConfig.maintenance_mode ? "ĐANG BẬT" : "Đang tắt (Bình thường)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#1C1615] border border-[#2C2422]">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80726F]" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, sđt, đám cưới..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#14100F] border border-[#2C2422] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5EFE7] placeholder:text-[#80726F] focus:outline-none focus:border-[#D6BE91]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <select
                value={userPlanFilter}
                onChange={(e) => setUserPlanFilter(e.target.value)}
                className="bg-[#14100F] border border-[#2C2422] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFE7]"
              >
                <option value="ALL">Gói: Tất cả</option>
                <option value="VIP">VIP Kim Cương</option>
                <option value="PRO">Hoàn Mỹ PRO</option>
                <option value="FREE">Miễn phí</option>
              </select>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-[#14100F] border border-[#2C2422] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFE7]"
              >
                <option value="ALL">Vai trò: Tất cả</option>
                <option value="USER">User (Cặp đôi)</option>
                <option value="PLANNER">Wedding Planner</option>
                <option value="ADMIN">Super Admin</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-[#14100F] border border-[#2C2422] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFE7]"
              >
                <option value="ALL">Trạng thái: Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="SUSPENDED">Đã khóa</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-[#2C2422] bg-[#1C1615] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#14100F] text-[#A69591] border-b border-[#2C2422]">
                  <tr>
                    <th className="p-3.5 font-semibold">Tài khoản & Email</th>
                    <th className="p-3.5 font-semibold">Đám cưới liên kết</th>
                    <th className="p-3.5 font-semibold">Vai trò</th>
                    <th className="p-3.5 font-semibold">Gói cước</th>
                    <th className="p-3.5 font-semibold">Trạng thái</th>
                    <th className="p-3.5 font-semibold">Ngày tạo</th>
                    <th className="p-3.5 font-semibold text-right">Hành động Quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2422]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#80726F]">
                        Không tìm thấy tài khoản nào khớp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#241D1B] transition-colors">
                        {/* Account */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5E5A] to-[#6A4643] text-[#D6BE91] font-bold text-xs uppercase shrink-0">
                              {user.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#F5EFE7]">{user.full_name}</p>
                              <p className="text-[11px] text-[#A69591]">{user.email}</p>
                              {user.phone && (
                                <p className="text-[10px] text-[#D6BE91] flex items-center gap-1 mt-0.5">
                                  <Phone className="h-2.5 w-2.5" /> {user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Wedding */}
                        <td className="p-3.5 text-[#F5EFE7]">
                          <p className="font-medium">{user.wedding_title || "Chưa tạo tiệc"}</p>
                          {user.wedding_slug && (
                            <Link
                              href={`/w/${user.wedding_slug}`}
                              target="_blank"
                              className="text-[10px] text-[#D6BE91] hover:underline flex items-center gap-0.5"
                            >
                              /w/{user.wedding_slug} <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                        </td>

                        {/* Role */}
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              user.role === "ADMIN"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : user.role === "PLANNER"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-white/10 text-stone-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Plan */}
                        <td className="p-3.5">
                          {user.plan === "VIP" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-900 font-extrabold text-[10px]">
                              <Crown className="h-3 w-3 fill-stone-900" /> VIP
                            </span>
                          )}
                          {user.plan === "PRO" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8B5E5A] text-white font-bold text-[10px]">
                              <Sparkles className="h-3 w-3 text-[#D6BE91]" /> PRO
                            </span>
                          )}
                          {user.plan === "FREE" && (
                            <span className="text-[10px] text-[#80726F] bg-white/5 px-2 py-0.5 rounded">
                              Miễn phí
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {user.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Đã khóa
                            </span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="p-3.5 text-[#80726F] text-[11px]">
                          {new Date(user.created_at).toLocaleDateString("vi-VN")}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right space-x-1.5">
                          {/* Đổi gói */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditPlanUser(user);
                              setNewPlanChoice(user.plan);
                            }}
                            className="border-[#3A302E] text-[#D6BE91] hover:bg-white/5 text-[11px] py-1 px-2.5"
                            title="Nâng cấp hoặc đổi gói cước"
                          >
                            Đổi gói
                          </Button>

                          {/* Khóa / Mở khóa */}
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(user.id, user.full_name)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-[#A69591] hover:text-white transition-colors"
                            title={user.status === "ACTIVE" ? "Khóa tài khoản này" : "Mở khóa tài khoản"}
                          >
                            {user.status === "ACTIVE" ? (
                              <Lock className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                            )}
                          </button>

                          {/* Xóa */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            className="p-1.5 rounded-lg hover:bg-red-950/40 text-[#80726F] hover:text-red-400 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: WEBSITES MANAGEMENT */}
      {activeTab === "websites" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#1C1615] border border-[#2C2422]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80726F]" />
              <input
                type="text"
                placeholder="Tìm website theo tên cặp đôi, slug, domain riêng..."
                value={websiteSearch}
                onChange={(e) => setWebsiteSearch(e.target.value)}
                className="w-full bg-[#14100F] border border-[#2C2422] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5EFE7] placeholder:text-[#80726F] focus:outline-none focus:border-[#D6BE91]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <select
                value={websiteStatusFilter}
                onChange={(e) => setWebsiteStatusFilter(e.target.value)}
                className="bg-[#14100F] border border-[#2C2422] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFE7]"
              >
                <option value="ALL">Trạng thái: Tất cả</option>
                <option value="PUBLISHED">Đã xuất bản (Online)</option>
                <option value="DRAFT">Bản nháp (Draft)</option>
                <option value="CUSTOM_DOMAIN">Có tên miền riêng</option>
              </select>
            </div>
          </div>

          {/* Websites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWebsites.length === 0 ? (
              <div className="col-span-full p-12 text-center text-[#80726F] bg-[#1C1615] rounded-2xl border border-[#2C2422]">
                Không tìm thấy website nào phù hợp.
              </div>
            ) : (
              filteredWebsites.map((web) => (
                <div
                  key={web.id}
                  className="p-5 rounded-2xl bg-[#1C1615] border border-[#2C2422] hover:border-[#D6BE91] transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#F5EFE7] line-clamp-1">
                          {web.title}
                        </h4>
                        <p className="text-xs text-[#D6BE91] font-medium">{web.couple_names}</p>
                      </div>
                      <Badge
                        variant={web.is_published ? "success" : "default"}
                        className="text-[10px] shrink-0"
                      >
                        {web.is_published ? "ONLINE" : "DRAFT"}
                      </Badge>
                    </div>

                    {/* Links & Domain */}
                    <div className="p-2.5 rounded-xl bg-[#14100F] border border-[#2C2422] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#80726F]">Đường dẫn:</span>
                        <Link
                          href={`/w/${web.slug}`}
                          target="_blank"
                          className="font-mono text-[#D6BE91] hover:underline flex items-center gap-1"
                        >
                          /w/{web.slug} <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      {web.custom_domain ? (
                        <div className="flex items-center justify-between text-emerald-400">
                          <span className="text-[#80726F]">Tên miền riêng:</span>
                          <span className="font-mono font-bold flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {web.custom_domain}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[#80726F]">
                          <span>Tên miền riêng:</span>
                          <span>Chưa cấu hình</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[#80726F]">
                        <span>Theme phong cách:</span>
                        <span className="capitalize text-[#F5EFE7]">{web.theme}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                      <div className="p-2 rounded-lg bg-[#241D1B]">
                        <span className="text-[10px] text-[#80726F] block">Lượt xem</span>
                        <span className="font-bold text-[#F5EFE7]">{web.views_count}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#241D1B]">
                        <span className="text-[10px] text-[#80726F] block">RSVP</span>
                        <span className="font-bold text-emerald-400">{web.rsvp_count}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#241D1B]">
                        <span className="text-[10px] text-[#80726F] block">Lời chúc</span>
                        <span className="font-bold text-amber-400">{web.wishes_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#2C2422] flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCustomDomainModalWeb(web);
                        setCustomDomainInput(web.custom_domain || "");
                      }}
                      className="border-[#3A302E] text-xs text-[#D6BE91] hover:bg-white/5 py-1 px-2.5"
                    >
                      <LinkIcon className="h-3 w-3 mr-1" /> Domain
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleWebsiteStatus(web.id, web.title)}
                        className={`text-xs py-1 px-2.5 ${
                          web.is_published
                            ? "border-amber-500/40 text-amber-400 hover:bg-amber-950/20"
                            : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/20"
                        }`}
                      >
                        {web.is_published ? "Tạm ngưng" : "Xuất bản"}
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWebsite(web.id, web.title)}
                        className="p-1.5 rounded-lg text-[#80726F] hover:text-red-400 hover:bg-red-950/20 transition-colors"
                        title="Xóa website"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: PAYMENTS & BILLING */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#1C1615] border border-[#2C2422]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80726F]" />
              <input
                type="text"
                placeholder="Tìm mã đơn (WD-...), tên khách, email, SĐT..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-[#14100F] border border-[#2C2422] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5EFE7] placeholder:text-[#80726F] focus:outline-none focus:border-[#D6BE91]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    orderStatusFilter === status
                      ? status === "PENDING"
                        ? "bg-amber-500 text-stone-900 font-bold"
                        : "bg-[#D6BE91] text-[#14100F] font-bold"
                      : "bg-[#14100F] text-[#A69591] hover:text-white"
                  }`}
                >
                  {status === "ALL"
                    ? `Tất cả (${orders.length})`
                    : status === "PENDING"
                    ? `Chờ duyệt (${pendingOrders.length})`
                    : status === "APPROVED"
                    ? `Đã duyệt (${approvedOrders.length})`
                    : "Từ chối"}
                </button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={loadAllData}
                className="border-[#3A302E] text-xs text-[#D6BE91] hover:bg-white/5 gap-1.5 shrink-0 ml-1 py-1 px-2.5"
                title="Làm mới danh sách đơn thanh toán"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Làm mới</span>
              </Button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl border border-[#2C2422] bg-[#1C1615] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#14100F] text-[#A69591] border-b border-[#2C2422]">
                  <tr>
                    <th className="p-3.5 font-semibold">Mã đơn & Thời gian</th>
                    <th className="p-3.5 font-semibold">Khách hàng / Tiệc cưới</th>
                    <th className="p-3.5 font-semibold">Gói nâng cấp</th>
                    <th className="p-3.5 font-semibold">Số tiền</th>
                    <th className="p-3.5 font-semibold">Biên lai / Bill</th>
                    <th className="p-3.5 font-semibold">Trạng thái</th>
                    <th className="p-3.5 font-semibold text-right">Thao tác Duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2422]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#80726F]">
                        Không tìm thấy yêu cầu thanh toán nào.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-[#241D1B] transition-colors ${
                          order.status === "PENDING" ? "bg-amber-950/15" : ""
                        }`}
                      >
                        {/* Mã đơn */}
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-[#D6BE91] block">
                            {order.code}
                          </span>
                          <span className="text-[11px] text-[#80726F]">
                            {new Date(order.created_at).toLocaleString("vi-VN")}
                          </span>
                        </td>

                        {/* Khách hàng */}
                        <td className="p-3.5">
                          <p className="font-semibold text-[#F5EFE7]">{order.user_name}</p>
                          <p className="text-[11px] text-[#A69591]">{order.user_email}</p>
                          {order.user_phone && (
                            <p className="text-[10px] text-[#D6BE91]">{order.user_phone}</p>
                          )}
                          {order.notes && (
                            <p className="text-[10px] italic text-[#80726F] mt-0.5 max-w-[200px] truncate">
                              &ldquo;{order.notes}&rdquo;
                            </p>
                          )}
                        </td>

                        {/* Gói */}
                        <td className="p-3.5">
                          {order.plan === "VIP" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-900 font-extrabold text-[10px]">
                              <Crown className="h-3 w-3 fill-stone-900" /> VIP LUXURY
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8B5E5A] text-white font-bold text-[10px]">
                              <Sparkles className="h-3 w-3 text-[#D6BE91]" /> PRO
                            </span>
                          )}
                        </td>

                        {/* Tiền */}
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-[#F5EFE7] block">
                            {order.amount.toLocaleString("vi-VN")} ₫
                          </span>
                          <span className="text-[10px] text-[#80726F] uppercase">
                            {order.payment_method}
                          </span>
                        </td>

                        {/* Bill */}
                        <td className="p-3.5">
                          {order.proof_image_url ? (
                            <button
                              type="button"
                              onClick={() => setViewProofImage(order.proof_image_url || null)}
                              className="flex items-center gap-1.5 p-1 rounded-lg border border-[#3A302E] hover:border-[#D6BE91] bg-[#14100F] text-[#D6BE91] text-[10px] font-semibold"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={order.proof_image_url}
                                alt="Bill"
                                className="h-7 w-7 object-cover rounded"
                              />
                              <span>Xem bill</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#80726F]">Không kèm</span>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td className="p-3.5">
                          {order.status === "PENDING" && (
                            <Badge variant="warning" className="animate-pulse">
                              Chờ duyệt
                            </Badge>
                          )}
                          {order.status === "APPROVED" && (
                            <Badge variant="success">Đã duyệt</Badge>
                          )}
                          {order.status === "REJECTED" && (
                            <div>
                              <Badge variant="danger">Từ chối</Badge>
                              {order.rejection_reason && (
                                <p className="text-[10px] text-red-400 mt-0.5 max-w-[120px] truncate" title={order.rejection_reason}>
                                  {order.rejection_reason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right space-x-1.5">
                          {order.status === "PENDING" ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleApproveOrder(order)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] py-1 px-3 shadow-xs"
                              >
                                Duyệt & Nâng cấp
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectOrderModal(order);
                                  setRejectReasonInput("Số tiền chuyển khoản chưa đủ hoặc chưa nhận được tiền.");
                                }}
                                className="border-red-500/40 text-red-400 hover:bg-red-950/20 text-[11px] py-1 px-2.5"
                              >
                                Từ chối
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-[#80726F]">
                              {order.status === "APPROVED" ? "Hoàn tất" : "Đã đóng"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === "settings" && (
        <form onSubmit={handleSavePlatformConfig} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cài đặt SaaS */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-[#1C1615] border border-[#2C2422] space-y-4 text-xs">
              <h3 className="font-serif text-base font-bold text-[#F5EFE7] flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#D6BE91]" />
                Cài Đặt Vận Hành Nền Tảng (SaaS Config)
              </h3>

              {/* Maintenance Mode */}
              <div className="p-3.5 rounded-xl bg-[#14100F] border border-[#2C2422] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#F5EFE7]">Chế độ Bảo trì Hệ thống (Maintenance Mode)</p>
                    <p className="text-[10px] text-[#80726F]">Khóa tạm thời các tương tác để nâng cấp server</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPlatformConfig({
                        ...platformConfig,
                        maintenance_mode: !platformConfig.maintenance_mode,
                      })
                    }
                    className="cursor-pointer"
                  >
                    {platformConfig.maintenance_mode ? (
                      <ToggleRight className="h-8 w-8 text-red-400" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-[#80726F]" />
                    )}
                  </button>
                </div>
                {platformConfig.maintenance_mode && (
                  <div>
                    <label className="block mb-1 text-[#A69591]">Thông điệp bảo trì hiển thị:</label>
                    <input
                      type="text"
                      value={platformConfig.maintenance_message}
                      onChange={(e) =>
                        setPlatformConfig({ ...platformConfig, maintenance_message: e.target.value })
                      }
                      className="w-full bg-[#201A18] border border-[#3A302E] rounded-lg p-2 text-xs text-[#F5EFE7]"
                    />
                  </div>
                )}
              </div>

              {/* Banner Thông báo toàn hệ thống */}
              <div className="p-3.5 rounded-xl bg-[#14100F] border border-[#2C2422] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#F5EFE7]">Thanh Thông Báo Toàn Trang (Announcement Banner)</p>
                    <p className="text-[10px] text-[#80726F]">Hiển thị trên đầu trang cho tất cả người dùng</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPlatformConfig({
                        ...platformConfig,
                        announcement_banner: {
                          ...platformConfig.announcement_banner,
                          enabled: !platformConfig.announcement_banner.enabled,
                        },
                      })
                    }
                    className="cursor-pointer"
                  >
                    {platformConfig.announcement_banner.enabled ? (
                      <ToggleRight className="h-8 w-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-[#80726F]" />
                    )}
                  </button>
                </div>

                <div>
                  <label className="block mb-1 text-[#A69591]">Nội dung thông báo:</label>
                  <input
                    type="text"
                    value={platformConfig.announcement_banner.text}
                    onChange={(e) =>
                      setPlatformConfig({
                        ...platformConfig,
                        announcement_banner: {
                          ...platformConfig.announcement_banner,
                          text: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#201A18] border border-[#3A302E] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[#F5EFE7]">
                    Giới hạn câu hỏi Emma AI/ngày (Gói Free):
                  </label>
                  <input
                    type="number"
                    value={platformConfig.ai_daily_limit_free}
                    onChange={(e) =>
                      setPlatformConfig({
                        ...platformConfig,
                        ai_daily_limit_free: parseInt(e.target.value) || 10,
                      })
                    }
                    className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-[#F5EFE7]">
                    Dung lượng ảnh tối đa (MB):
                  </label>
                  <input
                    type="number"
                    value={platformConfig.max_upload_size_mb}
                    onChange={(e) =>
                      setPlatformConfig({
                        ...platformConfig,
                        max_upload_size_mb: parseInt(e.target.value) || 50,
                      })
                    }
                    className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
              </div>

              {/* Support Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[#F5EFE7]">Hotline hỗ trợ:</label>
                  <input
                    type="text"
                    value={platformConfig.support_hotline}
                    onChange={(e) =>
                      setPlatformConfig({ ...platformConfig, support_hotline: e.target.value })
                    }
                    className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-[#F5EFE7]">Email hỗ trợ:</label>
                  <input
                    type="email"
                    value={platformConfig.support_email}
                    onChange={(e) =>
                      setPlatformConfig({ ...platformConfig, support_email: e.target.value })
                    }
                    className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cấu hình Ngân hàng & Giá */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-[#1C1615] border border-[#2C2422] space-y-4 text-xs">
              <h3 className="font-serif text-base font-bold text-[#F5EFE7] flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#D6BE91]" />
                Cấu Hình Cổng Thanh Toán VietQR & Giá Gói
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[#F5EFE7]">Ngân hàng thụ hưởng:</label>
                  <input
                    type="text"
                    value={bankConfig.bank_name}
                    onChange={(e) => setBankConfig({ ...bankConfig, bank_name: e.target.value })}
                    className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-[#F5EFE7]">Mã VietQR BIN:</label>
                  <input
                    type="text"
                    value={bankConfig.bank_code}
                    onChange={(e) => setBankConfig({ ...bankConfig, bank_code: e.target.value })}
                    className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[#F5EFE7]">Số tài khoản nhận tiền:</label>
                  <input
                    type="text"
                    value={bankConfig.account_number}
                    onChange={(e) =>
                      setBankConfig({ ...bankConfig, account_number: e.target.value })
                    }
                    className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-[#F5EFE7]">Tên chủ tài khoản:</label>
                  <input
                    type="text"
                    value={bankConfig.account_name}
                    onChange={(e) =>
                      setBankConfig({ ...bankConfig, account_name: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#2C2422]">
                <p className="font-bold text-[#D6BE91] mb-2 uppercase tracking-wide text-[10px]">
                  Giá Cước Gói Nâng Cấp (VNĐ)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-[#F5EFE7]">
                      Giá Gói Hoàn Mỹ (PRO):
                    </label>
                    <input
                      type="number"
                      value={bankConfig.pro_price}
                      onChange={(e) =>
                        setBankConfig({ ...bankConfig, pro_price: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-[#F5EFE7]">
                      Giá Gói Kim Cương (VIP):
                    </label>
                    <input
                      type="number"
                      value={bankConfig.vip_price}
                      onChange={(e) =>
                        setBankConfig({ ...bankConfig, vip_price: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-[#14100F] border border-[#2C2422] rounded-lg p-2 text-xs text-[#F5EFE7]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-gradient-to-r from-[#D6BE91] to-[#B39366] text-[#14100F] font-bold text-xs gap-1.5 shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu Tất Cả Cấu Hình Hệ Thống</span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-[#2C2422] bg-[#1C1615] overflow-hidden">
          <div className="p-4 border-b border-[#2C2422] flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-[#F5EFE7] flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#D6BE91]" />
              Nhật Ký An Ninh & Kiểm Toán (Audit Logs)
            </h3>
            <span className="text-[11px] text-[#80726F]">Lưu vết mọi hành động của quản trị viên</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#14100F] text-[#A69591] border-b border-[#2C2422]">
                <tr>
                  <th className="p-3.5 font-semibold">Thời gian</th>
                  <th className="p-3.5 font-semibold">Quản trị viên</th>
                  <th className="p-3.5 font-semibold">Hành động</th>
                  <th className="p-3.5 font-semibold">Đối tượng</th>
                  <th className="p-3.5 font-semibold">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2422]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#241D1B]">
                    <td className="p-3.5 text-[#80726F] font-mono whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-3.5 font-semibold text-[#F5EFE7]">{log.actor}</td>
                    <td className="p-3.5">
                      <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-[#D6BE91]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#F5EFE7] font-medium">{log.entity}</td>
                    <td className="p-3.5 text-[#A69591]">{log.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New User */}
      {isAddUserOpen && (
        <Modal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          title="Tạo Tài Khoản Người Dùng Mới"
          description="Thêm tài khoản quản trị viên, wedding planner hoặc cặp đôi vào hệ thống"
          maxWidth="md"
        >
          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-[#2C2422] dark:text-[#F5EFE7]">
                Họ và tên:
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn A & Lê Thị B"
                value={newUserForm.full_name}
                onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                className="w-full rounded-xl border border-[#EADBCE] dark:border-[#3A302E] p-2.5 text-xs text-[#2C2422] dark:text-[#F5EFE7] dark:bg-[#14100F]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-[#2C2422] dark:text-[#F5EFE7]">
                Email đăng nhập:
              </label>
              <input
                type="email"
                required
                placeholder="VD: user@weddingly.vn"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="w-full rounded-xl border border-[#EADBCE] dark:border-[#3A302E] p-2.5 text-xs text-[#2C2422] dark:text-[#F5EFE7] dark:bg-[#14100F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-[#2C2422] dark:text-[#F5EFE7]">
                  Số điện thoại:
                </label>
                <input
                  type="tel"
                  placeholder="0988 888 888"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#EADBCE] dark:border-[#3A302E] p-2.5 text-xs text-[#2C2422] dark:text-[#F5EFE7] dark:bg-[#14100F]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-[#2C2422] dark:text-[#F5EFE7]">
                  Tên tiệc cưới:
                </label>
                <input
                  type="text"
                  placeholder="VD: Lễ Thành Hôn A & B"
                  value={newUserForm.wedding_title}
                  onChange={(e) => setNewUserForm({ ...newUserForm, wedding_title: e.target.value })}
                  className="w-full rounded-xl border border-[#EADBCE] dark:border-[#3A302E] p-2.5 text-xs text-[#2C2422] dark:text-[#F5EFE7] dark:bg-[#14100F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-[#2C2422] dark:text-[#F5EFE7]">
                  Vai trò hệ thống:
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full rounded-xl border border-[#EADBCE] dark:border-[#3A302E] p-2.5 text-xs text-[#2C2422] dark:text-[#F5EFE7] dark:bg-[#14100F]"
                >
                  <option value="USER">User (Cặp đôi cưới)</option>
                  <option value="PLANNER">Wedding Planner Agency</option>
                  <option value="ADMIN">Super Administrator</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1 text-[#2C2422] dark:text-[#F5EFE7]">
                  Gói dịch vụ kích hoạt:
                </label>
                <select
                  value={newUserForm.plan}
                  onChange={(e) => setNewUserForm({ ...newUserForm, plan: e.target.value as any })}
                  className="w-full rounded-xl border border-[#EADBCE] dark:border-[#3A302E] p-2.5 text-xs text-[#2C2422] dark:text-[#F5EFE7] dark:bg-[#14100F]"
                >
                  <option value="FREE">Gói Miễn Phí (0đ)</option>
                  <option value="PRO">Gói Hoàn Mỹ PRO (499k)</option>
                  <option value="VIP">Gói Kim Cương VIP (999k)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EADBCE] dark:border-[#3A302E]">
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="text-xs">
                Hủy
              </Button>
              <Button variant="primary" type="submit" className="bg-[#14100F] text-[#D6BE91] text-xs font-bold">
                Tạo tài khoản
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Change Plan */}
      {editPlanUser && (
        <Modal
          isOpen={Boolean(editPlanUser)}
          onClose={() => setEditPlanUser(null)}
          title="Đổi Gói Dịch Vụ Cho Tài Khoản"
          description={`Tài khoản: ${editPlanUser.full_name} (${editPlanUser.email})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#80726F]">
              Chọn gói dịch vụ để nâng cấp hoặc chuyển đổi ngay lập tức cho người dùng này:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(["FREE", "PRO", "VIP"] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setNewPlanChoice(plan)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    newPlanChoice === plan
                      ? "border-[#8B5E5A] bg-[#8B5E5A]/10 font-bold text-[#8B5E5A] dark:text-[#D6BE91]"
                      : "border-[#EADBCE] dark:border-[#3A302E] hover:bg-black/5"
                  }`}
                >
                  <span className="block text-sm font-bold">{plan}</span>
                  <span className="text-[10px] text-[#80726F]">
                    {plan === "VIP" ? "Kim Cương" : plan === "PRO" ? "Hoàn Mỹ" : "Miễn Phí"}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EADBCE] dark:border-[#3A302E]">
              <Button variant="outline" onClick={() => setEditPlanUser(null)} className="text-xs">
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmPlanChange}
                className="bg-[#14100F] text-[#D6BE91] text-xs font-bold"
              >
                Cập nhật gói ngay
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Custom Domain */}
      {customDomainModalWeb && (
        <Modal
          isOpen={Boolean(customDomainModalWeb)}
          onClose={() => setCustomDomainModalWeb(null)}
          title="Cấu Hình Tên Miền Riêng (Custom Domain)"
          description={`Website: ${customDomainModalWeb.title}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#80726F]">
              Nhập tên miền riêng (ví dụ: <code>minhanh-quocminh.com</code> hoặc <code>damcuoituannang.vn</code>) để trỏ trực tiếp về website cưới của cặp đôi.
            </p>

            <div>
              <label className="font-semibold block mb-1 text-[#2C2422] dark:text-[#F5EFE7]">
                Tên miền riêng:
              </label>
              <input
                type="text"
                placeholder="VD: minhanhquocminh.com"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                className="w-full rounded-xl border border-[#EADBCE] dark:border-[#3A302E] p-2.5 text-xs text-[#2C2422] dark:text-[#F5EFE7] dark:bg-[#14100F]"
              />
              <p className="text-[10px] text-[#80726F] mt-1">
                Để trống nếu muốn gỡ bỏ tên miền riêng và dùng subdomain mặc định.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EADBCE] dark:border-[#3A302E]">
              <Button variant="outline" onClick={() => setCustomDomainModalWeb(null)} className="text-xs">
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveCustomDomain}
                className="bg-[#14100F] text-[#D6BE91] text-xs font-bold"
              >
                Lưu tên miền
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Lightbox Receipt */}
      {viewProofImage && (
        <Modal
          isOpen={Boolean(viewProofImage)}
          onClose={() => setViewProofImage(null)}
          title="Biên lai đối soát chuyển khoản"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-stone-950 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewProofImage}
                alt="Bill đối soát"
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewProofImage(null)} className="text-xs">
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Reject Order */}
      {rejectOrderModal && (
        <Modal
          isOpen={Boolean(rejectOrderModal)}
          onClose={() => setRejectOrderModal(null)}
          title={`Từ chối đơn hàng ${rejectOrderModal.code}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <p className="text-[#80726F]">Nhập lý do để thông báo cho khách hàng biết lý do từ chối:</p>
            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              className="w-full rounded-xl border border-[#EADBCE] dark:border-[#3A302E] p-2.5 text-xs text-[#2C2422] dark:text-[#F5EFE7] dark:bg-[#14100F]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRejectOrderModal(null)} className="text-xs">
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmRejectOrder}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
