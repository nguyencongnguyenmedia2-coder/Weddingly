"use client";

import * as React from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  LayoutGrid,
  List,
  Calendar,
  AlertCircle,
  Trash2,
  CheckCircle2,
  Edit2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus, TaskPriority } from "@/types/database";
import { TaskService } from "@/services/task.service";
import { Modal } from "@/components/ui/dialog";

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("kanban");
  const [filterCategory, setFilterCategory] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  // Form states
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Chung");
  const [priority, setPriority] = React.useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("TODO");

  const loadTasks = React.useCallback(async () => {
    const list = await TaskService.getTasks();
    setTasks(list);
  }, []);

  React.useEffect(() => {
    loadTasks();
    const handleStoreChange = () => loadTasks();
    window.addEventListener("wedding_store_updated", handleStoreChange);
    return () => window.removeEventListener("wedding_store_updated", handleStoreChange);
  }, [loadTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await TaskService.updateTaskStatus(taskId, newStatus);
    loadTasks();
  };

  const handleDelete = async (taskId: string) => {
    await TaskService.deleteTask(taskId);
    loadTasks();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa công việc thành công!" }));
    }
  };

  const handleOpenAdd = () => {
    setTitle("");
    setDescription("");
    setCategory("Chung");
    setPriority("MEDIUM");
    setDueDate("");
    setStatus("TODO");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setCategory(task.category || "Chung");
    setPriority(task.priority);
    setDueDate(task.due_date || "");
    setStatus(task.status);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      await TaskService.updateTask(editingTask.id, {
        title,
        description: description || null,
        category,
        priority,
        due_date: dueDate || null,
        status,
      });
      setEditingTask(null);
    } else {
      await TaskService.addTask({
        title,
        description: description || null,
        category,
        priority,
        dueDate: dueDate || null,
        status,
      });
      setIsAddModalOpen(false);
    }
    loadTasks();
  };

  const filteredTasks = tasks.filter((t) => {
    const matchCategory = filterCategory === "ALL" || t.category === filterCategory;
    const matchQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: "TODO", label: "Cần làm (To Do)", color: "border-[#EADBCE]" },
    { status: "IN_PROGRESS", label: "Đang tiến hành", color: "border-[#D6BE91]" },
    { status: "COMPLETED", label: "Đã hoàn thành", color: "border-[#3F7D5A]" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Kế hoạch & Công việc cưới
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Theo dõi, chỉnh sửa và cập nhật tiến độ từng công việc
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex rounded-[12px] border border-[#EADBCE] bg-white p-1 dark:bg-[#221C1B] dark:border-[#3A302E]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-[8px] transition-colors ${
                viewMode === "kanban"
                  ? "bg-[#8B5E5A] text-white"
                  : "text-[#6B5E5B] hover:text-[#2C2422]"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-[8px] transition-colors ${
                viewMode === "list"
                  ? "bg-[#8B5E5A] text-white"
                  : "text-[#6B5E5B] hover:text-[#2C2422]"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            className="gap-2 shadow-sm flex-1 sm:flex-initial justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm việc mới</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8B5E5A]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên công việc hoặc hạng mục..."
            className="pl-10 h-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
        >
          <option value="ALL">Tất cả hạng mục</option>
          <option value="Chung">Chung</option>
          <option value="Địa điểm">Địa điểm</option>
          <option value="Chụp ảnh">Chụp ảnh & Quay phim</option>
          <option value="Trang phục">Trang phục</option>
          <option value="Khách mời">Khách mời</option>
          <option value="Thiệp cưới">Thiệp cưới</option>
          <option value="Trang trí">Trang trí hoa tươi</option>
          <option value="Ẩm thực">Ẩm thực tiệc</option>
          <option value="Timeline">Timeline ngày cưới</option>
        </select>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="flex flex-col rounded-[20px] bg-[#F5EFE7]/40 p-4 border border-[#EADBCE] dark:bg-[#221C1B]/50 dark:border-[#3A302E]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EADBCE] dark:border-[#3A302E]">
                  <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
                    {col.label}
                  </h3>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-[#8B5E5A] border border-[#EADBCE] dark:bg-[#2A2321] dark:border-[#3A302E]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {colTasks.map((task) => (
                    <Card key={task.id} className="p-4 shadow-sm hover:border-[#D6BE91] transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant={
                            task.priority === "URGENT"
                              ? "danger"
                              : task.priority === "HIGH"
                              ? "warning"
                              : "champagne"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            title="Chỉnh sửa công việc"
                            className="p-1 text-[#A69591] hover:text-[#8B5E5A] rounded hover:bg-[#F5EFE7]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            title="Xóa công việc"
                            className="p-1 text-[#A69591] hover:text-[#B44A4A] rounded hover:bg-[#FDF2F2]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-semibold text-xs text-[#2C2422] dark:text-[#F5EFE7] mt-2.5 leading-snug">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 pt-2 border-t border-[#F5EFE7] dark:border-[#2A2321] flex items-center justify-between text-[11px] text-[#6B5E5B] dark:text-[#A69591]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#D6BE91]" />
                          {task.due_date || "Chưa có hạn"}
                        </span>
                        <span className="font-medium text-[#8B5E5A] dark:text-[#D6BE91]">
                          {task.category}
                        </span>
                      </div>

                      {/* Status toggle actions */}
                      <div className="mt-2.5 flex items-center gap-1 pt-1 border-t border-dashed border-[#EADBCE]">
                        {task.status !== "TODO" && (
                          <button
                            onClick={() => handleStatusChange(task.id, "TODO")}
                            className="text-[10px] text-[#6B5E5B] hover:text-[#8B5E5A] hover:underline"
                          >
                            ← Cần làm
                          </button>
                        )}
                        {task.status !== "IN_PROGRESS" && (
                          <button
                            onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                            className="text-[10px] text-[#C68A27] hover:underline ml-auto"
                          >
                            Đang làm →
                          </button>
                        )}
                        {task.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleStatusChange(task.id, "COMPLETED")}
                            className="text-[10px] text-[#3F7D5A] font-semibold hover:underline ml-auto flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Xong
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="py-8 text-center text-xs text-[#A69591]">
                      Chưa có công việc nào ở cột này.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="divide-y divide-[#EADBCE] dark:divide-[#3A302E] p-0 overflow-hidden">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[#FFFDF9]/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() =>
                    handleStatusChange(
                      task.id,
                      task.status === "COMPLETED" ? "TODO" : "COMPLETED"
                    )
                  }
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${
                    task.status === "COMPLETED"
                      ? "bg-[#3F7D5A] border-[#3F7D5A] text-white"
                      : "border-[#D6BE91] hover:bg-[#F5EFE7]"
                  }`}
                >
                  {task.status === "COMPLETED" && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      task.status === "COMPLETED"
                        ? "line-through text-[#A69591]"
                        : "text-[#2C2422] dark:text-[#F5EFE7]"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-[11px] text-[#6B5E5B] dark:text-[#A69591] mt-0.5">
                    Hạng mục: {task.category} • Hạn chót: {task.due_date || "Chưa có"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Badge
                  variant={
                    task.priority === "URGENT"
                      ? "danger"
                      : task.priority === "HIGH"
                      ? "warning"
                      : "champagne"
                  }
                >
                  {task.priority}
                </Badge>
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 text-[#A69591] hover:text-[#8B5E5A] rounded hover:bg-[#F5EFE7]"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 text-[#A69591] hover:text-[#B44A4A] rounded hover:bg-[#FDF2F2]"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Add or Edit Task Modal */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingTask)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? "Chỉnh sửa công việc cưới" : "Thêm công việc cưới mới"}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tiêu đề công việc <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đặt tiệc trà đón khách tại nhà gái"
              required
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Mô tả chi tiết / Dặn dò
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú chi tiết về số lượng, liên hệ..."
              rows={2}
              className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white p-2.5 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Hạng mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="Chung">Chung</option>
                <option value="Địa điểm">Địa điểm</option>
                <option value="Chụp ảnh">Chụp ảnh & Quay phim</option>
                <option value="Trang phục">Trang phục</option>
                <option value="Khách mời">Khách mời</option>
                <option value="Thiệp cưới">Thiệp cưới</option>
                <option value="Trang trí">Trang trí hoa tươi</option>
                <option value="Ẩm thực">Ẩm thực</option>
                <option value="Timeline">Timeline</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="LOW">Thấp (Low)</option>
                <option value="MEDIUM">Trung bình (Medium)</option>
                <option value="HIGH">Cao (High)</option>
                <option value="URGENT">Khẩn cấp (Urgent)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Hạn hoàn thành</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              >
                <option value="TODO">Cần làm (To Do)</option>
                <option value="IN_PROGRESS">Đang làm (In Progress)</option>
                <option value="COMPLETED">Đã hoàn thành (Done)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTask(null);
              }}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              {editingTask ? "Lưu thay đổi" : "Tạo công việc"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
