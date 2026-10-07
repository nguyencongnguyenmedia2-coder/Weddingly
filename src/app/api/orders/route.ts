import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SubscriptionOrder } from "@/types/database";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "subscription_orders.json");

const SEED_ORDERS: SubscriptionOrder[] = [];

function readServerOrders(): SubscriptionOrder[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_ORDERS, null, 2), "utf-8");
      return SEED_ORDERS;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_ORDERS;
  } catch (err) {
    console.error("Error reading server orders:", err);
    return SEED_ORDERS;
  }
}

function writeServerOrders(orders: SubscriptionOrder[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing server orders:", err);
    return false;
  }
}

// GET: Return all orders sorted newest first
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const userEmail = searchParams.get("userEmail");

  const orders = readServerOrders().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (userId || userEmail) {
    const filtered = orders.filter((o) => {
      if (userId && o.user_id === userId) return true;
      if (userEmail && o.user_email?.toLowerCase() === userEmail.toLowerCase()) return true;
      return false;
    });
    return NextResponse.json({ success: true, data: filtered });
  }

  return NextResponse.json({ success: true, data: orders });
}

// POST: Create or upsert order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.plan) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const currentOrders = readServerOrders();
    const existingIndex = currentOrders.findIndex(
      (o) => (body.id && o.id === body.id) || (body.code && o.code === body.code)
    );

    let targetOrder: SubscriptionOrder;

    if (existingIndex >= 0) {
      targetOrder = {
        ...currentOrders[existingIndex],
        ...body,
      };
      currentOrders[existingIndex] = targetOrder;
    } else {
      targetOrder = {
        id: body.id || crypto.randomUUID(),
        code: body.code || `WD-${body.plan}-${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: body.user_id || "guest-user",
        user_email: body.user_email || "customer@weddingly.vn",
        user_name: body.user_name || "Khách hàng",
        user_phone: body.user_phone || "",
        wedding_id: body.wedding_id,
        wedding_title: body.wedding_title || "Kế hoạch cưới",
        plan: body.plan,
        amount: body.amount || (body.plan === "VIP" ? 999000 : 499000),
        payment_method: body.payment_method || "VIETQR",
        transfer_content: body.transfer_content || `${body.code || "WD"} KH`,
        status: body.status || "PENDING",
        proof_image_url: body.proof_image_url,
        notes: body.notes,
        created_at: body.created_at || new Date().toISOString(),
      };
      currentOrders.unshift(targetOrder);
    }

    writeServerOrders(currentOrders);
    return NextResponse.json({ success: true, data: targetOrder });
  } catch (err: any) {
    console.error("API error creating order:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Approve or reject an order
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, rejection_reason, reviewed_by } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: "orderId and status are required" }, { status: 400 });
    }

    const currentOrders = readServerOrders();
    const index = currentOrders.findIndex((o) => o.id === orderId || o.code === orderId);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const updated: SubscriptionOrder = {
      ...currentOrders[index],
      status,
      reviewed_by: reviewed_by || "Super Admin",
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejection_reason || undefined,
    };

    currentOrders[index] = updated;
    writeServerOrders(currentOrders);

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("API error updating order:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
