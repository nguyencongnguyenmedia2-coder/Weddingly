"use client";

import * as React from "react";
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Tag,
  Search,
  Edit2,
  Calendar,
} from "lucide-react";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { WeddingStore, NoteItem } from "@/lib/wedding-store";

export default function NotesPage() {
  const [notes, setNotes] = React.useState<NoteItem[]>([]);
  const [activeCategory, setActiveCategory] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<NoteItem | null>(null);

  // Form
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState<NoteItem["category"]>("Planning");

  const loadNotes = React.useCallback(() => {
    setNotes(WeddingStore.getNotes());
  }, []);

  React.useEffect(() => {
    loadNotes();
    const handleUpdate = () => loadNotes();
    window.addEventListener("wedding_store_updated", handleUpdate);
    return () => window.removeEventListener("wedding_store_updated", handleUpdate);
  }, [loadNotes]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      WeddingStore.updateNote(editingNote.id, {
        title,
        content,
        category,
      });
      setEditingNote(null);
    } else {
      WeddingStore.addNote({
        title,
        content,
        category,
      });
      setIsAddOpen(false);
    }

    setTitle("");
    setContent("");
    setCategory("Planning");
  };

  const openEdit = (n: NoteItem) => {
    setEditingNote(n);
    setTitle(n.title);
    setContent(n.content);
    setCategory(n.category);
  };

  const togglePin = (id: string, currentPin: boolean) => {
    WeddingStore.updateNote(id, { isPinned: !currentPin });
  };

  const handleDelete = (id: string) => {
    WeddingStore.deleteNote(id);
    loadNotes();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("show_toast", { detail: "Đã xóa ghi chú thành công!" }));
    }
  };

  const filtered = notes.filter((n) => {
    const matchCat = activeCategory === "ALL" || n.category === activeCategory;
    const matchSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Sổ ghi chú & Ý tưởng cưới (Notes & Ideas)
          </h1>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1">
            Ghi chép nhanh các dặn dò của phụ huynh, bài hát yêu thích và ý tưởng trang trí ({notes.length} ghi chú)
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
          onClick={() => {
            setEditingNote(null);
            setTitle("");
            setContent("");
            setCategory("Planning");
            setIsAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Thêm ghi chú</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8B5E5A]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc nội dung ghi chú..."
            className="pl-10 h-10"
          />
        </div>
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="rounded-[12px] border border-[#EADBCE] bg-white px-3 py-2 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
        >
          <option value="ALL">Tất cả danh mục ({notes.length})</option>
          <option value="Planning">Lập kế hoạch (Planning)</option>
          <option value="Budget">Ngân sách (Budget)</option>
          <option value="Family">Gia đình & Nghi lễ (Family)</option>
          <option value="Wedding day">Ngày cưới (Wedding day)</option>
          <option value="Personal">Cá nhân & Trăng mật (Personal)</option>
        </select>
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <StickyNote className="mx-auto h-12 w-12 text-[#EADBCE] dark:text-[#3A302E] mb-3" />
          <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7]">
            Chưa tìm thấy ghi chú nào phù hợp
          </h3>
          <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-1 mb-4">
            Ghi lại mọi ý tưởng, lời chúc và việc quan trọng ngay bây giờ
          </p>
          <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Tạo ghi chú mới</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <Card
              key={note.id}
              className={`p-5 flex flex-col justify-between transition-all group ${
                note.isPinned
                  ? "border-[#D6BE91] bg-[#FFFDF9] shadow-md dark:bg-[#221C1B]"
                  : "hover:border-[#D6BE91]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F5EFE7] dark:border-[#2A2321]">
                  <Badge variant={note.isPinned ? "champagne" : "default"}>
                    {note.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(note.id, note.isPinned)}
                      className="p-1.5 text-[#A69591] hover:text-[#8B5E5A] rounded-lg transition-colors"
                      title={note.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                    >
                      <Pin className={`h-3.5 w-3.5 ${note.isPinned ? "fill-current text-[#8B5E5A]" : ""}`} />
                    </button>
                    <button
                      onClick={() => openEdit(note)}
                      className="p-1.5 text-[#A69591] hover:text-[#8B5E5A] rounded-lg transition-colors"
                      title="Chỉnh sửa ghi chú"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 text-[#A69591] hover:text-[#B44A4A] rounded-lg transition-colors"
                      title="Xoá ghi chú"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-sm font-bold text-[#2C2422] dark:text-[#F5EFE7] mt-3">
                  {note.title}
                </h3>
                <p className="text-xs text-[#6B5E5B] dark:text-[#A69591] mt-2 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-[#F5EFE7] dark:border-[#2A2321] text-[10px] text-[#A69591] flex items-center justify-between">
                <span>Ngày tạo: {note.date}</span>
                {note.isPinned && <span className="text-[#8B5E5A] font-semibold">Đã ghim</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      <Modal
        isOpen={isAddOpen || !!editingNote}
        onClose={() => {
          setIsAddOpen(false);
          setEditingNote(null);
        }}
        title={editingNote ? "Chỉnh sửa ghi chú cưới" : "Thêm ghi chú mới"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Tiêu đề <span className="text-[#B44A4A]">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Danh sách quà cảm ơn dành cho khách"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-white p-2.5 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
            >
              <option value="Planning">Lập kế hoạch (Planning)</option>
              <option value="Budget">Ngân sách (Budget)</option>
              <option value="Family">Gia đình & Nghi lễ (Family)</option>
              <option value="Wedding day">Ngày cưới (Wedding day)</option>
              <option value="Personal">Cá nhân & Trăng mật (Personal)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2C2422] dark:text-[#F5EFE7]">
              Nội dung ghi chú <span className="text-[#B44A4A]">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi lại chi tiết thông tin dặn dò, số đo, yêu cầu phụ huynh..."
              rows={5}
              required
              className="mt-1 w-full rounded-[12px] border border-[#EADBCE] bg-[#FFFDF9] p-3 text-xs text-[#2C2422] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddOpen(false);
                setEditingNote(null);
              }}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              {editingNote ? "Lưu thay đổi" : "Lưu ghi chú"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
