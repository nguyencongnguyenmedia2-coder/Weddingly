"use client";

import * as React from "react";
import {
  Armchair,
  Plus,
  Users,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
  UserCheck,
  Edit2,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { GuestService } from "@/services/guest.service";
import { Guest, WeddingTable } from "@/types/database";
import { LockedFeatureGuard } from "@/components/common/locked-feature-guard";

export default function TablesPage() {
  const [tables, setTables] = React.useState<WeddingTable[]>([]);
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Modal states
  const [isAddTableOpen, setIsAddTableOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<WeddingTable | null>(null);

  // Form states
  const [tableName, setTableName] = React.useState("");
  const [tableCapacity, setTableCapacity] = React.useState(10);
  const [tableType, setTableType] = React.useState<"ROUND" | "RECTANGLE" | "VIP" | "LONG">("ROUND");

  const loadData = React.useCallback(async () => {
    const tList = await GuestService.getTables();
    setTables(tList);
    const gList = await GuestService.getGuests();
    setGuests(gList);
  }, []);

  React.useEffect(() => {
    loadData();
    const handleStoreChange = () => loadData();
    window.addEventListener("wedding_store_updated", handleStoreChange);
    return () => window.removeEventListener("wedding_store_updated", handleStoreChange);
  }, [loadData]);

  const handleAssign = async (guestId: string, tableId: string | null) => {
    setErrorMessage(null);
    const res = await GuestService.assignGuestToTable(guestId, tableId);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    } else {
      loadData();
    }
  };

  const handleOpenAdd = () => {
    setTableName("");
    setTableCapacity(10);
    setTableType("ROUND");
    setIsAddTableOpen(true);
  };

  const handleOpenEdit = (table: WeddingTable) => {
    setEditingTable(table);
    setTableName(table.name);
    setTableCapacity(table.capacity);
    setTableType(table.table_type);
  };

  const handleDeleteTable = async (id: string) => {
    await GuestService.deleteTable(id);
    loadData();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa bàn tiệc thành công!" }));
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    if (editingTable) {
      await GuestService.updateTable(editingTable.id, {
        name: tableName,
        capacity: Number(tableCapacity),
        table_type: tableType,
      });
      setEditingTable(null);
    } else {
      await GuestService.createTable(tableName, tableCapacity, tableType);
      setIsAddTableOpen(false);
    }
    loadData();
  };

  const unseatedGuests = guests.filter((g) => !g.table_id);
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const totalSeated = guests.filter((g) => g.table_id).length;

  return (
    <LockedFeatureGuard
      featureName="Sơ Đồ Bàn Tiệc & Xếp Chỗ Thông Minh"
      description="Công cụ sắp xếp bàn tiệc 2D, phân bổ chỗ ngồi cho từng vị khách và quản lý sức chứa sảnh cưới chuyên nghiệp."
    >
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Sơ đồ xếp bàn tiệc (Table Seating Planner)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Sắp xếp, chỉnh sửa vị trí chỗ ngồi và kiểm soát sức chứa tối đa mỗi bàn
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span>Tạo bàn mới</span>
        </Button>
      </div>

      {/* Error alert if exceeded */}
      {errorMessage && (
        <div className="rounded-[14px] bg-[#FDF2F2] border border-[#F7CDCD] p-3 text-xs text-[#B44A4A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Capacity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#6B5E5B] dark:text-[#A69591]">Tổng số bàn</span>
          <p className="font-serif text-xl font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-1">
            {tables.length} Bàn tiệc
          </p>
          <p className="text-[11px] text-[#A69591] mt-0.5">Sức chứa tối đa: {totalCapacity} chỗ</p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#3F7D5A]">Khách đã có chỗ ngồi</span>
          <p className="font-serif text-xl font-bold text-[#3F7D5A] mt-1">
            {totalSeated} / {guests.length} Khách
          </p>
          <p className="text-[11px] text-[#3F7D5A] mt-0.5">Đã gán vào bàn cụ thể</p>
        </Card>

        <Card className="hover:border-[#D6BE91] transition-all">
          <span className="text-xs font-semibold text-[#C68A27]">Khách chưa xếp bàn</span>
          <p className="font-serif text-xl font-bold text-[#C68A27] mt-1">
            {unseatedGuests.length} Khách
          </p>
          <p className="text-[11px] text-[#C68A27] mt-0.5">Cần chọn bàn phù hợp</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tables Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Các bàn tiệc hiện tại ({tables.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tables.map((table) => {
              const tableGuests = guests.filter((g) => g.table_id === table.id);
              const isFull = tableGuests.length >= table.capacity;

              return (
                <Card
                  key={table.id}
                  className={`p-4 border transition-all ${
                    isFull ? "border-[#C2E3D0] bg-[#EBF5F0]/20" : "hover:border-[#D6BE91]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE] dark:border-[#3A302E]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#F5EFE7] text-[#8B5E5A] dark:bg-[#2A2321]">
                        <Armchair className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                          {table.name}
                        </h4>
                        <span className="text-[10px] text-[#A69591]">{table.table_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isFull ? "success" : "champagne"}>
                        {tableGuests.length} / {table.capacity} chỗ
                      </Badge>
                      <button
                        onClick={() => handleOpenEdit(table)}
                        className="p-1 text-[#A69591] hover:text-[#8B5E5A] rounded hover:bg-[#F5EFE7]"
                        title="Chỉnh sửa bàn"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="p-1 text-[#A69591] hover:text-[#B44A4A] rounded hover:bg-[#FDF2F2]"
                        title="Xóa bàn"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Guests inside table */}
                  <div className="mt-3 space-y-1.5 min-h-[120px]">
                    {tableGuests.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between rounded-[8px] bg-white p-2 text-xs border border-[#EADBCE] dark:bg-[#181413] dark:border-[#3A302E]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <UserCheck className="h-3.5 w-3.5 text-[#3F7D5A] shrink-0" />
                          <span className="font-medium text-[#2C2422] dark:text-[#F5EFE7] truncate">
                            {g.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAssign(g.id, null)}
                          title="Gỡ khỏi bàn này"
                          className="text-[#A69591] hover:text-[#B44A4A] p-0.5 ml-2"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {tableGuests.length === 0 && (
                      <div className="py-8 text-center text-[11px] text-[#A69591]">
                        Bàn này hiện chưa có khách nào.
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Unseated Guests List */}
        <div>
          <Card className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
              <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                Khách chưa xếp bàn ({unseatedGuests.length})
              </h3>
              <Badge variant="warning">Chờ xếp</Badge>
            </div>

            <div className="mt-3 space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {unseatedGuests.map((g) => (
                <div
                  key={g.id}
                  className="rounded-[10px] bg-[#FFFDF9] p-3 border border-[#EADBCE] dark:bg-[#221C1B] dark:border-[#3A302E]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                      {g.name}
                    </p>
                    <Badge variant={g.group_name === "VIP" ? "champagne" : "default"}>
                      {g.group_name}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAssign(g.id, e.target.value);
                      }}
                      defaultValue=""
                      className="flex-1 rounded-[8px] border border-[#EADBCE] bg-white px-2 py-1 text-[11px] text-[#2C2422] focus:ring-1 focus:ring-[#D6BE91] dark:bg-[#181413] dark:border-[#3A302E] dark:text-[#F5EFE7]"
                    >
                      <option value="" disabled>
                        Chọn bàn để xếp vào...
                      </option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Tối đa {t.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {unseatedGuests.length === 0 && (
                <div className="py-12 text-center text-xs text-[#3F7D5A]">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-[#3F7D5A]" />
                  Tuyệt vời! Toàn bộ khách mời đều đã được xếp bàn đầy đủ.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add or Edit Table Modal */}
      <Modal
        isOpen={isAddTableOpen || Boolean(editingTable)}
        onClose={() => {
          setIsAddTableOpen(false);
          setEditingTable(null);
        }}
        title={editingTable ? "Chỉnh sửa bàn tiệc" : "Tạo bàn tiệc mới"}
      >
        <form onSubmit={handleSaveTable} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tên bàn tiệc <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="VD: Bàn 04 - Hội bạn thân cấp 3"
              required
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Sức chứa (Người)</label>
              <Input
                type="number"
                value={tableCapacity}
                onChange={(e) => setTableCapacity(Number(e.target.value))}
                min={1}
                max={25}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Kiểu bàn</label>
              <select
                value={tableType}
                onChange={(e) => setTableType(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="ROUND">Bàn tròn tiêu chuẩn</option>
                <option value="VIP">Bàn VIP đại diện hai bên</option>
                <option value="RECTANGLE">Bàn chữ nhật</option>
                <option value="LONG">Bàn dài phong cách Tây</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddTableOpen(false);
                setEditingTable(null);
              }}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              {editingTable ? "Lưu thay đổi" : "Lưu bàn tiệc"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </LockedFeatureGuard>
  );
}
