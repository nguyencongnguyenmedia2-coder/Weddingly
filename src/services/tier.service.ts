import { SubscriptionPlan } from "@/types/database";

export interface PlanFeature {
  name: string;
  free: string;
  pro: string;
  highlight?: boolean;
}

export const PLAN_FEATURES: PlanFeature[] = [
  {
    name: "Số lượng khách mời",
    free: "Tối đa 50 khách",
    pro: "Không giới hạn",
    highlight: true,
  },
  {
    name: "Sổ chi tiêu & Hoá đơn",
    free: "Tối đa 15 khoản chi",
    pro: "Không giới hạn",
    highlight: true,
  },
  {
    name: "Điểm danh RSVP qua link riêng",
    free: "Cơ bản",
    pro: "Tự động 1 chạm qua Zalo/FB",
  },
  {
    name: "Sơ đồ xếp bàn tiệc",
    free: "Tối đa 5 bàn",
    pro: "Không giới hạn sảnh tiệc",
  },
  {
    name: "Website đám cưới cá nhân",
    free: "1 giao diện tiêu chuẩn",
    pro: "Full hiệu ứng Motion VIP & Theme cao cấp",
    highlight: true,
  },
  {
    name: "Trợ lý ảo Emma AI",
    free: "10 câu hỏi / ngày",
    pro: "Không giới hạn (Gợi ý kịch bản, lời chúc, phong tục)",
  },
  {
    name: "Xuất file báo cáo tài chính",
    free: "Không hỗ trợ",
    pro: "Xuất Excel / PDF chuyên sâu",
  },
  {
    name: "Hỗ trợ kỹ thuật",
    free: "Cộng đồng",
    pro: "Chăm sóc riêng 24/7",
  },
];

export class TierService {
  static getQuota(plan: SubscriptionPlan = "FREE") {
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

  static canAddGuest(currentCount: number, plan: SubscriptionPlan = "FREE"): { allowed: boolean; max: number; message?: string } {
    const quota = this.getQuota(plan);
    if (currentCount >= quota.maxGuests) {
      return {
        allowed: false,
        max: quota.maxGuests,
        message: `Bạn đã đạt giới hạn ${quota.maxGuests} khách mời của Gói Miễn Phí. Vui lòng nâng cấp lên Gói Pro để quản lý không giới hạn khách mời!`,
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
        message: `Bạn đã đạt giới hạn ${quota.maxExpenses} khoản chi của Gói Miễn Phí. Vui lòng nâng cấp lên Gói Pro để thêm không giới hạn chi phí!`,
      };
    }
    return { allowed: true, max: quota.maxExpenses };
  }
}
