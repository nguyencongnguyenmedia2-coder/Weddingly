"use client";

import {
  Wedding,
  Task,
  BudgetCategory,
  Expense,
  Payment,
  Guest,
  WeddingTable,
  Vendor,
  TimelineEvent,
  RSVPStatus,
  TaskStatus,
  TaskPriority,
  PaymentStatus,
  VendorStatus,
} from "@/types/database";

export type {
  Wedding,
  Task,
  BudgetCategory,
  Expense,
  Payment,
  Guest,
  WeddingTable,
  Vendor,
  TimelineEvent,
};

import { createClient } from "@/lib/supabase/client";

import {
  initialSeedWedding,
  initialSeedCategories,
  initialSeedExpenses,
  initialSeedPayments,
  initialSeedGuests,
  initialSeedTables,
  initialSeedTasks,
  initialSeedVendors,
  initialSeedTimeline,
} from "./mock-data";

export interface GalleryPhoto {
  id: string;
  album: string;
  url: string;
  caption: string;
  isFavorite: boolean;
  uploadedAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: "Planning" | "Budget" | "Vendor" | "Family" | "Wedding day" | "Personal";
  isPinned: boolean;
  date: string;
}

export interface NotificationItem {
  id: string;
  type: "TASK_DUE" | "PAYMENT_DUE" | "RSVP" | "BUDGET_ALERT" | "MILESTONE" | "VENDOR";
  title: string;
  message: string;
  isRead: boolean;
  time: string;
}

