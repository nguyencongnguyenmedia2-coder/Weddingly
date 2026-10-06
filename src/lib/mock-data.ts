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
  Checklist,
  NotificationItem,
} from "@/types/database";

// Clean Initial Wedding Workspace
export const initialSeedWedding: Wedding = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Đám cưới của chúng mình",
  slug: "dam-cuoi-weddingly",
  bride_name: "Cô dâu",
  groom_name: "Chú rể",
  wedding_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  venue: "Chưa chọn địa điểm",
  estimated_budget: 0,
  expected_guests: 0,
  style: "Luxury",
  status: "PLANNING",
  owner_id: "00000000-0000-0000-0000-000000000001",
  cover_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

// Standard Recommended Budget Categories (Starting with 0 VND)
export const initialSeedCategories: BudgetCategory[] = [
  { id: "bc-1", wedding_id: initialSeedWedding.id, name: "Địa điểm & Tiệc cưới", allocated_amount: 0, percentage: 50, color: "#8B5E5A", created_at: new Date().toISOString() },
  { id: "bc-2", wedding_id: initialSeedWedding.id, name: "Trang trí & Hoa tươi", allocated_amount: 0, percentage: 12, color: "#D6BE91", created_at: new Date().toISOString() },
  { id: "bc-3", wedding_id: initialSeedWedding.id, name: "Quay phim & Chụp ảnh", allocated_amount: 0, percentage: 12, color: "#B89E6C", created_at: new Date().toISOString() },
  { id: "bc-4", wedding_id: initialSeedWedding.id, name: "Váy cưới & Trang phục", allocated_amount: 0, percentage: 8, color: "#B48B87", created_at: new Date().toISOString() },
  { id: "bc-5", wedding_id: initialSeedWedding.id, name: "Trang điểm cô dâu & Mẹ", allocated_amount: 0, percentage: 3, color: "#3F7D5A", created_at: new Date().toISOString() },
  { id: "bc-6", wedding_id: initialSeedWedding.id, name: "Thiệp mời & Quà cảm ơn", allocated_amount: 0, percentage: 3, color: "#C68A27", created_at: new Date().toISOString() },
  { id: "bc-7", wedding_id: initialSeedWedding.id, name: "Âm thanh, Ánh sáng & MC", allocated_amount: 0, percentage: 5, color: "#423633", created_at: new Date().toISOString() },
  { id: "bc-8", wedding_id: initialSeedWedding.id, name: "Dự phòng phát sinh", allocated_amount: 0, percentage: 7, color: "#6B5E5B", created_at: new Date().toISOString() },
];

// Clean lists - Zero Demo Data
export const initialSeedExpenses: Expense[] = [];
export const initialSeedPayments: Payment[] = [];
export const initialSeedTables: WeddingTable[] = [];
export const initialSeedGuests: Guest[] = [];
export const initialSeedTasks: Task[] = [];
export const initialSeedVendors: Vendor[] = [];
export const initialSeedTimeline: TimelineEvent[] = [];
