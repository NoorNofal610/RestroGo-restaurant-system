import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

const pendingOrderQuery = `
  *[_type == "order" && user._ref == $userId && status == "pending"][0]{
    _id,
    items[]{
      quantity,
      dish->{
        price
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const { userId, discountPercent = 0 } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const order = await client.fetch<{
      _id: string;
      items?: { quantity?: number; dish?: { price?: number } }[];
    } | null>(pendingOrderQuery, { userId });

    if (!order?._id) {
      return NextResponse.json({ message: "No pending order found" }, { status: 404 });
    }

    const items = order.items ?? [];
    const subtotal = items.reduce(
      (sum, item) => sum + (item.dish?.price ?? 0) * (item.quantity ?? 0),
      0
    );

    const deliveryFeeBase = 2;
    const minFreeDelivery = 25;
    const deliveryFee = subtotal >= minFreeDelivery || subtotal === 0 ? 0 : deliveryFeeBase;

    const totalBeforeDiscount = subtotal + deliveryFee;
    const percent = typeof discountPercent === "number" ? discountPercent : 0;
    const discountAmount = percent > 0 ? (totalBeforeDiscount * percent) / 100 : 0;
    const finalTotal = Math.max(totalBeforeDiscount - discountAmount, 0);

    await client
      .patch(order._id)
      .set({
        status: "completed",
        completedAt: new Date().toISOString(),
        totalPrice: finalTotal,
      })
      .commit();

    return NextResponse.json({ success: true, totalPrice: finalTotal });
  } catch (error) {
    return NextResponse.json({ message: "Failed to complete checkout" }, { status: 500 });
  }
}