export interface WebsiteSectionConfig {
  id: string; // "hero" | "couple" | "story" | "events" | "gallery" | "guestbook" | "gift" | "footer"
  type: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface LoveStoryItem {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface ImageMotionConfig {
  enabled: boolean;
  heroEffect: "kenburns" | "pan-horizontal" | "pulse-zoom" | "float-tilt" | "none";
  galleryHover: "hover-zoom-glow" | "hover-tilt-3d" | "kenburns-card" | "shimmer-shine" | "floating-soft";
  coupleEffect: "pulse-ring" | "floating" | "glow-rotate" | "soft-zoom" | "classic";
  speed: "slow" | "normal" | "dynamic";
}

export interface WeddingWebsiteConfig {
  theme: "luxury" | "rose" | "garden" | "minimal" | "ocean";
  fontFamily: "playfair" | "cinzel" | "montserrat";
  isPublished: boolean;
  imageMotion: ImageMotionConfig;
  sections: WebsiteSectionConfig[];
  hero: {
    title: string;
    subTitle: string;
    coverImageUrl: string;
    showCountdown: boolean;
    align: "center" | "left" | "right";
  };
  couple: {
    title: string;
    description: string;
    brideName: string;
    brideTitle: string;
    brideBio: string;
    bridePhotoUrl: string;
    groomName: string;
    groomTitle: string;
    groomBio: string;
    groomPhotoUrl: string;
  };
  story: {
    title: string;
    description: string;
    milestones: LoveStoryItem[];
  };
  events: {
    title: string;
    description: string;
    showMap: boolean;
    dresscode: string;
  };
  gallery: {
    title: string;
    description: string;
    columns: 2 | 3 | 4;
    photos: { id: string; url: string; caption?: string }[];
  };
  guestbook: {
    title: string;
    description: string;
    enabled: boolean;
  };
  gift: {
    enabled: boolean;
    title: string;
    description: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
  };
  footer: {
    quote: string;
    hashtag: string;
  };
}

export const defaultWebsiteConfig: WeddingWebsiteConfig = {
  theme: "luxury",
  fontFamily: "playfair",
  isPublished: true,
  imageMotion: {
    enabled: true,
    heroEffect: "kenburns",
    galleryHover: "hover-zoom-glow",
    coupleEffect: "pulse-ring",
    speed: "normal",
  },
  sections: [
    { id: "hero", type: "hero", name: "Ảnh bìa & Lời chào", enabled: true, order: 1 },
    { id: "couple", type: "couple", name: "Cô dâu & Chú rể", enabled: true, order: 2 },
    { id: "story", type: "story", name: "Câu chuyện tình yêu", enabled: true, order: 3 },
    { id: "events", type: "events", name: "Lịch trình & Địa điểm", enabled: true, order: 4 },
    { id: "gallery", type: "gallery", name: "Album ảnh cưới", enabled: true, order: 5 },
    { id: "guestbook", type: "guestbook", name: "Sổ lưu bút & Lời chúc", enabled: true, order: 6 },
    { id: "gift", type: "gift", name: "Mừng cưới & Hộp hạnh phúc", enabled: true, order: 7 },
    { id: "footer", type: "footer", name: "Lời cảm ơn & Chân trang", enabled: true, order: 8 },
  ],
  hero: {
    title: "SAVE OUR SPECIAL DATE",
    subTitle: "Hạnh phúc lớn nhất trong đời là tìm thấy một người để cùng nhau già đi. Trân trọng kính mời quý vị đến chung vui trong ngày trọng đại!",
    coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    showCountdown: true,
    align: "center",
  },
  couple: {
    title: "CẶP ĐÔI CHÍNH",
    description: "Hai trái tim, chung một nhịp đập, cùng nhau viết tiếp chương trình hạnh phúc",
    brideName: "Nguyễn Minh Anh",
    brideTitle: "Cô dâu",
    brideBio: "Một cô gái yêu tự do, thích hoa và luôn nở nụ cười rạng rỡ khi bên cạnh người thương.",
    bridePhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    groomName: "Trần Quốc Minh",
    groomTitle: "Chú rể",
    groomBio: "Điềm tĩnh, ấm áp và luôn là chỗ dựa vững chãi nhất cho tổ ấm nhỏ tương lai.",
    groomPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  },
  story: {
    title: "OUR LOVE STORY",
    description: "Hành trình từ hai người xa lạ trở thành một nửa không thể thiếu của cuộc đời",
    milestones: [
      {
        id: "m1",
        year: "15/10/2021",
        title: "Lần đầu gặp gỡ tại quán cà phê",
        description: "Một chiều thu Sài Gòn, hai ánh mắt vô tình chạm nhau và câu chuyện bắt đầu từ cốc trà hoa hồng ấm nóng.",
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "m2",
        year: "24/12/2022",
        title: "Lời tỏ tình đêm Giáng sinh",
        description: "Dưới ánh đèn lung linh của nhà thờ Đức Bà, anh ngỏ lời và em đã mỉm cười gật đầu đồng ý.",
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "m3",
        year: "14/02/2026",
        title: "Lời cầu hôn hoàng hôn Đà Lạt",
        description: "Giữa đồi thông thơ mộng và sương mờ, chiếc nhẫn kim cương được trao cùng lời hẹn ước trọn đời.",
        imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  events: {
    title: "LỊCH TRÌNH HÔN LỄ",
    description: "Các mốc thời gian và địa điểm quan trọng trong ngày thành hôn",
    showMap: true,
    dresscode: "Trang phục trang nhã: Be, Hồng Pastel, Trắng hoặc Đen",
  },
  gallery: {
    title: "ALBUM ẢNH KỶ NIỆM",
    description: "Những khoảnh khắc ngọt ngào nhất được lưu lại qua ống kính",
    columns: 3,
    photos: [
      {
        id: "g1",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        caption: "Hoàng hôn lãng mạn tại Đà Lạt",
      },
      {
        id: "g2",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
        caption: "Concept váy cưới công chúa cổ điển",
      },
      {
        id: "g3",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
        caption: "Lễ ăn hỏi ấm cúng cùng gia đình",
      },
      {
        id: "g4",
        url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
        caption: "Khoảnh khắc trao nhẫn thiêng liêng",
      },
      {
        id: "g5",
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
        caption: "Dàn phù dâu phù rể siêu quậy",
      },
      {
        id: "g6",
        url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
        caption: "Nụ cười rạng ngời ngày hạnh phúc",
      },
    ],
  },
  guestbook: {
    title: "SỔ LƯU BÚT CHÚC PHÚC",
    description: "Hãy gửi những lời chúc tốt đẹp nhất để lưu giữ mãi cùng năm tháng",
    enabled: true,
  },
  gift: {
    enabled: true,
    title: "HỘP MỪNG CƯỚI ONLINE",
    description: "Dành cho những người bạn, người thân ở xa không thể đến dự tiệc trực tiếp",
    bankName: "Ngân hàng TMCP Quân Đội (MB Bank)",
    accountNumber: "999988886666",
    accountHolder: "TRAN QUOC MINH",
    qrCodeUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
  },
  footer: {
    quote: "Sự hiện diện và lời chúc phúc của quý vị là món quà vô giá nhất đối với chúng mình!",
    hashtag: "#MinhAnhQuocMinh2027",
  },
};

interface WeddingState {
  wedding: Wedding;
  allWeddings: Wedding[];
  categories: BudgetCategory[];
  expenses: Expense[];
  payments: Payment[];
  guests: Guest[];
  tables: WeddingTable[];
  tasks: Task[];
  vendors: Vendor[];
  timeline: TimelineEvent[];
  photos: GalleryPhoto[];
  notes: NoteItem[];
  notifications: NotificationItem[];
  websiteConfig: WeddingWebsiteConfig;
}

const STORAGE_KEY = "wedding_planner_pro_state_v1";

const initialPhotos: GalleryPhoto[] = [];
const initialNotes: NoteItem[] = [];
const initialNotifications: NotificationItem[] = [];

function getInitialState(): WeddingState {
  if (typeof window !== "undefined") {
    try {
      // If legacy demo data flag is detected, clean up immediately
      const isPurged = localStorage.getItem("weddingly_clean_v1");
      if (!isPurged) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem("weddingly_clean_v1", "true");
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // If stored contains old demo couple, purge it
          if (parsed.wedding?.bride_name === "Nguyễn Minh Anh" || parsed.wedding?.id === "11111111-1111-1111-1111-111111111111") {
            localStorage.removeItem(STORAGE_KEY);
          } else if (parsed.wedding && parsed.tasks) {
            if (!parsed.websiteConfig) {
              parsed.websiteConfig = defaultWebsiteConfig;
            } else if (!parsed.websiteConfig.imageMotion) {
              parsed.websiteConfig.imageMotion = defaultWebsiteConfig.imageMotion;
            }
            if (Array.isArray(parsed.tasks)) {
              parsed.tasks = parsed.tasks.filter((t: any) => !t.deleted_at);
            }
            if (Array.isArray(parsed.expenses)) {
              parsed.expenses = parsed.expenses.filter((e: any) => !e.deleted_at);
            }
            if (Array.isArray(parsed.guests)) {
              parsed.guests = parsed.guests.filter((g: any) => !g.deleted_at);
            }
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }

  return {
    wedding: initialSeedWedding,
    allWeddings: [initialSeedWedding],
    categories: initialSeedCategories,
    expenses: initialSeedExpenses,
    payments: initialSeedPayments,
    guests: initialSeedGuests,
    tables: initialSeedTables,
    tasks: initialSeedTasks,
    vendors: initialSeedVendors,
    timeline: initialSeedTimeline,
    photos: initialPhotos,
    notes: initialNotes,
    notifications: initialNotifications,
    websiteConfig: defaultWebsiteConfig,
  };
}

let currentState: WeddingState = getInitialState();

function persistState() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      window.dispatchEvent(new Event("wedding_store_updated"));
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }
}

export const WeddingStore = {
  getState(): WeddingState {
    return currentState;
  },

  // Clear all demo data completely and reset to blank clean state
  clearAllDemoData(): void {
    currentState = {
      wedding: initialSeedWedding,
      allWeddings: [initialSeedWedding],
      categories: initialSeedCategories,
      expenses: [],
      payments: [],
      guests: [],
      tables: [],
      tasks: [],
      vendors: [],
      timeline: [],
      photos: [],
      notes: [],
      notifications: [],
      websiteConfig: defaultWebsiteConfig,
    };
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem("weddingly_clean_v1", "true");
    }
    persistState();
  },

  // Sync state directly with remote Supabase database
  async syncWithSupabase(): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data: weddings, error } = await supabase.from("weddings").select("*").limit(5);
      if (!error && weddings && weddings.length > 0) {
        currentState.wedding = weddings[0];
        currentState.allWeddings = weddings;
        const [tasksRes, expRes, gstRes] = await Promise.all([
          supabase.from("tasks").select("*").eq("wedding_id", weddings[0].id),
          supabase.from("expenses").select("*").eq("wedding_id", weddings[0].id),
          supabase.from("guests").select("*").eq("wedding_id", weddings[0].id),
        ]);
        if (tasksRes.data) currentState.tasks = tasksRes.data;
        if (expRes.data) currentState.expenses = expRes.data;
        if (gstRes.data) currentState.guests = gstRes.data;
        persistState();
        return true;
      }
    } catch (e) {
      console.warn("Supabase sync:", e);
    }
    return false;
  },

  // 1. Wedding Workspace & Profile
  getWedding(): Wedding {
    return currentState.wedding;
  },

  getAllWeddings(): Wedding[] {
    return currentState.allWeddings;
  },

  updateWedding(data: Partial<Wedding>): Wedding {
    currentState.wedding = {
      ...currentState.wedding,
      ...data,
      updated_at: new Date().toISOString(),
    };
    // Also update in allWeddings array
    const idx = currentState.allWeddings.findIndex((w) => w.id === currentState.wedding.id);
    if (idx !== -1) {
      currentState.allWeddings[idx] = currentState.wedding;
    }
    persistState();
    return currentState.wedding;
  },

  switchWedding(id: string): Wedding | null {
    const found = currentState.allWeddings.find((w) => w.id === id);
    if (found) {
      currentState.wedding = found;
      persistState();
      return found;
    }
    return null;
  },

  createWedding(data: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    venue?: string;
    estimatedBudget?: number;
    expectedGuests?: number;
    style?: any;
    coverImageUrl?: string;
  }): Wedding {
    const newWedding: Wedding = {
      id: crypto.randomUUID(),
      name: `Đám cưới ${data.brideName} & ${data.groomName}`,
      slug: `${data.brideName.toLowerCase().replace(/\s+/g, "-")}-${data.groomName.toLowerCase().replace(/\s+/g, "-")}-${new Date(data.weddingDate).getFullYear()}`,
      bride_name: data.brideName,
      groom_name: data.groomName,
      wedding_date: data.weddingDate,
      venue: data.venue || null,
      estimated_budget: data.estimatedBudget || 300000000,
      expected_guests: data.expectedGuests || 200,
      style: data.style || "Modern",
      status: "PLANNING",
      owner_id: "00000000-0000-0000-0000-000000000001",
      cover_image_url: data.coverImageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    currentState.allWeddings.push(newWedding);
    currentState.wedding = newWedding;
    persistState();
    return newWedding;
  },

  // 2. Tasks CRUD
  getTasks(): Task[] {
    return currentState.tasks.filter((t) => !t.deleted_at);
  },

  addTask(data: {
    title: string;
    description?: string | null;
    category?: string;
    priority?: TaskPriority;
    dueDate?: string | null;
    estimatedCost?: number;
    status?: TaskStatus;
  }): Task {
    const newTask: Task = {
      id: crypto.randomUUID(),
      wedding_id: currentState.wedding.id,
      title: data.title,
      description: data.description || null,
      category: data.category || "Chung",
      status: data.status || "TODO",
      priority: data.priority || "MEDIUM",
      due_date: data.dueDate || null,
      assignee_id: null,
      estimated_cost: data.estimatedCost || 0,
      sort_order: currentState.tasks.length + 1,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    currentState.tasks.unshift(newTask);
    persistState();
    return newTask;
  },

  updateTask(id: string, data: Partial<Task>): Task | null {
    const task = currentState.tasks.find((t) => t.id === id);
    if (!task) return null;
    Object.assign(task, data, { updated_at: new Date().toISOString() });
    persistState();
    return task;
  },

  deleteTask(id: string): boolean {
    const idx = currentState.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      currentState.tasks.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  // 3. Budget, Expenses & Payments Interconnection
  getCategories(): BudgetCategory[] {
    return currentState.categories;
  },

  updateCategory(id: string, data: Partial<BudgetCategory>): BudgetCategory | null {
    const cat = currentState.categories.find((c) => c.id === id);
    if (!cat) return null;
    Object.assign(cat, data);
    persistState();
    return cat;
  },

  getExpenses(): Expense[] {
    return currentState.expenses.filter((e) => !e.deleted_at);
  },

  addExpense(data: {
    title: string;
    categoryName: string;
    amount: number;
    expenseDate: string;
    vendorName?: string | null;
    paymentStatus?: PaymentStatus;
    receiptUrl?: string | null;
    notes?: string | null;
  }): Expense {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      wedding_id: currentState.wedding.id,
      category_id: null,
      category_name: data.categoryName,
      title: data.title,
      vendor_name: data.vendorName || null,
      amount: Number(data.amount),
      expense_date: data.expenseDate,
      payment_status: data.paymentStatus || "PAID",
      receipt_url: data.receiptUrl || null,
      notes: data.notes || null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    currentState.expenses.unshift(newExpense);

    // Auto-create or link payment if marked as PARTIAL or PENDING
    if (data.vendorName && (data.paymentStatus === "PARTIAL" || data.paymentStatus === "PENDING")) {
      const existingPay = currentState.payments.find((p) => p.vendor_name.toLowerCase() === data.vendorName?.toLowerCase());
      if (!existingPay) {
        currentState.payments.unshift({
          id: crypto.randomUUID(),
          wedding_id: currentState.wedding.id,
          expense_id: newExpense.id,
          vendor_name: data.vendorName,
          total_amount: Number(data.amount),
          deposit_amount: data.paymentStatus === "PARTIAL" ? Math.round(Number(data.amount) * 0.3) : 0,
          paid_amount: data.paymentStatus === "PARTIAL" ? Math.round(Number(data.amount) * 0.3) : 0,
          remaining_amount: data.paymentStatus === "PARTIAL" ? Math.round(Number(data.amount) * 0.7) : Number(data.amount),
          due_date: data.expenseDate,
          status: data.paymentStatus,
          notes: `Tự động liên kết từ khoản chi: ${data.title}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    persistState();
    return newExpense;
  },

  updateExpense(id: string, data: Partial<Expense>): Expense | null {
    const exp = currentState.expenses.find((e) => e.id === id);
    if (!exp) return null;
    Object.assign(exp, data, { updated_at: new Date().toISOString() });
    persistState();
    return exp;
  },

  deleteExpense(id: string): boolean {
    const idx = currentState.expenses.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const expId = currentState.expenses[idx].id;
      const payIdx = currentState.payments.findIndex((p) => p.expense_id === expId);
      if (payIdx !== -1) {
        currentState.payments.splice(payIdx, 1);
      }
      currentState.expenses.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  getPayments(): Payment[] {
    return currentState.payments;
  },

  addPayment(data: {
    vendorName: string;
    totalAmount: number;
    depositAmount?: number;
    paidAmount?: number;
    dueDate?: string | null;
    status?: PaymentStatus;
    notes?: string | null;
  }): Payment {
    const paid = Number(data.paidAmount ?? data.depositAmount ?? 0);
    const total = Number(data.totalAmount);
    const remaining = total - paid;
    const computedStatus: PaymentStatus =
      data.status || (paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING");

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      wedding_id: currentState.wedding.id,
      expense_id: null,
      vendor_name: data.vendorName,
      total_amount: total,
      deposit_amount: Number(data.depositAmount || 0),
      paid_amount: paid,
      remaining_amount: remaining > 0 ? remaining : 0,
      due_date: data.dueDate || null,
      status: computedStatus,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    currentState.payments.unshift(newPayment);
    persistState();
    return newPayment;
  },

  updatePayment(id: string, data: Partial<Payment>): Payment | null {
    const pay = currentState.payments.find((p) => p.id === id);
    if (!pay) return null;

    if (data.total_amount !== undefined || data.paid_amount !== undefined) {
      const total = data.total_amount !== undefined ? Number(data.total_amount) : pay.total_amount;
      const paid = data.paid_amount !== undefined ? Number(data.paid_amount) : pay.paid_amount;
      data.remaining_amount = Math.max(0, total - paid);
      if (!data.status) {
        data.status = paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING";
      }
    }

    Object.assign(pay, data, { updated_at: new Date().toISOString() });
    persistState();
    return pay;
  },

  deletePayment(id: string): boolean {
    const idx = currentState.payments.findIndex((p) => p.id === id);
    if (idx !== -1) {
      currentState.payments.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  // 4. Guests & Tables Interconnection
  getGuests(): Guest[] {
    return currentState.guests.filter((g) => !g.deleted_at);
  },

  addGuest(data: {
    name: string;
    phone?: string | null;
    email?: string | null;
    groupName: any;
    side: any;
    plusOne?: boolean;
    children?: number;
    rsvpStatus?: RSVPStatus;
    mealPreference?: string | null;
    tableId?: string | null;
    notes?: string | null;
  }): Guest {
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      wedding_id: currentState.wedding.id,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      group_name: data.groupName,
      side: data.side,
      plus_one: data.plusOne || false,
      children: Number(data.children || 0),
      rsvp_status: data.rsvpStatus || "PENDING",
      rsvp_token: `token-${Math.random().toString(36).substring(2, 11)}`,
      meal_preference: data.mealPreference || null,
      table_id: data.tableId || null,
      gift_amount: 0,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    currentState.guests.unshift(newGuest);
    persistState();
    return newGuest;
  },

  updateGuest(id: string, data: Partial<Guest>): Guest | null {
    const guest = currentState.guests.find((g) => g.id === id);
    if (!guest) return null;
    Object.assign(guest, data, { updated_at: new Date().toISOString() });
    persistState();
    return guest;
  },

  deleteGuest(id: string): boolean {
    const idx = currentState.guests.findIndex((g) => g.id === id);
    if (idx !== -1) {
      currentState.guests.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  getTables(): WeddingTable[] {
    return currentState.tables;
  },

  addTable(data: { name: string; capacity?: number; tableType?: any }): WeddingTable {
    const newTable: WeddingTable = {
      id: crypto.randomUUID(),
      wedding_id: currentState.wedding.id,
      name: data.name,
      capacity: Number(data.capacity || 10),
      table_type: data.tableType || "ROUND",
      sort_order: currentState.tables.length + 1,
      created_at: new Date().toISOString(),
    };
    currentState.tables.push(newTable);
    persistState();
    return newTable;
  },

  updateTable(id: string, data: Partial<WeddingTable>): WeddingTable | null {
    const table = currentState.tables.find((t) => t.id === id);
    if (!table) return null;
    Object.assign(table, data);
    persistState();
    return table;
  },

  deleteTable(id: string): boolean {
    const idx = currentState.tables.findIndex((t) => t.id === id);
    if (idx !== -1) {
      // Unseat all guests in this table
      const tableId = currentState.tables[idx].id;
      currentState.guests.forEach((g) => {
        if (g.table_id === tableId) {
          g.table_id = null;
        }
      });
      currentState.tables.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  assignGuestToTable(guestId: string, tableId: string | null): { success: boolean; error?: string } {
    if (tableId) {
      const table = currentState.tables.find((t) => t.id === tableId);
      if (!table) return { success: false, error: "Không tìm thấy bàn tiệc" };

      const seatedCount = currentState.guests.filter((g) => g.table_id === tableId && g.id !== guestId && !g.deleted_at).length;
      if (seatedCount >= table.capacity) {
        return { success: false, error: `Bàn "${table.name}" đã đầy, đạt sức chứa tối đa (${table.capacity}/${table.capacity} khách)` };
      }
    }

    const guest = currentState.guests.find((g) => g.id === guestId);
    if (guest) {
      guest.table_id = tableId;
      guest.updated_at = new Date().toISOString();
      persistState();
      return { success: true };
    }
    return { success: false, error: "Không tìm thấy khách mời" };
  },

  // 5. Vendors & Supplier Linking
  getVendors(): Vendor[] {
    return currentState.vendors;
  },

  addVendor(data: {
    name: string;
    category: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    price?: number;
    rating?: number;
    status?: VendorStatus;
    notes?: string | null;
  }): Vendor {
    const newVendor: Vendor = {
      id: crypto.randomUUID(),
      wedding_id: currentState.wedding.id,
      name: data.name,
      category: data.category,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      price: Number(data.price || 0),
      rating: Number(data.rating || 5),
      status: data.status || "INQUIRY",
      is_favorite: false,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    currentState.vendors.unshift(newVendor);

    // If booked with price > 0, auto-link payment schedule if none exists
    if (newVendor.status === "BOOKED" && newVendor.price > 0) {
      const hasPayment = currentState.payments.some((p) => p.vendor_name.toLowerCase() === newVendor.name.toLowerCase());
      if (!hasPayment) {
        currentState.payments.push({
          id: crypto.randomUUID(),
          wedding_id: currentState.wedding.id,
          expense_id: null,
          vendor_name: newVendor.name,
          total_amount: newVendor.price,
          deposit_amount: Math.round(newVendor.price * 0.3),
          paid_amount: 0,
          remaining_amount: newVendor.price,
          due_date: currentState.wedding.wedding_date,
          status: "PENDING",
          notes: `Lịch thanh toán liên kết từ đối tác ${newVendor.category}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    persistState();
    return newVendor;
  },

  updateVendor(id: string, data: Partial<Vendor>): Vendor | null {
    const vendor = currentState.vendors.find((v) => v.id === id);
    if (!vendor) return null;
    Object.assign(vendor, data, { updated_at: new Date().toISOString() });
    persistState();
    return vendor;
  },

  deleteVendor(id: string): boolean {
    const idx = currentState.vendors.findIndex((v) => v.id === id);
    if (idx !== -1) {
      currentState.vendors.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  // 6. Timeline Events CRUD
  getTimeline(): TimelineEvent[] {
    return [...currentState.timeline].sort((a, b) => a.start_time.localeCompare(b.start_time));
  },

  addTimelineEvent(data: {
    title: string;
    eventDate: string;
    startTime: string;
    endTime?: string | null;
    location?: string | null;
    assigneeName?: string | null;
    contactPhone?: string | null;
    description?: string | null;
  }): TimelineEvent {
    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      wedding_id: currentState.wedding.id,
      title: data.title,
      event_date: data.eventDate,
      start_time: data.startTime,
      end_time: data.endTime || null,
      location: data.location || null,
      assignee_name: data.assigneeName || null,
      contact_phone: data.contactPhone || null,
      description: data.description || null,
      status: "UPCOMING",
      sort_order: currentState.timeline.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    currentState.timeline.push(newEvent);
    persistState();
    return newEvent;
  },

  updateTimelineEvent(id: string, data: Partial<TimelineEvent>): TimelineEvent | null {
    const evt = currentState.timeline.find((e) => e.id === id);
    if (!evt) return null;
    Object.assign(evt, data, { updated_at: new Date().toISOString() });
    persistState();
    return evt;
  },

  deleteTimelineEvent(id: string): boolean {
    const idx = currentState.timeline.findIndex((e) => e.id === id);
    if (idx !== -1) {
      currentState.timeline.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  // 7. Gallery Photos CRUD & Uploads
  getPhotos(): GalleryPhoto[] {
    return currentState.photos;
  },

  addPhoto(photo: { album: string; url: string; caption?: string; isFavorite?: boolean }): GalleryPhoto {
    const newPhoto: GalleryPhoto = {
      id: crypto.randomUUID(),
      album: photo.album,
      url: photo.url,
      caption: photo.caption || "Khoảnh khắc kỷ niệm",
      isFavorite: photo.isFavorite || false,
      uploadedAt: new Date().toISOString(),
    };
    currentState.photos.unshift(newPhoto);
    persistState();
    return newPhoto;
  },

  updatePhoto(id: string, data: Partial<GalleryPhoto>): GalleryPhoto | null {
    const p = currentState.photos.find((item) => item.id === id);
    if (!p) return null;
    Object.assign(p, data);
    persistState();
    return p;
  },

  deletePhoto(id: string): boolean {
    const idx = currentState.photos.findIndex((p) => p.id === id);
    if (idx !== -1) {
      currentState.photos.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  // 8. Notes CRUD
  getNotes(): NoteItem[] {
    return currentState.notes;
  },

  addNote(data: { title: string; content: string; category?: any }): NoteItem {
    const newNote: NoteItem = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      category: data.category || "Planning",
      isPinned: false,
      date: new Date().toISOString().split("T")[0],
    };
    currentState.notes.unshift(newNote);
    persistState();
    return newNote;
  },

  updateNote(id: string, data: Partial<NoteItem>): NoteItem | null {
    const n = currentState.notes.find((item) => item.id === id);
    if (!n) return null;
    Object.assign(n, data);
    persistState();
    return n;
  },

  deleteNote(id: string): boolean {
    const idx = currentState.notes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      currentState.notes.splice(idx, 1);
      persistState();
      return true;
    }
    return false;
  },

  // 9. Notifications
  getNotifications(): NotificationItem[] {
    return currentState.notifications;
  },

  markNotificationRead(id: string) {
    const n = currentState.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      persistState();
    }
  },

  markAllNotificationsRead() {
    currentState.notifications.forEach((n) => (n.isRead = true));
    persistState();
  },

  addNotification(item: Omit<NotificationItem, "id" | "isRead" | "time">) {
    currentState.notifications.unshift({
      ...item,
      id: crypto.randomUUID(),
      isRead: false,
      time: "Vừa xong",
    });
    persistState();
  },

  // 10. Wedding Website Customization & Builder Config
  getWebsiteConfig(): WeddingWebsiteConfig {
    if (!currentState.websiteConfig) {
      currentState.websiteConfig = defaultWebsiteConfig;
    } else if (!currentState.websiteConfig.imageMotion) {
      currentState.websiteConfig.imageMotion = defaultWebsiteConfig.imageMotion;
    }
    return currentState.websiteConfig;
  },

  saveWebsiteConfig(data: Partial<WeddingWebsiteConfig>): WeddingWebsiteConfig {
    if (!currentState.websiteConfig) {
      currentState.websiteConfig = defaultWebsiteConfig;
    }
    currentState.websiteConfig = {
      ...currentState.websiteConfig,
      ...data,
    };

    // Auto-sync couple names and cover photo to the core Wedding model
    if (data.couple) {
      if (data.couple.brideName) currentState.wedding.bride_name = data.couple.brideName;
      if (data.couple.groomName) currentState.wedding.groom_name = data.couple.groomName;
    }
    if (data.hero?.coverImageUrl) {
      currentState.wedding.cover_image_url = data.hero.coverImageUrl;
    }

    persistState();
    return currentState.websiteConfig;
  },
};
