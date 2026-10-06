"use client";

import * as React from "react";
import Link from "next/link";
import {
  PieChart,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Receipt,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  DollarSign,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { formatCurrencyVND } from "@/lib/utils";
import { BudgetService, BudgetSummary } from "@/services/budget.service";
import { WeddingService } from "@/services/wedding.service";
import { BudgetCategory, Expense, Wedding } from "@/types/database";
import { WeddingStore } from "@/lib/wedding-store";

export default function BudgetPage() {
  const [wedding, setWedding] = React.useState<Wedding | null>(null);
  const [summary, setSummary] = React.useState<BudgetSummary | null>(null);
  const [categories, setCategories] = React.useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

  // Budget Edit Modal
  const [isEditBudgetOpen, setIsEditBudgetOpen] = React.useState(false);
  const [editTotalBudget, setEditTotalBudget] = React.useState("");

  // Category Edit Modal
  const [editingCategory, setEditingCategory] = React.useState<BudgetCategory | null>(null);
  const [editCategoryAmount, setEditCategoryAmount] = React.useState("");

  const loadData = React.useCallback(async () => {
    const w = WeddingStore.getWedding();
    setWedding(w);
    const bSummary = await BudgetService.getBudgetSummary(w.estimated_budget);
    setSummary(bSummary);
    const cats = WeddingStore.getCategories();
    setCategories(cats);
    const exps = WeddingStore.getExpenses();
    setExpenses(exps);
  }, []);

  React.useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("wedding_store_updated", handleUpdate);
    return () => window.removeEventListener("wedding_store_updated", handleUpdate);
  }, [loadData]);

  if (!wedding || !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="font-serif text-sm text-[#8B5E5A]">Đang tính toán ngân sách...</p>
      </div>
    );
  }

  // Calculate actual spent per category
  const categorySpents = categories.map((cat) => {
    const spent = expenses
      .filter(
        (e) =>
          e.category_name.toLowerCase().includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(e.category_name.toLowerCase())
      )
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const pct =
      cat.allocated_amount > 0
        ? Math.min(100, Math.round((spent / cat.allocated_amount) * 100))
        : 0;
    return {
      ...cat,
      actualSpent: spent,
      spentPercentage: pct,
    };
  });

  const smartRecs = BudgetService.getSmartBudgetRecommendations(wedding.estimated_budget);

  const handleSaveTotalBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(editTotalBudget);
    if (isNaN(num) || num <= 0) return;

    WeddingStore.updateWedding({ estimated_budget: num });
    setIsEditBudgetOpen(false);
  };

  const handleSaveCategoryAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const num = Number(editCategoryAmount);
    if (isNaN(num) || num < 0) return;

    WeddingStore.updateCategory(editingCategory.id, { allocated_amount: num });
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Quản lý Ngân sách Cưới (Budget Management)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Kiểm soát chặt chẽ từng đồng chi phí, cam kết thanh toán và dự phòng phát sinh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditTotalBudget(wedding.estimated_budget.toString());
              setIsEditBudgetOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
            <span>Chỉnh sửa ngân sách</span>
          </Button>
          <Link href="/expenses">
            <Button variant="outline" size="md">
              <Receipt className="h-4 w-4" />
              <span>Xem sổ chi tiêu</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Budget Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-[#D6BE91] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">
              Tổng ngân sách dự kiến
            </span>
            <button
              onClick={() => {
                setEditTotalBudget(wedding.estimated_budget.toString());
                setIsEditBudgetOpen(true);
              }}
              className="text-[#8B5E5A] hover:text-[#533835] p-1"
              title="Đổi tổng ngân sách"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="font-serif text-xl font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-2">
            {formatCurrencyVND(summary.totalBudget)}
          </p>
          <p className="text-[11px] text-[#8B5E5A] dark:text-[#D6BE91] mt-1 font-medium">
            Mục tiêu đám cưới {wedding.expected_guests} khách
          </p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">
            Thực tế đã chi
          </span>
          <p className="font-serif text-xl font-bold text-[#8B5E5A] dark:text-[#D6BE91] mt-2">
            {formatCurrencyVND(summary.totalSpent)}
          </p>
          <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Chiếm {summary.spentPercentage}% tổng ngân sách
          </p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">
            Ngân sách còn lại
          </span>
          <p
            className={`font-serif text-xl font-bold mt-2 ${
              summary.remainingBudget < 0 ? "text-[#B44A4A]" : "text-[#3F7D5A]"
            }`}
          >
            {formatCurrencyVND(summary.remainingBudget)}
          </p>
          <p className="text-[11px] text-[#3F7D5A] mt-1 font-medium">
            {summary.remainingBudget < 0 ? "Cảnh báo vượt dự toán" : "Trong vùng kiểm soát an toàn"}
          </p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">
            Tổng cam kết hợp đồng
          </span>
          <p className="font-serif text-xl font-bold text-[#C68A27] mt-2">
            {formatCurrencyVND(summary.totalCommitted)}
          </p>
          <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Tổng giá trị các nhà cung cấp
          </p>
        </Card>
      </div>

      {/* Smart Recommendation Banner */}
      <div className="rounded-[20px] bg-gradient-to-r from-[#F5EFE7] to-[#FAF6F0] p-6 border border-[#EADBCE] dark:bg-[#221C1B] dark:border-[#3A302E]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#8B5E5A] dark:text-[#D6BE91]" />
          <h3 className="font-serif text-base font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Gợi ý phân bổ ngân sách chuẩn cho gói {formatCurrencyVND(wedding.estimated_budget)}
          </h3>
        </div>
        <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mb-4">
          Tỷ lệ tham khảo chuẩn từ các chuyên gia Wedding Planner dành cho đám cưới phong cách {wedding.style}:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {smartRecs.map((rec, idx) => (
            <div
              key={idx}
              className="rounded-[14px] bg-white p-3 border border-[#EADBCE] dark:bg-[#181413] dark:border-[#3A302E]"
            >
              <span className="text-[11px] font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                {rec.percentage}%
              </span>
              <p className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] truncate">
                {rec.name}
              </p>
              <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-0.5">
                {formatCurrencyVND(rec.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown: Mobile Card List (block md:hidden) */}
      <div className="space-y-3 md:hidden">
        <div className="flex items-center justify-between pb-1">
          <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Phân bổ theo hạng mục ({categories.length})
          </h3>
        </div>
        {categorySpents.map((cat) => (
          <Card key={cat.id} className="p-4 space-y-3 border-[#EADBCE] shadow-sm dark:border-[#3A302E]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <h4 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                  {cat.name}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    cat.spentPercentage > 100
                      ? "danger"
                      : cat.spentPercentage > 0
                      ? "warning"
                      : "default"
                  }
                  className="text-[10px]"
                >
                  {cat.spentPercentage > 100
                    ? "Vượt hạn mức"
                    : cat.spentPercentage > 0
                    ? "Đang chi"
                    : "Chưa chi"}
                </Badge>
                <button
                  onClick={() => {
                    setEditingCategory(cat);
                    setEditCategoryAmount(cat.allocated_amount.toString());
                  }}
                  className="p-1.5 text-[#8B5E5A] hover:bg-[#F5EFE7] rounded-lg transition-colors dark:hover:bg-[#2A2321]"
                  title="Chỉnh sửa định mức"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-2 text-xs py-1">
              <div>
                <span className="text-[10px] text-[#A69591] block">Định mức dự kiến</span>
                <span className="font-medium text-[#2C2422] dark:text-[#F5EFE7]">
                  {formatCurrencyVND(cat.allocated_amount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#A69591] block">Thực tế đã chi</span>
                <span className="font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                  {formatCurrencyVND(cat.actualSpent)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-[#F5EFE7] h-2 rounded-full overflow-hidden dark:bg-[#2A2321]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${cat.spentPercentage}%`,
                    backgroundColor: cat.spentPercentage > 100 ? "#B44A4A" : cat.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B5E5B] dark:text-[#A69591]">
                <span>Tiến độ ngân sách</span>
                <span className="font-semibold">{cat.spentPercentage}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Category Breakdown: Desktop Table View (hidden md:block) */}
      <Card className="p-0 overflow-hidden hidden md:block">
        <div className="p-5 border-b border-[#EADBCE] dark:border-[#3A302E] flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Chi tiết phân bổ theo hạng mục
          </h3>
          <span className="text-xs text-[#6B5E5B] dark:text-[#A69591]">
            {categories.length} Hạng mục chính (Bấm nút sửa để tùy chỉnh định mức)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F0] text-[#6B5E5B] border-b border-[#EADBCE] dark:bg-[#2A2321] dark:border-[#3A302E] dark:text-[#A69591]">
              <tr>
                <th className="p-4 font-semibold">Hạng mục</th>
                <th className="p-4 font-semibold">Phân bổ dự kiến</th>
                <th className="p-4 font-semibold">Thực chi</th>
                <th className="p-4 font-semibold">Tiến độ chi</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] dark:divide-[#3A302E]">
              {categorySpents.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FFFDF9]/60 transition-colors">
                  <td className="p-4 font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-[#2C2422] dark:text-[#F5EFE7]">
                    {formatCurrencyVND(cat.allocated_amount)}
                  </td>
                  <td className="p-4 font-bold text-[#8B5E5A] dark:text-[#D6BE91]">
                    {formatCurrencyVND(cat.actualSpent)}
                  </td>
                  <td className="p-4 w-48">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-[#F5EFE7] h-2 rounded-full overflow-hidden dark:bg-[#2A2321]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${cat.spentPercentage}%`,
                            backgroundColor: cat.spentPercentage > 100 ? "#B44A4A" : cat.color,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6B5E5B] dark:text-[#A69591] w-8">
                        {cat.spentPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        cat.spentPercentage > 100
                          ? "danger"
                          : cat.spentPercentage > 0
                          ? "warning"
                          : "default"
                      }
                    >
                      {cat.spentPercentage > 100
                        ? "Vượt ngân sách"
                        : cat.spentPercentage > 0
                        ? "Đang chi"
                        : "Chưa chi"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setEditCategoryAmount(cat.allocated_amount.toString());
                      }}
                      className="p-1.5 text-[#8B5E5A] hover:bg-[#F5EFE7] rounded-lg transition-colors dark:hover:bg-[#2A2321]"
                      title="Chỉnh sửa định mức chi cho hạng mục này"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Total Budget Modal */}
      <Modal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        title="Chỉnh sửa Tổng Ngân Sách Dự Kiến"
      >
        <form onSubmit={handleSaveTotalBudget} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
              Tổng ngân sách (VND)
            </label>
            <Input
              type="number"
              value={editTotalBudget}
              onChange={(e) => setEditTotalBudget(e.target.value)}
              placeholder="VD: 500000000"
              required
              className="mt-1"
            />
            <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1">
              Khoản ngân sách này sẽ được cập nhật đồng bộ lên Dashboard và tính toán lại tỷ lệ chi tiêu.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsEditBudgetOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Allocation Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title={`Chỉnh sửa định mức: ${editingCategory?.name}`}
      >
        <form onSubmit={handleSaveCategoryAllocation} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7] block mb-1">
              Số tiền phân bổ dự kiến (VND)
            </label>
            <Input
              type="number"
              value={editCategoryAmount}
              onChange={(e) => setEditCategoryAmount(e.target.value)}
              placeholder="VD: 150000000"
              required
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingCategory(null)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Cập nhật định mức
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
