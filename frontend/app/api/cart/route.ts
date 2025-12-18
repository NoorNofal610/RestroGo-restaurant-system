import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";
import type { CartItem } from "@/src/sanity/types";

const pendingOrderQuery = `
  *[_type == "order" && user._ref == $userId && status == "pending"][0]{
    _id,
    status,
    totalPrice,
    items[]{
      _key,
      quantity,
      dish->{
        _id,
        name,
        description,
        price,
        image,
        restaurant->{
          _id,
          name,
          logo
        }
      }
    }
  }
`;

const normalizeItemsForPatch = (items: Array<CartItem & { dish?: { _id?: string | null } | null }>) =>
  items
    // Filter out items that are not linked to a dish
    .filter((item) => item.dish?._id)
    .map((item) => ({
      _key: item._key,
      quantity: item.quantity,
      dish: { _type: "reference" as const, _ref: item.dish?._id! },
    }));

const calculateTotalPrice = (items: Array<CartItem & { dish?: { price?: number | null } | null }>) =>
  items.reduce((sum, item) => sum + (item.dish?.price ?? 0) * item.quantity, 0);

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId" },
        { status: 400 }
      );
    }

    const order = await client.fetch(
      pendingOrderQuery,
      { userId }
    );

    return NextResponse.json(order ?? null);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, itemKey, quantity } = await req.json();

    if (!userId || !itemKey || typeof quantity !== "number") {
      return NextResponse.json(
        { message: "Missing userId, itemKey or quantity" },
        { status: 400 }
      );
    }

    const order = await client.fetch(
      pendingOrderQuery,
      { userId }
    );

    if (!order) {
      return NextResponse.json(
        { message: "No pending order found" },
        { status: 404 }
      );
    }

    const items: CartItem[] = order.items ?? [];
    const targetItem = items.find((item) => item._key === itemKey);

    if (!targetItem) {
      return NextResponse.json(
        { message: "Item not found in cart" },
        { status: 404 }
      );
    }

    const clampedQuantity = Math.max(1, quantity);
    const updatedItems = items.map((item) =>
      item._key === itemKey ? { ...item, quantity: clampedQuantity } : item
    );

    const totalPrice = calculateTotalPrice(updatedItems);

    await client
      .patch(order._id)
      .set({
        items: normalizeItemsForPatch(updatedItems),
        totalPrice,
      })
      .commit();

    const refreshedOrder = await client.fetch(
      pendingOrderQuery,
      { userId }
    );

    return NextResponse.json(refreshedOrder);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, itemKey } = await req.json();

    if (!userId || !itemKey) {
      return NextResponse.json(
        { message: "Missing userId or itemKey" },
        { status: 400 }
      );
    }

    const order = await client.fetch(
      pendingOrderQuery,
      { userId }
    );

    if (!order) {
      return NextResponse.json(
        { message: "No pending order found" },
        { status: 404 }
      );
    }

    const items: CartItem[] = order.items ?? [];
    const remainingItems = items.filter((item) => item._key !== itemKey);

    if (remainingItems.length === 0) {
      await client.delete(order._id);
      return NextResponse.json(null);
    }

    const totalPrice = calculateTotalPrice(remainingItems);

    await client
      .patch(order._id)
      .set({
        items: normalizeItemsForPatch(remainingItems),
        totalPrice,
      })
      .commit();

    const refreshedOrder = await client.fetch(
      pendingOrderQuery,
      { userId }
    );

    return NextResponse.json(refreshedOrder);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}
