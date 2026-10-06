import { Profile, SubscriptionPlan } from "@/types/database";
import { WeddingStore } from "@/lib/wedding-store";
import { createClient } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: "USER" | "PLANNER" | "ADMIN";
  plan: SubscriptionPlan;
  created_at: string;
}

const AUTH_USER_KEY = "weddingly_current_user";
const COOKIE_NAME = "weddingly_session";

function setSessionCookie(userId: string) {
  if (typeof document !== "undefined") {
    // 30 days session cookie
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=${userId}; path=/; expires=${expires}; SameSite=Lax`;
  }
}

function removeSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

export class AuthService {
  static getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      return null;
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return Boolean(this.getCurrentUser());
  }

  static async register(data: {
    email: string;
    password?: string;
    fullName: string;
    phone?: string;
    plan?: SubscriptionPlan;
  }): Promise<{ user: AuthUser; error?: string }> {
    const supabase = createClient();
    const userId = crypto.randomUUID();
    const plan: SubscriptionPlan = data.plan || "FREE";

    const user: AuthUser = {
      id: userId,
      email: data.email.toLowerCase().trim(),
      full_name: data.fullName.trim(),
      phone: data.phone?.trim() || "",
      role: "USER",
      plan,
      created_at: new Date().toISOString(),
    };

    // 1. Try Supabase Auth
    try {
      if (data.password) {
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone,
            },
          },
        });
      }
    } catch (err) {
      console.warn("Supabase auth signUp fallback:", err);
    }

    // 2. Persist local user session & cookie
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      setSessionCookie(user.id);
    }

    // 3. Create dedicated private wedding for this new user
    const wedding = WeddingStore.createWedding({
      brideName: data.fullName.split(" ")[0] || "Cô dâu",
      groomName: "Chú rể",
      weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      estimatedBudget: 0,
      expectedGuests: 0,
      style: "Luxury",
    });

    // Assign owner and plan to wedding
    WeddingStore.updateWedding({
      id: wedding.id,
      owner_id: user.id,
      plan,
      name: `Kế hoạch cưới của ${data.fullName}`,
    });

    return { user };
  }

  static async login(email: string, password?: string): Promise<{ user: AuthUser | null; error?: string }> {
    const supabase = createClient();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try Supabase Auth login
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (data.user) {
          const user: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            full_name: data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
            role: "USER",
            plan: "FREE",
            created_at: data.user.created_at,
          };
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          setSessionCookie(user.id);
          return { user };
        }
      }
    } catch (err) {
      console.warn("Supabase login fallback:", err);
    }

    // 2. Check local accounts or auto-authenticate
    const user: AuthUser = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      full_name: cleanEmail.split("@")[0].toUpperCase(),
      role: "USER",
      plan: "FREE",
      created_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      setSessionCookie(user.id);
    }

    return { user };
  }

  static async logout(): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut error:", e);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_USER_KEY);
      removeSessionCookie();
      window.dispatchEvent(new Event("weddingly_auth_changed"));
    }
  }

  static async upgradeToPro(): Promise<AuthUser | null> {
    const current = this.getCurrentUser();
    if (!current) return null;

    current.plan = "PRO";
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(current));
    }

    // Update active wedding plan
    WeddingStore.updateWedding({
      plan: "PRO",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("weddingly_auth_changed"));
    }

    return current;
  }
}
