import {
  SubscriptionOrder,
  SubscriptionOrderStatus,
  SubscriptionPlan,
  BankConfig,
  CustomerUserRecord,
} from "@/types/database";
import { AuthService } from "./auth.service";
import { WeddingStore } from "@/lib/wedding-store";

const ORDERS_KEY = "weddingly_subscription_orders";
const BANK_CONFIG_KEY = "weddingly_bank_config";
const CUSTOMERS_KEY = "weddingly_customers_directory";
const AUDIT_LOGS_KEY = "weddingly_admin_audit_logs";

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  details?: string;
  created_at: string;
}

export const DEFAULT_BANK_CONFIG: BankConfig = {
  bank_name: "MB Bank (Ngân hàng TMCP Quân Đội)",
  bank_code: "MB",
  account_number: "0988888888",
  account_name: "CONG TY CP WEDDINGLY VIET NAM",
  branch: "Hội sở chính - Hà Nội",
  hotline: "1900 6868 - 0988.888.888",
  pro_price: 499000,
  vip_price: 999000,
};

const SEED_CUSTOMERS: CustomerUserRecord[] = [];
const SEED_ORDERS: SubscriptionOrder[] = [];
const SEED_AUDIT_LOGS: AdminAuditLog[] = [];

export class SubscriptionService {
  // --- Bank Config ---
  static getBankConfig(): BankConfig {
    if (typeof window === "undefined") return DEFAULT_BANK_CONFIG;
    try {
      const stored = localStorage.getItem(BANK_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_BANK_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Failed to load bank config:", e);
    }
    return DEFAULT_BANK_CONFIG;
  }

  static saveBankConfig(config: Partial<BankConfig>, actor = "Super Admin"): BankConfig {
    const updated = { ...this.getBankConfig(), ...config };
    if (typeof window !== "undefined") {
      localStorage.setItem(BANK_CONFIG_KEY, JSON.stringify(updated));
      this.addAuditLog({
        actor,
        action: "UPDATE_BANK_CONFIG",
        entity: `Tài khoản: ${updated.account_number} (${updated.bank_name})`,
        details: `Cập nhật thông tin ngân hàng thanh toán và giá cước`,
      });
      window.dispatchEvent(new Event("weddingly_bank_config_updated"));
    }
    return updated;
  }

  // --- VietQR URL Generator ---
  static getVietQRUrl(amount: number, transferContent: string): string {
    const config = this.getBankConfig();
    const cleanContent = transferContent.trim().replace(/\s+/g, "%20");
    const cleanAccountName = encodeURIComponent(config.account_name);
    return `https://img.vietqr.io/image/${config.bank_code}-${config.account_number}-compact2.png?amount=${amount}&addInfo=${cleanContent}&accountName=${cleanAccountName}`;
  }

  // --- Orders Management ---
  static getOrders(): SubscriptionOrder[] {
    if (typeof window === "undefined") return SEED_ORDERS;
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
      }
      // Initialize with seed
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(SEED_ORDERS));
      } catch {
        // ignore quota
      }
      return SEED_ORDERS;
    } catch {
      return SEED_ORDERS;
    }
  }

  static async syncFromApi(): Promise<SubscriptionOrder[]> {
    if (typeof window === "undefined") return this.getOrders();
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return this.getOrders();
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const serverOrders: SubscriptionOrder[] = json.data;
        const localOrders = this.getOrders();

        // Merge: keep newest order version
        const map = new Map<string, SubscriptionOrder>();
        for (const o of localOrders) {
          map.set(o.code || o.id, o);
        }
        for (const o of serverOrders) {
          const key = o.code || o.id;
          const existing = map.get(key);
          if (!existing) {
            map.set(key, o);
          } else {
            // Keep the one with newer updated/reviewed or approved status
            if (o.status === "APPROVED" || o.status === "REJECTED" || !existing.status) {
              map.set(key, { ...existing, ...o });
            } else if (new Date(o.created_at).getTime() > new Date(existing.created_at).getTime()) {
              map.set(key, { ...existing, ...o });
            }
          }
        }

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        try {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
        window.dispatchEvent(new Event("weddingly_orders_changed"));
        return merged;
      }
    } catch (e) {
      console.warn("Failed to sync orders from /api/orders:", e);
    }
    return this.getOrders();
  }

  static getOrderById(id: string): SubscriptionOrder | null {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || o.code === id) || null;
  }

  static getUserPendingOrder(userId?: string): SubscriptionOrder | null {
    const orders = this.getOrders();
    const current = AuthService.getCurrentUser();
    const targetId = userId || current?.id;
    if (!targetId && !current?.email) {
      return orders.find((o) => o.user_id === "guest-user" && o.status === "PENDING") || null;
    }
    return (
      orders.find(
        (o) =>
          ((targetId && o.user_id === targetId) ||
            (current?.email && o.user_email?.toLowerCase() === current.email.toLowerCase())) &&
          o.status === "PENDING"
      ) || null
    );
  }

  static getUserOrders(userId?: string): SubscriptionOrder[] {
    const orders = this.getOrders();
    const current = AuthService.getCurrentUser();
    const targetId = userId || current?.id;
    const targetEmail = current?.email?.toLowerCase();

    if (!targetId && !targetEmail) {
      return orders.filter((o) => o.user_id === "guest-user");
    }

    return orders
      .filter((o) => {
        if (targetId && o.user_id === targetId) return true;
        if (targetEmail && o.user_email && o.user_email.toLowerCase() === targetEmail) return true;
        return false;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static createOrder(params: {
    plan: SubscriptionPlan;
    code?: string;
    payment_method?: "VIETQR" | "BANK_TRANSFER";
    proof_image_url?: string;
    notes?: string;
    phone?: string;
  }): SubscriptionOrder {
    const current = AuthService.getCurrentUser();
    const state = WeddingStore.getState();
    const config = this.getBankConfig();

    const plan = params.plan;
    const amount = plan === "VIP" ? config.vip_price : config.pro_price;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = params.code || `WD-${plan}-${randomSuffix}`;
    const cleanName = (current?.full_name || state.wedding.bride_name || "GUEST")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    const transferContent = `${code} ${cleanName}`.trim();

    const newOrder: SubscriptionOrder = {
      id: crypto.randomUUID(),
      code,
      user_id: current?.id || "guest-user",
      user_email: current?.email || "customer@weddingly.vn",
      user_name: current?.full_name || `${state.wedding.bride_name || "Khách hàng"} & ${state.wedding.groom_name || "Cặp đôi"}`,
      user_phone: params.phone || current?.phone || "0988 888 888",
      wedding_id: state.wedding.id,
      wedding_title: state.wedding.name || `${state.wedding.bride_name} & ${state.wedding.groom_name}`,
      plan,
      amount,
      payment_method: params.payment_method || "VIETQR",
      transfer_content: transferContent,
      status: "PENDING",
      proof_image_url: params.proof_image_url,
      notes: params.notes,
      created_at: new Date().toISOString(),
    };

    const orders = this.getOrders();
    const updatedOrders = [newOrder, ...orders.filter((o) => o.code !== newOrder.code)];

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
      } catch (e) {
        console.warn("Storage quota exceeded, storing without large proof in local:", e);
        try {
          const minimalOrders = updatedOrders.map((o) => ({
            ...o,
            proof_image_url: o.proof_image_url && o.proof_image_url.length > 2000 ? undefined : o.proof_image_url,
          }));
          localStorage.setItem(ORDERS_KEY, JSON.stringify(minimalOrders));
        } catch {
          // ignore
        }
      }

      // Always save to Server API
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      }).catch((err) => console.warn("Failed to sync new order to server API:", err));

      this.addAuditLog({
        actor: newOrder.user_name,
        action: "CREATE_PAYMENT_ORDER",
        entity: `Đơn hàng ${newOrder.code}`,
        details: `Yêu cầu nâng cấp gói ${newOrder.plan} (${newOrder.amount.toLocaleString("vi-VN")} ₫)`,
      });
      window.dispatchEvent(new Event("weddingly_orders_changed"));
      window.dispatchEvent(new Event("weddingly_users_changed"));
    }

    return newOrder;
  }

  static approveOrder(orderId: string, actor = "Super Admin"): SubscriptionOrder | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.code === orderId);
    if (index === -1) return null;

    const target = orders[index];
    const updated: SubscriptionOrder = {
      ...target,
      status: "APPROVED",
      reviewed_by: actor,
      reviewed_at: new Date().toISOString(),
    };

    orders[index] = updated;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      } catch {
        // ignore
      }

      // Sync to Server API
      fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: target.id || target.code,
          status: "APPROVED",
          reviewed_by: actor,
        }),
      }).catch((err) => console.warn("Failed to sync approved order to API:", err));

      // 1. If currently logged in user matches this order, upgrade live session!
      const currentUser = AuthService.getCurrentUser();
      if (currentUser && (currentUser.id === target.user_id || currentUser.email?.toLowerCase() === target.user_email?.toLowerCase())) {
        AuthService.upgradePlan(target.plan);
      }

      // 2. Always sync registered users registry
      try {
        const regStr = localStorage.getItem("weddingly_registered_users_registry");
        if (regStr) {
          const regList = JSON.parse(regStr);
          const foundIdx = regList.findIndex(
            (u: any) => u.id === target.user_id || (u.email && u.email.toLowerCase() === target.user_email?.toLowerCase())
          );
          if (foundIdx >= 0) {
            regList[foundIdx].plan = target.plan;
            localStorage.setItem("weddingly_registered_users_registry", JSON.stringify(regList));
          }
        }
      } catch (e) {
        console.warn("Registry sync error:", e);
      }

      // 3. Always sync system users directory
      try {
        const sysUsersStr = localStorage.getItem("weddingly_admin_system_users_v2");
        if (sysUsersStr) {
          const sysUsers = JSON.parse(sysUsersStr);
          const foundIdx = sysUsers.findIndex(
            (u: any) => u.id === target.user_id || (u.email && u.email.toLowerCase() === target.user_email?.toLowerCase())
          );
          if (foundIdx >= 0) {
            sysUsers[foundIdx].plan = target.plan;
            sysUsers[foundIdx].total_spent = (sysUsers[foundIdx].total_spent || 0) + target.amount;
            localStorage.setItem("weddingly_admin_system_users_v2", JSON.stringify(sysUsers));
          }
        }
      } catch (e) {
        console.warn("System users sync error:", e);
      }

      // 4. Update customer directory
      this.updateCustomerPlan(target.user_id, target.plan, actor, false);

      // 5. Update active wedding plan if matches
      const currentWedding = WeddingStore.getWedding();
      if (currentWedding && (currentWedding.id === target.wedding_id || currentWedding.owner_id === target.user_id)) {
        WeddingStore.updateWedding({ plan: target.plan });
      }

      // 6. Notification
      WeddingStore.addNotification({
        type: "MILESTONE",
        title: `Tài khoản đã nâng cấp thành công lên Gói ${target.plan}!`,
        message: `Đơn thanh toán ${target.code} (${target.amount.toLocaleString("vi-VN")} ₫) đã được Quản trị viên phê duyệt. Mọi đặc quyền cao cấp đã được mở khóa!`,
      });

      this.addAuditLog({
        actor,
        action: "APPROVE_PAYMENT",
        entity: `Đơn hàng: ${target.code} (${target.user_name})`,
        details: `Phê duyệt nâng cấp gói ${target.plan} thành công. Số tiền: ${target.amount.toLocaleString("vi-VN")} ₫`,
      });

      window.dispatchEvent(new Event("weddingly_orders_changed"));
      window.dispatchEvent(new Event("weddingly_users_changed"));
      window.dispatchEvent(new Event("weddingly_auth_changed"));
      window.dispatchEvent(new Event("wedding_store_updated"));
    }

    return updated;
  }

  static rejectOrder(orderId: string, reason: string, actor = "Super Admin"): SubscriptionOrder | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.code === orderId);
    if (index === -1) return null;

    const target = orders[index];
    const updated: SubscriptionOrder = {
      ...target,
      status: "REJECTED",
      rejection_reason: reason,
      reviewed_by: actor,
      reviewed_at: new Date().toISOString(),
    };

    orders[index] = updated;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      } catch {
        // ignore
      }

      // Sync to Server API
      fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: target.id || target.code,
          status: "REJECTED",
          rejection_reason: reason,
          reviewed_by: actor,
        }),
      }).catch((err) => console.warn("Failed to sync rejected order to API:", err));

      WeddingStore.addNotification({
        type: "PAYMENT_DUE",
        title: `Yêu cầu thanh toán ${target.code} chưa được duyệt`,
        message: `Lý do: ${reason}. Vui lòng kiểm tra lại thông tin chuyển khoản hoặc liên hệ hỗ trợ.`,
      });

      this.addAuditLog({
        actor,
        action: "REJECT_PAYMENT",
        entity: `Đơn hàng: ${target.code} (${target.user_name})`,
        details: `Từ chối duyệt đơn: ${reason}`,
      });

      window.dispatchEvent(new Event("weddingly_orders_changed"));
    }

    return updated;
  }

  static deleteOrder(orderId: string, actor = "Super Admin"): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.id !== orderId && o.code !== orderId);
    if (filtered.length === orders.length) return false;

    if (typeof window !== "undefined") {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
      this.addAuditLog({
        actor,
        action: "DELETE_ORDER",
        entity: `Đơn hàng: ${orderId}`,
        details: "Xóa bản ghi đơn thanh toán khỏi hệ thống",
      });
      window.dispatchEvent(new Event("weddingly_orders_changed"));
    }
    return true;
  }

  // --- Customers Directory Management ---
  static getAllCustomers(): CustomerUserRecord[] {
    const current = AuthService.getCurrentUser();
    const state = WeddingStore.getState();

    let list: CustomerUserRecord[] = [...SEED_CUSTOMERS];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(CUSTOMERS_KEY);
        if (stored) {
          list = JSON.parse(stored);
        } else {
          localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(SEED_CUSTOMERS));
        }
      } catch {
        list = [...SEED_CUSTOMERS];
      }
    }

    // Merge active user if logged in
    if (current) {
      const existingIdx = list.findIndex(
        (c) => c.id === current.id || (c.email && c.email.toLowerCase() === current.email.toLowerCase())
      );
      const activeRecord: CustomerUserRecord = {
        id: current.id,
        email: current.email,
        full_name: current.full_name || state.wedding.bride_name || "Bạn (Đang đăng nhập)",
        phone: current.phone || "0988 888 888",
        role: current.role || "USER",
        plan: current.plan || "FREE",
        wedding_title: state.wedding.name || `${state.wedding.bride_name} & ${state.wedding.groom_name}`,
        bride_name: state.wedding.bride_name,
        groom_name: state.wedding.groom_name,
        wedding_date: state.wedding.wedding_date,
        created_at: current.created_at || new Date().toISOString(),
        total_spent: current.plan === "VIP" ? 999000 : current.plan === "PRO" ? 499000 : 0,
        status: "ACTIVE",
      };

      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...activeRecord };
      } else {
        list = [activeRecord, ...list];
      }
    }

    return list;
  }

  static updateCustomerPlan(
    customerId: string,
    newPlan: SubscriptionPlan,
    actor = "Super Admin",
    createLog = true
  ): boolean {
    const customers = this.getAllCustomers();
    const idx = customers.findIndex((c) => c.id === customerId || c.email === customerId);

    const currentUser = AuthService.getCurrentUser();
    if (currentUser && (currentUser.id === customerId || currentUser.email === customerId)) {
      AuthService.upgradePlan(newPlan);
    }

    if (idx >= 0) {
      customers[idx].plan = newPlan;
      if (newPlan === "VIP") customers[idx].total_spent = (customers[idx].total_spent || 0) + 999000;
      else if (newPlan === "PRO") customers[idx].total_spent = (customers[idx].total_spent || 0) + 499000;

      if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
      }
    }

    if (createLog && typeof window !== "undefined") {
      this.addAuditLog({
        actor,
        action: "UPDATE_CUSTOMER_PLAN",
        entity: `Khách hàng: ${customers[idx]?.full_name || customerId}`,
        details: `Admin đổi gói trực tiếp thành ${newPlan}`,
      });
      window.dispatchEvent(new Event("weddingly_customers_changed"));
    }

    return true;
  }

  // --- Audit Logs ---
  static getAuditLogs(): AdminAuditLog[] {
    if (typeof window === "undefined") return SEED_AUDIT_LOGS;
    try {
      const stored = localStorage.getItem(AUDIT_LOGS_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    } catch {
      return SEED_AUDIT_LOGS;
    }
  }

  static addAuditLog(log: Omit<AdminAuditLog, "id" | "created_at">): void {
    if (typeof window === "undefined") return;
    try {
      const logs = this.getAuditLogs();
      const newLog: AdminAuditLog = {
        ...log,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify([newLog, ...logs.slice(0, 50)]));
    } catch (e) {
      console.warn("Failed to add audit log:", e);
    }
  }
}
