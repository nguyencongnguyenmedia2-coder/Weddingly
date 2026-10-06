import { Vendor, VendorStatus } from "@/types/database";
import { WeddingStore } from "@/lib/wedding-store";

export class VendorService {
  static async getVendors(weddingId?: string): Promise<Vendor[]> {
    return WeddingStore.getVendors();
  }

  static async addVendor(data: {
    name: string;
    category: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    price?: number;
    rating?: number;
    status?: VendorStatus;
    notes?: string | null;
  }): Promise<Vendor> {
    return WeddingStore.addVendor(data);
  }

  static async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor | null> {
    return WeddingStore.updateVendor(id, data);
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const v = WeddingStore.getVendors().find((item) => item.id === id);
    if (v) {
      WeddingStore.updateVendor(id, { is_favorite: !v.is_favorite });
      return !v.is_favorite;
    }
    return false;
  }

  static async deleteVendor(id: string): Promise<boolean> {
    return WeddingStore.deleteVendor(id);
  }
}
