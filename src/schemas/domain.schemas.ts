import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2, "Tiêu đề công việc tối thiểu 2 ký tự"),
  description: z.string().optional(),
  category: z.string().default("Chung"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  estimatedCost: z.coerce.number().min(0, "Chi phí ước tính không được âm").default(0),
});

export const budgetCategorySchema = z.object({
  name: z.string().min(2, "Tên hạng mục tối thiểu 2 ký tự"),
  allocatedAmount: z.coerce.number().min(0, "Số tiền phân bổ không được âm"),
  color: z.string().default("#D6BE91"),
});

export const expenseSchema = z.object({
  title: z.string().min(2, "Tên chi phí tối thiểu 2 ký tự"),
  categoryName: z.string().min(1, "Vui lòng chọn danh mục chi phí"),
  vendorName: z.string().optional().nullable(),
  amount: z.coerce.number().min(1, "Số tiền chi phải lớn hơn 0"),
  expenseDate: z.string().min(1, "Vui lòng chọn ngày thanh toán"),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).default("PAID"),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const paymentSchema = z.object({
  vendorName: z.string().min(2, "Tên nhà cung cấp tối thiểu 2 ký tự"),
  totalAmount: z.coerce.number().min(1, "Tổng số tiền phải lớn hơn 0"),
  depositAmount: z.coerce.number().min(0, "Tiền cọc không được âm").default(0),
  paidAmount: z.coerce.number().min(0, "Số tiền đã trả không được âm").default(0),
  dueDate: z.string().optional().nullable(),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).default("PENDING"),
  notes: z.string().optional().nullable(),
});

export const guestSchema = z.object({
  name: z.string().min(2, "Tên khách mời tối thiểu 2 ký tự"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email không hợp lệ").optional().nullable().or(z.literal("")),
  groupName: z.enum(["Gia đình", "Bạn bè", "Đồng nghiệp", "VIP", "Nhà gái", "Nhà trai"]).default("Bạn bè"),
  side: z.enum(["BRIDE", "GROOM", "BOTH"]).default("BOTH"),
  plusOne: z.boolean().default(false),
  children: z.coerce.number().int().min(0, "Số trẻ em không được âm").default(0),
  rsvpStatus: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).default("PENDING"),
  mealPreference: z.string().optional().nullable(),
  tableId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const rsvpPublicSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên của bạn"),
  attending: z.boolean(),
  guestCount: z.coerce.number().int().min(1, "Số lượng khách tham dự tối thiểu là 1").default(1),
  childrenCount: z.coerce.number().int().min(0).default(0),
  mealChoice: z.string().optional(),
  wishes: z.string().optional(),
});

export const vendorSchema = z.object({
  name: z.string().min(2, "Tên nhà cung cấp tối thiểu 2 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email không hợp lệ").optional().nullable().or(z.literal("")),
  website: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  price: z.coerce.number().min(0).default(0),
  rating: z.coerce.number().min(1).max(5).default(5),
  status: z.enum(["INQUIRY", "CONTACTED", "QUOTED", "BOOKED", "DECLINED"]).default("INQUIRY"),
  isFavorite: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export const timelineEventSchema = z.object({
  title: z.string().min(2, "Tiêu đề sự kiện tối thiểu 2 ký tự"),
  eventDate: z.string().min(1, "Vui lòng chọn ngày"),
  startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu (vd: 09:00)"),
  endTime: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  assigneeName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(["UPCOMING", "IN_PROGRESS", "COMPLETED", "DELAYED"]).default("UPCOMING"),
});

export const contractSchema = z.object({
  vendorId: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
  title: z.string().min(2, "Tiêu đề hợp đồng tối thiểu 2 ký tự"),
  contractNumber: z.string().optional().nullable(),
  amount: z.coerce.number().min(0, "Giá trị hợp đồng không được âm"),
  deposit: z.coerce.number().min(0, "Tiền cọc không được âm").default(0),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).default("ACTIVE"),
  notes: z.string().optional().nullable(),
});
