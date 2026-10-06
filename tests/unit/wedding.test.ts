import { describe, it, expect } from "vitest";
import { WeddingService } from "@/services/wedding.service";
import { BudgetService } from "@/services/budget.service";
import { GuestService } from "@/services/guest.service";
import { TaskService } from "@/services/task.service";

describe("Wedding Planner Pro - Unit & Business Logic Tests", () => {
  describe("Countdown Calculations", () => {
    it("should handle null or undefined date gracefully", () => {
      const res = WeddingService.calculateCountdown(null);
      expect(res.isPast).toBe(false);
      expect(res.formattedString).toBe("Chưa xác định ngày");
    });

    it("should calculate positive remaining days for future wedding date", () => {
      const futureDate = "2027-05-15";
      const res = WeddingService.calculateCountdown(futureDate);
      expect(res.isPast).toBe(false);
      expect(res.totalDays).toBeGreaterThan(0);
      expect(res.formattedString).toContain("Còn");
    });

    it("should correctly identify past wedding dates", () => {
      const pastDate = "2020-01-01";
      const res = WeddingService.calculateCountdown(pastDate);
      expect(res.isPast).toBe(true);
      expect(res.formattedString).toBe("Đám cưới đã diễn ra trọn vẹn ❤️");
    });
  });

  describe("Budget Management Calculations", () => {
    it("should calculate remaining budget accurately with 0 overBudget", async () => {
      await BudgetService.addExpense({
        categoryName: "Tiệc cưới",
        title: "Chi phí kiểm thử",
        amount: 50000000,
        expenseDate: "2026-10-06",
      });
      const summary = await BudgetService.getBudgetSummary(300000000);
      expect(summary.totalBudget).toBe(300000000);
      expect(summary.totalSpent).toBeGreaterThan(0);
      expect(summary.remainingBudget).toBe(summary.totalBudget - summary.totalSpent);
      expect(summary.overBudgetAmount).toBe(0);
    });

    it("should throw error when adding negative expense amount", async () => {
      await expect(
        BudgetService.addExpense({
          title: "Invalid negative expense",
          categoryName: "Chung",
          amount: -500000,
          expenseDate: "2026-10-05",
        })
      ).rejects.toThrow("Số tiền chi tiêu không được âm");
    });

    it("should provide smart 8-category recommendations matching 100%", () => {
      const recs = BudgetService.getSmartBudgetRecommendations(300000000);
      expect(recs.length).toBe(8);
      const totalPct = recs.reduce((sum, r) => sum + r.percentage, 0);
      expect(Math.round(totalPct)).toBe(100);
    });
  });

  describe("Table Seating Capacity Rules", () => {
    it("should not allow assigning a guest to an already full table", async () => {
      // Create test table with capacity 1
      const testTable = await GuestService.createTable("Bàn Test 1 chỗ", 1);
      
      // Add two guests
      const g1 = await GuestService.addGuest({
        name: "Khách 1",
        groupName: "Bạn bè",
        side: "BOTH",
      });
      const g2 = await GuestService.addGuest({
        name: "Khách 2",
        groupName: "Bạn bè",
        side: "BOTH",
      });

      // Assign first guest -> success
      const res1 = await GuestService.assignGuestToTable(g1.id, testTable.id);
      expect(res1.success).toBe(true);

      // Assign second guest -> must fail with error message
      const res2 = await GuestService.assignGuestToTable(g2.id, testTable.id);
      expect(res2.success).toBe(false);
      expect(res2.error).toContain("đã đầy");
    });
  });

  describe("Guest RSVP Status Transition", () => {
    it("should update guest attendance and dietary preferences by token", async () => {
      const guest = await GuestService.addGuest({
        name: "Khách RSVP Test",
        groupName: "Đồng nghiệp",
        side: "GROOM",
      });

      const updated = await GuestService.updateGuestRSVP(guest.rsvp_token, {
        attending: true,
        guestCount: 2,
        childrenCount: 1,
        mealChoice: "Ăn chay",
        wishes: "Trăm năm hạnh phúc!",
      });

      expect(updated).not.toBeNull();
      expect(updated?.rsvp_status).toBe("CONFIRMED");
      expect(updated?.plus_one).toBe(true);
      expect(updated?.children).toBe(1);
      expect(updated?.meal_preference).toBe("Ăn chay");
    });
  });

  describe("Task & Smart Milestones", () => {
    it("should add a task and allow status transitions", async () => {
      const task = await TaskService.addTask({
        title: "Test Task Creation",
        category: "Địa điểm",
        priority: "HIGH",
      });
      expect(task.status).toBe("TODO");

      const inProgressTask = await TaskService.updateTaskStatus(task.id, "IN_PROGRESS");
      expect(inProgressTask?.status).toBe("IN_PROGRESS");

      const completedTask = await TaskService.updateTaskStatus(task.id, "COMPLETED");
      expect(completedTask?.status).toBe("COMPLETED");
    });

    it("should return milestones for smart checklist", () => {
      const milestones = TaskService.getSmartMilestones();
      expect(milestones.length).toBe(6);
      expect(milestones[0].monthsBefore).toBe(12);
      expect(milestones[milestones.length - 1].monthsBefore).toBe(0.25);
    });

    it("should successfully delete a task", async () => {
      const task = await TaskService.addTask({
        title: "Task to be deleted",
        category: "Chung",
      });
      const initialTasks = await TaskService.getTasks();
      expect(initialTasks.some((t) => t.id === task.id)).toBe(true);

      const deleted = await TaskService.deleteTask(task.id);
      expect(deleted).toBe(true);

      const afterTasks = await TaskService.getTasks();
      expect(afterTasks.some((t) => t.id === task.id)).toBe(false);
    });
  });

  describe("Item Deletion Operations", () => {
    it("should successfully delete an expense and clean up", async () => {
      const expense = await BudgetService.addExpense({
        title: "Chi phí hoa cưới test",
        categoryName: "Trang trí & Hoa tươi",
        amount: 2500000,
        expenseDate: "2026-10-06",
      });
      const expensesBefore = await BudgetService.getExpenses();
      expect(expensesBefore.some((e) => e.id === expense.id)).toBe(true);

      const deleted = await BudgetService.deleteExpense(expense.id);
      expect(deleted).toBe(true);

      const expensesAfter = await BudgetService.getExpenses();
      expect(expensesAfter.some((e) => e.id === expense.id)).toBe(false);
    });

    it("should successfully delete a payment schedule", async () => {
      const payment = await BudgetService.addPayment({
        vendorName: "Nhà cung cấp Test",
        totalAmount: 10000000,
      });
      const paymentsBefore = await BudgetService.getPayments();
      expect(paymentsBefore.some((p) => p.id === payment.id)).toBe(true);

      const deleted = await BudgetService.deletePayment(payment.id);
      expect(deleted).toBe(true);

      const paymentsAfter = await BudgetService.getPayments();
      expect(paymentsAfter.some((p) => p.id === payment.id)).toBe(false);
    });

    it("should successfully delete a guest", async () => {
      const guest = await GuestService.addGuest({
        name: "Khách mời Test Xóa",
        groupName: "Bạn bè",
        side: "BOTH",
      });
      const guestsBefore = await GuestService.getGuests();
      expect(guestsBefore.some((g) => g.id === guest.id)).toBe(true);

      const deleted = await GuestService.deleteGuest(guest.id);
      expect(deleted).toBe(true);

      const guestsAfter = await GuestService.getGuests();
      expect(guestsAfter.some((g) => g.id === guest.id)).toBe(false);
    });
  });

  describe("Subscription Plan & Quotas (Free vs Pro)", () => {
    it("should allow up to 50 guests on FREE and block above 50", async () => {
      const { TierService } = await import("@/services/tier.service");
      expect(TierService.canAddGuest(49, "FREE").allowed).toBe(true);
      expect(TierService.canAddGuest(50, "FREE").allowed).toBe(false);
      expect(TierService.canAddGuest(50, "FREE").message).toContain("Gói Miễn Phí");
    });

    it("should allow unlimited guests on PRO plan", async () => {
      const { TierService } = await import("@/services/tier.service");
      expect(TierService.canAddGuest(50, "PRO").allowed).toBe(true);
      expect(TierService.canAddGuest(500, "PRO").allowed).toBe(true);
    });

    it("should enforce expense quota limit for FREE and unlimited for PRO", async () => {
      const { TierService } = await import("@/services/tier.service");
      expect(TierService.canAddExpense(14, "FREE").allowed).toBe(true);
      expect(TierService.canAddExpense(15, "FREE").allowed).toBe(false);
      expect(TierService.canAddExpense(100, "PRO").allowed).toBe(true);
    });
  });
});
