# WEDDINGLY

> **“Cưới thông minh – Tài chính an tâm”**
> 
> *Weddingly không chỉ là app ghi chép tiền mừng mà là Nền tảng quản lý đám cưới thông minh toàn diện cho các cặp đôi Việt Nam.*

Nền tảng quản lý và lập kế hoạch đám cưới all-in-one cao cấp xây dựng với **Next.js App Router**, **TypeScript**, **Tailwind CSS**, và **Supabase PostgreSQL**.

---

## 🌟 Tính Năng Nổi Bật

1. **Bảng Điều Khiển Tổng Quan (Dashboard):** Đồng hồ đếm ngược trực tiếp (Ngày, Giờ, Phút, Giây), số liệu ngân sách, khách mời và tiến độ công việc.
2. **Quản Lý Công Việc & Kanban (Tasks):** Chuyển đổi linh hoạt giữa giao diện thẻ Kanban và danh sách, phân loại theo mức độ khẩn cấp.
3. **Checklist Cưới Thông Minh (Smart Checklist):** Lộ trình 6 mốc tự động tính toán theo ngày cưới (12 tháng, 9 tháng, 6 tháng, 3 tháng, 1 tháng, 1 tuần).
4. **Quản Lý Ngân Sách (Budget):** Phân bổ ngân sách 300 triệu theo công thức chuyên gia, kiểm soát chi tiêu thực tế và đối soát hợp đồng.
5. **Sổ Chi Tiêu & Thanh Toán (Expenses & Payments):** Ghi chép từng đợt đặt cọc, theo dõi số dư còn lại đến hạn cho từng nhà cung cấp.
6. **Khách Mời & Điểm Danh (Guests & RSVP):** Phân nhóm họ hàng, xuất file CSV và cấp liên kết RSVP cá nhân (`/rsvp/[token]`).
7. **Sơ Đồ Xếp Bàn Tiệc (Table Seating Planner):** Xếp bàn tiệc trực quan, kiểm soát sức chứa tối đa (ngăn ngừa quá tải bàn).
8. **Nhà Cung Cấp Dịch Vụ (Vendors):** Danh mục studio chụp ảnh, sảnh tiệc, hoa tươi, trang điểm kèm đánh giá sao và gọi điện trực tiếp.
9. **Kịch Bản & Lịch Trình (Timeline):** Diễn biến chi tiết từng nghi lễ trong ngày cưới.
10. **Chế Độ Ngày Cưới (Wedding Day Mode - Mobile First):** Đồng hồ thời gian thực, sự kiện đang diễn ra và danh bạ khẩn cấp 1 chạm quay số.
11. **Thiệp Cưới Online (Digital Invitations):** Tạo thiệp cưới điện tử sang trọng, đính kèm dress code và copy nội dung gửi Zalo/Facebook.
12. **Website Đám Cưới Cá Nhân (`/w/[slug]`):** Trang web tình yêu với đồng hồ đếm ngược, lịch trình và sổ ký tên chúc phúc tương tác.
13. **Album Ảnh Kỷ Niệm (Gallery):** Thư viện hình ảnh pre-wedding, ăn hỏi và trăng mật.
14. **Trợ Lý Ảo Emma AI:** Hỗ trợ tính toán phân bổ ngân sách, gợi ý lời chúc và lên kế hoạch đám cưới tự động.
15. **Hệ Thống Quản Trị (Admin & Audit Logs):** Quản lý người dùng, dung lượng lưu trữ và nhật ký kiểm toán bảo mật.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** Next.js (App Router, Server & Client Components), React 19, TypeScript
- **Styling:** Tailwind CSS, Luxury Color Tokens (Ivory `#FFFDF9`, Champagne `#D6BE91`, Rose Brown `#8B5E5A`)
- **Fonts:** Playfair Display (Headings), Inter (Body)
- **Database:** PostgreSQL (Supabase) với Row Level Security (RLS)
- **Testing:** Vitest
- **Validation:** Zod schemas

---

## 🚀 Khởi Động Dự Án

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Kiểm tra kiểm thử (Unit Tests):
```bash
npm test
```

### 3. Kiểm tra kiểu dữ liệu (TypeScript):
```bash
npm run typecheck
```

### 4. Chạy môi trường phát triển (Dev server):
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

### 5. Build bản Production:
```bash
npm run build
```

---

## 📁 Cấu Trúc Mã Nguồn

```
src/
├── app/                  # Next.js App Router (Landing, Dashboard, Auth, Public RSVP, Website)
├── components/           # UI Primitives, Layout (Sidebar, Header, MobileNav, EmmaAI, Modals)
├── services/             # Business Logic & Service Layer (Wedding, Budget, Guest, Task, Timeline, AI)
├── schemas/              # Zod validation schemas
├── types/                # TypeScript database & domain interfaces
├── lib/                  # Utilities, formatters, seed data, and Supabase client
└── middleware.ts         # Route protection and session validation
```
