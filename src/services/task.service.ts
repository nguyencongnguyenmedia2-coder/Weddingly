import { Task, TaskStatus, TaskPriority } from "@/types/database";
import { WeddingStore } from "@/lib/wedding-store";

export interface SmartChecklistMilestone {
  monthsBefore: number;
  label: string;
  items: {
    title: string;
    description: string;
    category: string;
    priority: TaskPriority;
  }[];
}

export class TaskService {
  static async getTasks(weddingId?: string): Promise<Task[]> {
    return WeddingStore.getTasks();
  }

  static async addTask(data: {
    title: string;
    description?: string | null;
    category?: string;
    priority?: TaskPriority;
    dueDate?: string | null;
    estimatedCost?: number;
    status?: TaskStatus;
  }): Promise<Task> {
    return WeddingStore.addTask(data);
  }

  static async updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
    return WeddingStore.updateTask(id, data);
  }

  static async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return WeddingStore.updateTask(id, { status });
  }

  static async deleteTask(id: string): Promise<boolean> {
    return WeddingStore.deleteTask(id);
  }

  static getSmartMilestones(): SmartChecklistMilestone[] {
    return [
      {
        monthsBefore: 12,
        label: "12 tháng trước ngày cưới",
        items: [
          { title: "Xác định ngân sách tổng và phong cách tiệc", description: "Thống nhất cùng hai bên gia đình về mức chi tiêu", category: "Ngân sách", priority: "HIGH" },
          { title: "Khảo sát và đặt cọc địa điểm tiệc cưới", description: "Giữ ngày đẹp và sảnh tiệc ưng ý", category: "Địa điểm", priority: "URGENT" },
        ],
      },
      {
        monthsBefore: 9,
        label: "9 tháng trước ngày cưới",
        items: [
          { title: "Lựa chọn ekip chụp ảnh & quay phim phóng sự", description: "Tham khảo portfolio và đặt lịch studio", category: "Chụp ảnh", priority: "HIGH" },
          { title: "Lên ý tưởng concept trang trí hoa tươi", description: "Lựa chọn bảng màu chủ đạo (champagne, rose, trắng)", category: "Trang trí", priority: "MEDIUM" },
        ],
      },
      {
        monthsBefore: 6,
        label: "6 tháng trước ngày cưới",
        items: [
          { title: "Thử váy cưới và may vest chú rể", description: "Đặt may hoặc giữ mẫu váy thiết kế chính", category: "Trang phục", priority: "HIGH" },
          { title: "Thực hiện bộ ảnh pre-wedding", description: "Chụp ngoại cảnh hoặc studio", category: "Chụp ảnh", priority: "HIGH" },
          { title: "Đặt lịch chuyên viên trang điểm (Makeup Artist)", description: "Giữ thợ trang điểm cho ngày ăn hỏi và lễ cưới", category: "Làm đẹp", priority: "HIGH" },
        ],
      },
      {
        monthsBefore: 3,
        label: "3 tháng trước ngày cưới",
        items: [
          { title: "Thiết kế và in thiệp cưới", description: "Lập danh sách số lượng thiệp cần in", category: "Thiệp cưới", priority: "MEDIUM" },
          { title: "Chọn nhẫn cưới & trang sức ngày cưới", description: "Thử size nhẫn và khắc tên kỷ niệm", category: "Trang sức", priority: "HIGH" },
        ],
      },
      {
        monthsBefore: 1,
        label: "1 tháng trước ngày cưới",
        items: [
          { title: "Gửi thiệp cưới và xác nhận RSVP khách mời", description: "Chốt số lượng khách thực tế tham dự", category: "Khách mời", priority: "URGENT" },
          { title: "Nếm thử thực đơn (Food tasting) tại nhà hàng", description: "Chốt 6 món chính và đồ uống", category: "Ẩm thực", priority: "HIGH" },
          { title: "Sắp xếp sơ đồ bàn tiệc (Seating chart)", description: "Phân chia khách vào bàn VIP, gia đình, bạn bè", category: "Khách mời", priority: "HIGH" },
        ],
      },
      {
        monthsBefore: 0.25,
        label: "1 tuần trước ngày trọng đại",
        items: [
          { title: "Xác nhận lại với toàn bộ nhà cung cấp (Vendors)", description: "Kiểm tra giờ giấc xe hoa, thợ ảnh, hoa tươi, sảnh", category: "Nhà cung cấp", priority: "URGENT" },
          { title: "Tổng duyệt kịch bản MC và timeline chi tiết", description: "Rehearsal nhạc nền, video chiếu và nghi lễ", category: "Timeline", priority: "URGENT" },
          { title: "Chuẩn bị phong bao mừng tuổi & tiền tip ekip", description: "Bao gồm tráp lễ và chi phí phát sinh", category: "Chuẩn bị", priority: "HIGH" },
        ],
      },
    ];
  }
}
