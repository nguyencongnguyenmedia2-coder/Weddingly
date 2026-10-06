import { Guest, WeddingTable, RSVPStatus } from "@/types/database";
import { WeddingStore } from "@/lib/wedding-store";

export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
  children: number;
  vip: number;
  plusOnes: number;
  confirmedGuestsTotal: number;
}

export class GuestService {
  static async getGuests(weddingId?: string): Promise<Guest[]> {
    return WeddingStore.getGuests();
  }

  static async getTables(weddingId?: string): Promise<WeddingTable[]> {
    return WeddingStore.getTables();
  }

  static async getGuestStats(): Promise<GuestStats> {
    const active = WeddingStore.getGuests();
    const confirmedList = active.filter((g) => g.rsvp_status === "CONFIRMED");
    const totalConfirmedHeads = confirmedList.reduce(
      (sum, g) => sum + 1 + (g.plus_one ? 1 : 0) + Number(g.children || 0),
      0
    );

    return {
      total: active.length,
      confirmed: confirmedList.length,
      pending: active.filter((g) => g.rsvp_status === "PENDING").length,
      declined: active.filter((g) => g.rsvp_status === "DECLINED").length,
      children: active.reduce((sum, g) => sum + Number(g.children || 0), 0),
      vip: active.filter((g) => g.group_name === "VIP").length,
      plusOnes: active.filter((g) => g.plus_one).length,
      confirmedGuestsTotal: totalConfirmedHeads,
    };
  }

  static async addGuest(guest: {
    name: string;
    phone?: string | null;
    email?: string | null;
    groupName: "Gia đình" | "Bạn bè" | "Đồng nghiệp" | "VIP" | "Nhà gái" | "Nhà trai";
    side: "BRIDE" | "GROOM" | "BOTH";
    plusOne?: boolean;
    children?: number;
    rsvpStatus?: RSVPStatus;
    mealPreference?: string | null;
    tableId?: string | null;
    notes?: string | null;
  }): Promise<Guest> {
    return WeddingStore.addGuest(guest);
  }

  static async updateGuest(id: string, data: Partial<Guest>): Promise<Guest | null> {
    return WeddingStore.updateGuest(id, data);
  }

  static async deleteGuest(id: string): Promise<boolean> {
    return WeddingStore.deleteGuest(id);
  }

  static async updateGuestRSVP(token: string, data: {
    attending: boolean;
    guestCount: number;
    childrenCount: number;
    mealChoice?: string;
    wishes?: string;
  }): Promise<Guest | null> {
    const guests = WeddingStore.getGuests();
    const guest = guests.find((g) => g.rsvp_token === token);
    if (!guest) return null;

    const updated = WeddingStore.updateGuest(guest.id, {
      rsvp_status: data.attending ? "CONFIRMED" : "DECLINED",
      children: data.childrenCount,
      plus_one: data.guestCount > 1,
      meal_preference: data.mealChoice || guest.meal_preference,
      notes: data.wishes ? (guest.notes ? `${guest.notes} | Lời chúc: ${data.wishes}` : `Lời chúc: ${data.wishes}`) : guest.notes,
    });

    if (data.attending) {
      WeddingStore.addNotification({
        type: "RSVP",
        title: "Khách mời vừa xác nhận RSVP",
        message: `${guest.name} vừa xác nhận tham dự (${data.guestCount} người)!`,
      });
    }

    return updated;
  }

  static async getGuestByToken(token: string): Promise<Guest | null> {
    const guests = WeddingStore.getGuests();
    return guests.find((g) => g.rsvp_token === token) || null;
  }

  static async assignGuestToTable(guestId: string, tableId: string | null): Promise<{ success: boolean; error?: string }> {
    return WeddingStore.assignGuestToTable(guestId, tableId);
  }

  static async createTable(name: string, capacity: number = 10, tableType: "ROUND" | "RECTANGLE" | "VIP" | "LONG" = "ROUND"): Promise<WeddingTable> {
    return WeddingStore.addTable({ name, capacity, tableType });
  }

  static async updateTable(id: string, data: Partial<WeddingTable>): Promise<WeddingTable | null> {
    return WeddingStore.updateTable(id, data);
  }

  static async deleteTable(id: string): Promise<boolean> {
    return WeddingStore.deleteTable(id);
  }
}
