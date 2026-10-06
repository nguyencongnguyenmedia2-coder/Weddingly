import { TimelineEvent } from "@/types/database";
import { WeddingStore } from "@/lib/wedding-store";

export interface EmergencyContact {
  role: string;
  name: string;
  phone: string;
  note?: string;
}

export class TimelineService {
  static async getEvents(weddingId?: string): Promise<TimelineEvent[]> {
    return WeddingStore.getTimeline();
  }

  static async addEvent(data: {
    title: string;
    eventDate: string;
    startTime: string;
    endTime?: string | null;
    location?: string | null;
    assigneeName?: string | null;
    contactPhone?: string | null;
    description?: string | null;
  }): Promise<TimelineEvent> {
    return WeddingStore.addTimelineEvent(data);
  }

  static async updateEvent(id: string, data: Partial<TimelineEvent>): Promise<TimelineEvent | null> {
    return WeddingStore.updateTimelineEvent(id, data);
  }

  static async deleteEvent(id: string): Promise<boolean> {
    return WeddingStore.deleteTimelineEvent(id);
  }

  static getEmergencyContacts(): EmergencyContact[] {
    return [
      { role: "Wedding Planner chính", name: "Nguyễn Hải Yến", phone: "0908123456", note: "Điều phối chung toàn bộ tiệc" },
      { role: "Quản lý sảnh tiệc", name: "Trần Trọng Nghĩa", phone: "02862568888", note: "Riverside Palace Ballroom" },
      { role: "Nhiếp ảnh gia chính", name: "Lê Tuấn Hùng", phone: "0938112334", note: "Lumière Studio" },
      { role: "Chuyên viên trang điểm", name: "Linh Trang", phone: "0909123456", note: "Makeup cô dâu & hai mẹ" },
      { role: "MC Hôn lễ", name: "Phan Hoàng Vũ", phone: "0905556666", note: "Chủ trì nghi lễ & khai tiệc" },
      { role: "Đội trưởng xe hoa", name: "Bác Năm", phone: "0903337788", note: "Đoàn xe rước dâu Mercedes" },
      { role: "Đại diện Nhà Gái", name: "Bố Cô Dâu (Ông Thành)", phone: "0912345678", note: "Trao dâu & phát biểu" },
      { role: "Đại diện Nhà Trai", name: "Bố Chú Rể (Ông Hùng)", phone: "0987654321", note: "Đón dâu & cảm ơn quan khách" },
    ];
  }
}
