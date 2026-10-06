export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WeddingRole = "OWNER" | "PARTNER" | "PLANNER" | "FAMILY" | "VIEWER";
export type WeddingStyle = "Luxury" | "Modern" | "Minimal" | "Garden" | "Beach" | "Rustic" | "Traditional" | "Korean" | "European";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type RSVPStatus = "PENDING" | "CONFIRMED" | "DECLINED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
export type VendorStatus = "INQUIRY" | "CONTACTED" | "QUOTED" | "BOOKED" | "DECLINED";
export type GuestSide = "BRIDE" | "GROOM" | "BOTH";
export type SubscriptionPlan = "FREE" | "PRO";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: "USER" | "PLANNER" | "ADMIN";
  locale: string;
  plan?: SubscriptionPlan;
  plan_expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wedding {
  id: string;
  name: string;
  slug: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue: string | null;
  estimated_budget: number;
  expected_guests: number;
  style: WeddingStyle;
  status: "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  owner_id: string;
  cover_image_url: string | null;
  plan?: SubscriptionPlan;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WeddingMember {
  id: string;
  wedding_id: string;
  user_id: string;
  role: WeddingRole;
  invited_email: string | null;
  invitation_status: "PENDING" | "ACCEPTED" | "DECLINED";
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  wedding_id: string;
  title: string;
  description: string | null;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  estimated_cost: number;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Checklist {
  id: string;
  wedding_id: string;
  name: string;
  category: string;
  months_before_wedding: number;
  created_at: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  wedding_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface BudgetCategory {
  id: string;
  wedding_id: string;
  name: string;
  allocated_amount: number;
  percentage: number;
  color: string;
  created_at: string;
}

export interface Expense {
  id: string;
  wedding_id: string;
  category_id: string | null;
  category_name: string;
  title: string;
  vendor_name: string | null;
  amount: number;
  expense_date: string;
  payment_status: PaymentStatus;
  receipt_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Payment {
  id: string;
  wedding_id: string;
  expense_id: string | null;
  vendor_name: string;
  total_amount: number;
  deposit_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string | null;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeddingTable {
  id: string;
  wedding_id: string;
  name: string;
  capacity: number;
  table_type: "ROUND" | "RECTANGLE" | "VIP" | "LONG";
  sort_order: number;
  created_at: string;
  guests?: Guest[];
}

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  group_name: "Gia đình" | "Bạn bè" | "Đồng nghiệp" | "VIP" | "Nhà gái" | "Nhà trai";
  side: GuestSide;
  plus_one: boolean;
  children: number;
  rsvp_status: RSVPStatus;
  rsvp_token: string;
  meal_preference: string | null;
  table_id: string | null;
  gift_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Vendor {
  id: string;
  wedding_id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  price: number;
  rating: number;
  status: VendorStatus;
  is_favorite: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  wedding_id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  assignee_name: string | null;
  contact_phone: string | null;
  description: string | null;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  wedding_id: string;
  vendor_id: string;
  contract_number: string | null;
  title: string;
  amount: number;
  deposit: number;
  start_date: string | null;
  end_date: string | null;
  file_url: string | null;
  file_type: string | null;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeddingWebsite {
  id: string;
  wedding_id: string;
  slug: string;
  title: string;
  template: "Luxury" | "Elegant" | "Minimal" | "Garden" | "Modern" | "Traditional";
  our_story: string | null;
  cover_photo: string | null;
  is_published: boolean;
  theme_config: {
    font?: string;
    primaryColor?: string;
  };
  guestbook_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  wedding_id: string;
  title: string;
  template: string;
  parents_info: {
    brideParents?: string;
    groomParents?: string;
  };
  dress_code: string;
  gift_info: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  share_slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  wedding_id: string;
  user_id: string;
  type: "TASK_DUE" | "TASK_OVERDUE" | "PAYMENT_DUE" | "RSVP" | "BUDGET_ALERT" | "VENDOR" | "TIMELINE" | "MILESTONE";
  title: string;
  message: string;
  is_read: boolean;
  link_url: string | null;
  created_at: string;
}
