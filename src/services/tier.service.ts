import { SubscriptionPlan } from "@/types/database";

export interface PlanFeature {
  name: string;
  free: string;
  pro: string;
  vip: string;
  highlight?: boolean;
}

export const PLAN_FEATURES: PlanFeature[] = [
  {
    name: "Số lượng khách mời",
    free: "Tối đa 50 khách",
    pro: "Không giới hạn",
    vip: "Không giới hạn (Phân nhóm VIP)",
    highlight: true,
  },
  {
    name: "Sổ chi tiêu & Hoá đơn",
    free: "Tối đa 15 khoản chi",
    pro: "Không giới hạn",
    vip: "Không giới hạn & Dự báo thông minh",
    highlight: true,
  },
  {
    name: "Điểm danh RSVP qua link riêng",
    free: "Cơ bản",
    pro: "Tự động 1 chạm qua Zalo/FB",
    vip: "RSVP động + Nhận mã QR check-in sảnh",
  },
  {
    name: "Sơ đồ xếp bàn tiệc",
    free: "Tối đa 5 bàn",
    pro: "Không giới hạn sảnh tiệc",
    vip: "Không giới hạn + 3D View sảnh cưới",
  },
  {
    name: "Website đám cưới cá nhân",
    free: "1 giao diện cơ bản",
    pro: "Motion VIP & Theme cao cấp",
    vip: "Tên miền riêng (.com/.vn) & Nhạc nền bản quyền",
    highlight: true,
  },
  {
    name: "Trợ lý ảo Emma AI",
    free: "10 câu hỏi / ngày",
    pro: "Không giới hạn",
    vip: "AI Cao Cấp GPT-4o / Claude Opus Wedding Specialist",
  },
  {
    name: "Bộ thiệp cưới online (e-Invitation)",
    free: "1 mẫu tĩnh",
    pro: "5 mẫu Motion tương tác",
    vip: "Không giới hạn + Hiệu ứng mở thiệp 3D",
  },
  {
    name: "Xuất file báo cáo tài chính",
    free: "Không hỗ trợ",
    pro: "Xuất Excel / PDF",
    vip: "Báo cáo kiểm toán & Hợp đồng mẫu chuẩn",
  },
  {
    name: "Hỗ trợ & Đồng hành",
    free: "Cộng đồng hỗ trợ",
    pro: "Hỗ trợ ưu tiên 24/7",
    vip: "Chuyên viên Wedding Planner 1-on-1 riêng biệt",
    highlight: true,
  },
];

export class TierService {
  static getQuota(plan: SubscriptionPlan = "FREE") {
    if (plan === "VIP") {
      return {
        maxGuests: Infinity,
        maxExpenses: Infinity,
        maxTables: Infinity,
        aiDailyLimit: Infinity,
        name: "Gói Kim Cương (VIP LUXURY)",
        price: "999.000 ₫",
      };
    }

    if (plan === "PRO") {
      return {
        maxGuests: Infinity,
        maxExpenses: Infinity,
        maxTables: Infinity,
        aiDailyLimit: Infinity,
        name: "Gói Hoàn Mỹ (PRO VIP)",
        price: "499.000 ₫",
      };
    }

    return {
      maxGuests: 50,
      maxExpenses: 15,
      maxTables: 5,
      aiDailyLimit: 10,
      name: "Gói Duyên Khởi (Miễn phí)",
      price: "0 ₫",
    };
  }

  static isPaid(plan: SubscriptionPlan = "FREE"): boolean {
    return plan === "PRO" || plan === "VIP";
  }

  static canAddGuest(currentCount: number, plan: SubscriptionPlan = "FREE"): { allowed: boolean; max: number; message?: string } {
    const quota = this.getQuota(plan);
    if (currentCount >= quota.maxGuests) {
      return {
        allowed: false,
        max: quota.maxGuests,
        message: `Bạn đã đạt giới hạn ${quota.maxGuests} khách mời của Gói Miễn Phí. Vui lòng nâng cấp gói để quản lý không giới hạn khách mời!`,
      };
    }
    return { allowed: true, max: quota.maxGuests };
  }

  static canAddExpense(currentCount: number, plan: SubscriptionPlan = "FREE"): { allowed: boolean; max: number; message?: string } {
    const quota = this.getQuota(plan);
    if (currentCount >= quota.maxExpenses) {
      return {
        allowed: false,
        max: quota.maxExpenses,
        message: `Bạn đã đạt giới hạn ${quota.maxExpenses} khoản chi của Gói Miễn Phí. Vui lòng nâng cấp gói để thêm không giới hạn chi phí!`,
      };
    }
    return { allowed: true, max: quota.maxExpenses };
  }
}
