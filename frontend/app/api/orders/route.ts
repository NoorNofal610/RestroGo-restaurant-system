
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";
import { v4 as uuidv4 } from "uuid";

type OrderItem = {
  _key: string;
  dish: {
    _type: "reference";
    _ref: string;
  };
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const { userId, restaurantId, dishId, quantity } = await req.json();

    if (!userId || !restaurantId || !dishId || !quantity) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1 Fetch dish price
    const dish = await client.fetch<{ price: number }>(
      `*[_type == "dish" && _id == $dishId][0]{ price }`,
      { dishId }
    );

    if (!dish) {
      return NextResponse.json({ message: "Dish not found" }, { status: 404 });
    }

    const dishPrice = dish.price;

    // 2 Fetch existing order for this user and restaurant
    const existingOrder = await client.fetch<{
      _id: string;
      items?: OrderItem[];
    }>(
      `*[_type == "order" && user._ref == $userId && restaurant._ref == $restaurantId && status == "pending"][0]`,
      { userId, restaurantId }
    );

    // ================================
    // 3 Create new order if none exists
    // ================================
    if (!existingOrder) {
      const newOrder = await client.create({
        _type: "order",
        user: { _type: "reference", _ref: userId },
        restaurant: { _type: "reference", _ref: restaurantId },
        items: [
          {
            _key: uuidv4(),
            dish: { _type: "reference", _ref: dishId },
            quantity,
          },
        ],
        totalPrice: dishPrice * quantity, // 🔹 Calculate total price directly
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json(newOrder, { status: 201 });
    }

    // ================================
    // 4 Update existing order
    // ================================
    const existingItems = existingOrder.items ?? [];

    const itemIndex = existingItems.findIndex(
      (item) => item.dish._ref === dishId
    );

    const updatedItems: OrderItem[] =
      itemIndex > -1
        ? existingItems.map((item, index) =>
            index === itemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [
            ...existingItems,
            {
              _key: uuidv4(),
              dish: { _type: "reference", _ref: dishId },
              quantity,
            },
          ];

    // Recalculate totalPrice for all items
    let newTotalPrice = 0;
    for (const item of updatedItems) {
      // Fetch price for each dish from Sanity
      const dishData = await client.fetch<{ price: number }>(
        `*[_type == "dish" && _id == $dishId][0]{ price }`,
        { dishId: item.dish._ref }
      );
      newTotalPrice += (dishData?.price || 0) * item.quantity;
    }

    const updatedOrder = await client
      .patch(existingOrder._id)
      .set({ items: updatedItems, totalPrice: newTotalPrice }) //  Update total price
      .commit();

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) errorMessage = error.message;

    return NextResponse.json(
      { message: "Failed to add to order", error: errorMessage },
      { status: 500 }
    );
  }
}
