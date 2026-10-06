import { Wedding, WeddingStyle } from "@/types/database";
import { WeddingStore } from "@/lib/wedding-store";

export interface CountdownResult {
  isPast: boolean;
  isToday: boolean;
  totalDays: number;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedString: string;
}

export class WeddingService {
  static async getActiveWedding(): Promise<Wedding> {
    return WeddingStore.getWedding();
  }

  static async getWeddingById(id: string): Promise<Wedding | null> {
    const all = WeddingStore.getAllWeddings();
    return all.find((w) => w.id === id) || null;
  }

  static async getUserWeddings(): Promise<Wedding[]> {
    return WeddingStore.getAllWeddings();
  }

  static async updateWedding(data: Partial<Wedding>): Promise<Wedding> {
    return WeddingStore.updateWedding(data);
  }

  static async createWedding(data: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    venue?: string;
    estimatedBudget?: number;
    expectedGuests?: number;
    style?: WeddingStyle;
    coverImageUrl?: string;
  }): Promise<Wedding> {
    return WeddingStore.createWedding(data);
  }

  static async switchWedding(id: string): Promise<Wedding | null> {
    return WeddingStore.switchWedding(id);
  }

  static calculateCountdown(weddingDateStr: string | null | undefined): CountdownResult {
    if (!weddingDateStr) {
      return {
        isPast: false,
        isToday: false,
        totalDays: 0,
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        formattedString: "Chưa xác định ngày",
      };
    }

    const target = new Date(weddingDateStr);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) {
      const isToday =
        target.getDate() === now.getDate() &&
        target.getMonth() === now.getMonth() &&
        target.getFullYear() === now.getFullYear();

      if (isToday) {
        return {
          isPast: false,
          isToday: true,
          totalDays: 0,
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          formattedString: "Hôm nay là Ngày Trọng Đại! 🎉",
        };
      }

      return {
        isPast: true,
        isToday: false,
        totalDays: 0,
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        formattedString: "Đám cưới đã diễn ra trọn vẹn ❤️",
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalDays = Math.floor(totalSeconds / (3600 * 24));
    
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      isPast: false,
      isToday: false,
      totalDays,
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      formattedString: `Còn ${totalDays} ngày`,
    };
  }
}
