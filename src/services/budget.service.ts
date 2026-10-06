import { BudgetCategory, Expense, Payment, PaymentStatus } from "@/types/database";
import { WeddingStore } from "@/lib/wedding-store";

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  remainingBudget: number;
  overBudgetAmount: number;
  spentPercentage: number;
}

export class BudgetService {
  static async getCategories(weddingId?: string): Promise<BudgetCategory[]> {
    return WeddingStore.getCategories();
  }

  static async updateCategory(id: string, data: Partial<BudgetCategory>): Promise<BudgetCategory | null> {
    return WeddingStore.updateCategory(id, data);
  }

  static async getExpenses(weddingId?: string): Promise<Expense[]> {
    return WeddingStore.getExpenses();
  }

  static async getPayments(weddingId?: string): Promise<Payment[]> {
    return WeddingStore.getPayments();
  }

  static async getBudgetSummary(totalBudget: number): Promise<BudgetSummary> {
    const activeExpenses = WeddingStore.getExpenses();
    const payments = WeddingStore.getPayments();

    const totalSpent = activeExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalCommitted = payments.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
    const remaining = totalBudget - totalSpent;
    const overBudget = remaining < 0 ? Math.abs(remaining) : 0;
    const spentPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

    return {
      totalBudget,
      totalSpent,
      totalCommitted,
      remainingBudget: remaining > 0 ? remaining : 0,
      overBudgetAmount: overBudget,
      spentPercentage,
    };
  }

  static async addExpense(expense: {
    categoryName: string;
    title: string;
    vendorName?: string | null;
    amount: number;
    expenseDate: string;
    paymentStatus?: PaymentStatus;
    receiptUrl?: string | null;
    notes?: string | null;
  }): Promise<Expense> {
    if (expense.amount < 0) {
      throw new Error("Số tiền chi tiêu không được âm");
    }

    return WeddingStore.addExpense(expense);
  }

  static async updateExpense(id: string, data: Partial<Expense>): Promise<Expense | null> {
    return WeddingStore.updateExpense(id, data);
  }

  static async deleteExpense(id: string): Promise<boolean> {
    return WeddingStore.deleteExpense(id);
  }

  static async addPayment(payment: {
    vendorName: string;
    totalAmount: number;
    depositAmount?: number;
    paidAmount?: number;
    dueDate?: string | null;
    status?: PaymentStatus;
    notes?: string | null;
  }): Promise<Payment> {
    return WeddingStore.addPayment(payment);
  }

  static async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
    return WeddingStore.updatePayment(id, data);
  }

  static async deletePayment(id: string): Promise<boolean> {
    return WeddingStore.deletePayment(id);
  }

  // Recommended budget distribution (Section 60)
  static getSmartBudgetRecommendations(totalBudget: number) {
    return [
      { name: "Địa điểm & Tiệc (Venue & Catering)", percentage: 55, amount: Math.round(totalBudget * 0.55), color: "#8B5E5A" },
      { name: "Trang trí & Hoa tươi (Decoration)", percentage: 10, amount: Math.round(totalBudget * 0.10), color: "#D6BE91" },
      { name: "Chụp ảnh & Quay phim (Photo & Video)", percentage: 13, amount: Math.round(totalBudget * 0.13), color: "#B89E6C" },
      { name: "Váy & Vest cưới (Attire)", percentage: 8, amount: Math.round(totalBudget * 0.08), color: "#B48B87" },
      { name: "Trang điểm & Làm tóc (Beauty)", percentage: 3, amount: Math.round(totalBudget * 0.03), color: "#3F7D5A" },
      { name: "Thiệp & Quà cảm ơn (Invitations)", percentage: 4, amount: Math.round(totalBudget * 0.04), color: "#C68A27" },
      { name: "Âm thanh & MC (Host & Music)", percentage: 2, amount: Math.round(totalBudget * 0.02), color: "#423633" },
      { name: "Dự phòng phát sinh (Contingency)", percentage: 5, amount: Math.round(totalBudget * 0.05), color: "#6B5E5B" },
    ];
  }
}
