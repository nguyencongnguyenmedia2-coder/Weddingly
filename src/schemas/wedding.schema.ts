import { z } from "zod";

export const weddingSchema = z.object({
  brideName: z.string().min(2, "Tên cô dâu tối thiểu 2 ký tự"),
  groomName: z.string().min(2, "Tên chú rể tối thiểu 2 ký tự"),
  weddingDate: z.string().min(1, "Vui lòng chọn ngày tổ chức đám cưới"),
  venue: z.string().optional(),
  estimatedBudget: z.coerce.number().min(0, "Ngân sách dự kiến không được âm").default(300000000),
  expectedGuests: z.coerce.number().int().min(1, "Số khách dự kiến tối thiểu là 1").default(200),
  style: z.enum([
    "Luxury",
    "Modern",
    "Minimal",
    "Garden",
    "Beach",
    "Rustic",
    "Traditional",
    "Korean",
    "European",
  ]).default("Modern"),
});

export type WeddingInput = z.infer<typeof weddingSchema>;
