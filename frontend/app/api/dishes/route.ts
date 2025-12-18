import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json([], { status: 400 });

  const query = `*[_type == "dish" && restaurant._ref == $restaurantId]{
    _id,
    name,
    description,
    price,
    image,
    category,
    restaurant->{
      _id,
      name,
      logo
    }
  }`;

  try {
    const dishes = await client.fetch(query, { restaurantId });
    return NextResponse.json(dishes);
  } catch (err) {
    return NextResponse.json({ message: "Error fetching dishes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, name, description, price, category, image } = body as {
      restaurantId?: string;
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      image?: any;
    };

    if (!restaurantId || !name || typeof price !== "number") {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const created = await client.create({
      _type: "dish",
      name,
      description: description ?? "",
      price,
      category: category ?? "Other",
      ...(image ? { image } : {}),
      restaurant: { _type: "reference", _ref: restaurantId },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create dish" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { dishId, name, description, price, category, image } = body as {
      dishId?: string;
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      image?: any;
    };

    if (!dishId) {
      return NextResponse.json({ message: "Missing dishId" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (typeof name === "string") patch.name = name;
    if (typeof description === "string") patch.description = description;
    if (typeof price === "number") patch.price = price;
    if (typeof category === "string") patch.category = category;
    if (image !== undefined) patch.image = image;

    const updated = await client.patch(dishId).set(patch).commit();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update dish" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { dishId } = body as { dishId?: string };

    if (!dishId) {
      return NextResponse.json({ message: "Missing dishId" }, { status: 400 });
    }

    await client.delete(dishId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete dish" }, { status: 500 });
  }
}
