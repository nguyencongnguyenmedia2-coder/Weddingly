import {
  SubscriptionOrder,
  SubscriptionPlan,
  BankConfig,
} from "@/types/database";
import { AuthService } from "./auth.service";
import { WeddingStore } from "@/lib/wedding-store";
import { SubscriptionService } from "./subscription.service";

export interface SystemUserRecord {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: "USER" | "PLANNER" | "ADMIN";
  plan: SubscriptionPlan;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  created_at: string;
  last_login: string;
  wedding_title?: string;
  wedding_slug?: string;
  total_spent: number;
}

export interface SystemWebsiteRecord {
  id: string;
  wedding_id: string;
  title: string;
  couple_names: string;
  slug: string;
  custom_domain?: string;
  theme: "luxury" | "rose" | "garden" | "minimal" | "ocean";
  is_published: boolean;
  status: "PUBLISHED" | "DRAFT" | "SUSPENDED";
  views_count: number;
  rsvp_count: number;
  wishes_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformSystemConfig {
  maintenance_mode: boolean;
  maintenance_message: string;
  announcement_banner: {
    enabled: boolean;
    text: string;
    type: "info" | "warning" | "success";
  };
  ai_daily_limit_free: number;
  max_upload_size_mb: number;
  allow_registrations: boolean;
  support_hotline: string;
  support_email: string;
}

const SYSTEM_USERS_KEY = "weddingly_admin_system_users_v2";
const SYSTEM_WEBSITES_KEY = "weddingly_admin_system_websites_v2";
const SYSTEM_CONFIG_KEY = "weddingly_admin_system_config_v2";

export const DEFAULT_PLATFORM_CONFIG: PlatformSystemConfig = {
  maintenance_mode: false,
  maintenance_message: "Hệ thống đang được nâng cấp bảo trì định kỳ. Quý khách vui lòng quay lại sau ít phút.",
  announcement_banner: {
    enabled: true,
    text: "🎉 Chào mừng mùa cưới 2026 - Giảm 20% khi nâng cấp Gói Kim Cương (VIP LUXURY) trọn gói!",
    type: "success",
  },
  ai_daily_limit_free: 10,
  max_upload_size_mb: 50,
  allow_registrations: true,
  support_hotline: "1900 6868 - 0988.888.888",
  support_email: "support@weddingly.vn",
};

const SEED_SYSTEM_USERS: SystemUserRecord[] = [
  {
    id: "user-superadmin",
    email: "admin@weddingly.vn",
    full_name: "Super Administrator",
    phone: "0988 888 888",
    role: "ADMIN",
    plan: "VIP",
    status: "ACTIVE",
    created_at: "2026-01-01T00:00:00Z",
    last_login: new Date().toISOString(),
    wedding_title: "Quản trị viên Hệ thống",
    wedding_slug: "system-admin",
    total_spent: 0,
  },
];

const SEED_SYSTEM_WEBSITES: SystemWebsiteRecord[] = [];

export class AdminSystemService {
  // --- Platform System Config ---
  static getConfig(): PlatformSystemConfig {
    if (typeof window === "undefined") return DEFAULT_PLATFORM_CONFIG;
    try {
      const stored = localStorage.getItem(SYSTEM_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_PLATFORM_CONFIG, ...JSON.parse(stored) };
      }
      localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(DEFAULT_PLATFORM_CONFIG));
    } catch {
      return DEFAULT_PLATFORM_CONFIG;
    }
    return DEFAULT_PLATFORM_CONFIG;
  }

  static updateConfig(partial: Partial<PlatformSystemConfig>, actor = "Super Admin"): PlatformSystemConfig {
    const current = this.getConfig();
    const updated = { ...current, ...partial };
    if (typeof window !== "undefined") {
      localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(updated));
      SubscriptionService.addAuditLog({
        actor,
        action: "UPDATE_SYSTEM_CONFIG",
        entity: "Cấu hình nền tảng SaaS",
        details: "Thay đổi cài đặt hệ thống, bảo trì hoặc thông báo",
      });
      window.dispatchEvent(new Event("weddingly_system_config_changed"));
    }
    return updated;
  }

  // --- Users Management ---
  static getUsers(): SystemUserRecord[] {
    if (typeof window === "undefined") return SEED_SYSTEM_USERS;
    let list: SystemUserRecord[] = [...SEED_SYSTEM_USERS];
    try {
      const stored = localStorage.getItem(SYSTEM_USERS_KEY);
      if (stored) {
        list = JSON.parse(stored);
      } else {
        localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(SEED_SYSTEM_USERS));
      }
    } catch {
      list = [...SEED_SYSTEM_USERS];
    }

    // Merge registered users from registry
    try {
      const regStr = localStorage.getItem("weddingly_registered_users_registry");
      if (regStr) {
        const regList: any[] = JSON.parse(regStr);
        regList.forEach((reg) => {
          if (!reg.email) return;
          const idx = list.findIndex(
            (u) => u.id === reg.id || (u.email && u.email.toLowerCase() === reg.email.toLowerCase())
          );
          if (idx >= 0) {
            list[idx].role = reg.role || list[idx].role;
            list[idx].plan = reg.plan || list[idx].plan;
          } else {
            list.push({
              id: reg.id || crypto.randomUUID(),
              email: reg.email,
              full_name: reg.full_name || reg.email.split("@")[0],
              phone: reg.phone || "",
              role: reg.role || "USER",
              plan: reg.plan || "FREE",
              status: "ACTIVE",
              created_at: reg.created_at || new Date().toISOString(),
              last_login: new Date().toISOString(),
              total_spent: reg.plan === "VIP" ? 999000 : reg.plan === "PRO" ? 499000 : 0,
            });
          }
        });
      }
    } catch (e) {
      console.warn("Merge reg users error:", e);
    }

    // Merge any customer users from subscription orders
    try {
      const orders = SubscriptionService.getOrders();
      orders.forEach((ord) => {
        if (!ord.user_email) return;
        const idx = list.findIndex(
          (u) => (ord.user_id && u.id === ord.user_id) || (u.email && u.email.toLowerCase() === ord.user_email.toLowerCase())
        );
        if (idx >= 0) {
          if (ord.status === "APPROVED" && (list[idx].plan === "FREE" || ord.plan === "VIP")) {
            list[idx].plan = ord.plan;
          }
          if (ord.status === "APPROVED") {
            list[idx].total_spent = Math.max(list[idx].total_spent || 0, ord.amount);
          }
        } else {
          list.push({
            id: ord.user_id || crypto.randomUUID(),
            email: ord.user_email,
            full_name: ord.user_name || "Khách hàng mua gói",
            phone: ord.user_phone || "",
            role: "USER",
            plan: ord.status === "APPROVED" ? ord.plan : "FREE",
            status: "ACTIVE",
            created_at: ord.created_at || new Date().toISOString(),
            last_login: ord.created_at || new Date().toISOString(),
            wedding_title: ord.wedding_title || ord.user_name,
            total_spent: ord.status === "APPROVED" ? ord.amount : 0,
          });
        }
      });
    } catch (e) {
      console.warn("Merge orders users error:", e);
    }

    // Merge current logged-in user if exists
    const current = AuthService.getCurrentUser();
    const state = WeddingStore.getState();
    if (current) {
      const idx = list.findIndex((u) => u.id === current.id || u.email.toLowerCase() === current.email.toLowerCase());
      const activeData: SystemUserRecord = {
        id: current.id,
        email: current.email,
        full_name: current.full_name || state.wedding.bride_name || "Bạn (Đang đăng nhập)",
        phone: current.phone || "0988 888 888",
        role: current.role || "USER",
        plan: current.plan || "FREE",
        status: "ACTIVE",
        created_at: current.created_at || new Date().toISOString(),
        last_login: new Date().toISOString(),
        wedding_title: state.wedding.name || `${state.wedding.bride_name} & ${state.wedding.groom_name}`,
        wedding_slug: state.wedding.slug || "wedding-couple",
        total_spent: current.plan === "VIP" ? 999000 : current.plan === "PRO" ? 499000 : 0,
      };

      if (idx >= 0) {
        list[idx] = { ...list[idx], ...activeData };
      } else {
        list = [activeData, ...list];
      }
    }

    return list;
  }

  static updateUser(id: string, partial: Partial<SystemUserRecord>, actor = "Super Admin"): SystemUserRecord | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id || u.email === id);
    if (idx === -1) return null;

    const updated = { ...users[idx], ...partial };
    users[idx] = updated;

    if (typeof window !== "undefined") {
      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(users));

      // If updating current active user, sync auth state
      const current = AuthService.getCurrentUser();
      if (current && (current.id === id || current.email === updated.email)) {
        if (partial.plan) AuthService.upgradePlan(partial.plan);
      }

      SubscriptionService.addAuditLog({
        actor,
        action: "UPDATE_USER",
        entity: `Người dùng: ${updated.full_name} (${updated.email})`,
        details: `Cập nhật thông tin tài khoản / quyền / gói dịch vụ`,
      });

      window.dispatchEvent(new Event("weddingly_users_changed"));
    }

    return updated;
  }

  static toggleUserStatus(id: string, actor = "Super Admin"): SystemUserRecord | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) return null;

    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    return this.updateUser(id, { status: nextStatus }, actor);
  }

  static deleteUser(id: string, actor = "Super Admin"): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;

    if (typeof window !== "undefined") {
      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(filtered));
      SubscriptionService.addAuditLog({
        actor,
        action: "DELETE_USER",
        entity: `User ID: ${id}`,
        details: "Xóa tài khoản người dùng khỏi hệ thống",
      });
      window.dispatchEvent(new Event("weddingly_users_changed"));
    }
    return true;
  }

  static createUser(params: {
    email: string;
    full_name: string;
    phone?: string;
    role: "USER" | "PLANNER" | "ADMIN";
    plan: SubscriptionPlan;
    wedding_title?: string;
  }, actor = "Super Admin"): SystemUserRecord {
    const newUser: SystemUserRecord = {
      id: crypto.randomUUID(),
      email: params.email,
      full_name: params.full_name,
      phone: params.phone || "",
      role: params.role,
      plan: params.plan,
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      wedding_title: params.wedding_title || `${params.full_name}'s Wedding`,
      wedding_slug: params.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-"),
      total_spent: params.plan === "VIP" ? 999000 : params.plan === "PRO" ? 499000 : 0,
    };

    const users = this.getUsers();
    const updatedUsers = [newUser, ...users];

    if (typeof window !== "undefined") {
      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(updatedUsers));
      SubscriptionService.addAuditLog({
        actor,
        action: "CREATE_USER",
        entity: `Tạo người dùng: ${newUser.full_name} (${newUser.email})`,
        details: `Vai trò ${newUser.role}, Gói ${newUser.plan}`,
      });
      window.dispatchEvent(new Event("weddingly_users_changed"));
    }

    return newUser;
  }

  // --- Websites Management ---
  static getWebsites(): SystemWebsiteRecord[] {
    if (typeof window === "undefined") return SEED_SYSTEM_WEBSITES;
    let list: SystemWebsiteRecord[] = [...SEED_SYSTEM_WEBSITES];
    try {
      const stored = localStorage.getItem(SYSTEM_WEBSITES_KEY);
      if (stored) {
        list = JSON.parse(stored);
      } else {
        localStorage.setItem(SYSTEM_WEBSITES_KEY, JSON.stringify(SEED_SYSTEM_WEBSITES));
      }
    } catch {
      list = [...SEED_SYSTEM_WEBSITES];
    }

    // Include user's current wedding website from store
    const state = WeddingStore.getState();
    if (state.wedding) {
      const existing = list.find((w) => w.slug === state.wedding.slug || w.wedding_id === state.wedding.id);
      const activeWeb: SystemWebsiteRecord = {
        id: state.wedding.id,
        wedding_id: state.wedding.id,
        title: state.wedding.name || `${state.wedding.bride_name} & ${state.wedding.groom_name}`,
        couple_names: `${state.wedding.bride_name} & ${state.wedding.groom_name}`,
        slug: state.wedding.slug,
        theme: (state.websiteConfig?.theme as any) || "luxury",
        is_published: state.websiteConfig?.isPublished ?? true,
        status: (state.websiteConfig?.isPublished ? "PUBLISHED" : "DRAFT") as any,
        views_count: existing?.views_count || 1420,
        rsvp_count: state.guests.filter((g) => g.rsvp_status === "CONFIRMED").length || 38,
        wishes_count: existing?.wishes_count || 19,
        created_at: state.wedding.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const idx = list.findIndex((w) => w.id === existing.id);
        list[idx] = { ...existing, ...activeWeb };
      } else {
        list = [activeWeb, ...list];
      }
    }

    return list;
  }

  static updateWebsite(id: string, partial: Partial<SystemWebsiteRecord>, actor = "Super Admin"): SystemWebsiteRecord | null {
    const websites = this.getWebsites();
    const idx = websites.findIndex((w) => w.id === id || w.slug === id);
    if (idx === -1) return null;

    const updated = { ...websites[idx], ...partial, updated_at: new Date().toISOString() };
    websites[idx] = updated;

    if (typeof window !== "undefined") {
      localStorage.setItem(SYSTEM_WEBSITES_KEY, JSON.stringify(websites));
      SubscriptionService.addAuditLog({
        actor,
        action: "UPDATE_WEBSITE",
        entity: `Website cưới: ${updated.slug} (${updated.couple_names})`,
        details: `Cập nhật trạng thái / tên miền riêng / giao diện`,
      });
      window.dispatchEvent(new Event("weddingly_websites_changed"));
    }

    return updated;
  }

  static toggleWebsiteStatus(id: string, actor = "Super Admin"): SystemWebsiteRecord | null {
    const websites = this.getWebsites();
    const site = websites.find((w) => w.id === id || w.slug === id);
    if (!site) return null;

    const nextStatus = site.status === "PUBLISHED" ? "SUSPENDED" : "PUBLISHED";
    return this.updateWebsite(id, { status: nextStatus, is_published: nextStatus === "PUBLISHED" }, actor);
  }

  static deleteWebsite(id: string, actor = "Super Admin"): boolean {
    const websites = this.getWebsites();
    const filtered = websites.filter((w) => w.id !== id && w.slug !== id);
    if (filtered.length === websites.length) return false;

    if (typeof window !== "undefined") {
      localStorage.setItem(SYSTEM_WEBSITES_KEY, JSON.stringify(filtered));
      SubscriptionService.addAuditLog({
        actor,
        action: "DELETE_WEBSITE",
        entity: `Website: ${id}`,
        details: "Gỡ bỏ trang website đám cưới khỏi hệ thống",
      });
      window.dispatchEvent(new Event("weddingly_websites_changed"));
    }
    return true;
  }
}
