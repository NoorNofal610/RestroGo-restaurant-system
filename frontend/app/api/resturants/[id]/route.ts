
import { NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ لازم await
    const { id } = await context.params;

    const query = `
      *[_type == "restaurant" && _id == $id][0]{
        _id,
        name,
        description,
        image,
        logo,
        category,
        rating,
        phone,
        address,
        openingHours
      }
    `;

    // ✅ تمرير id للـ GROQ
    const restaurant = await client.fetch(query, { id });

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Restaurant API error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const {
      rating,
      name,
      description,
      address,
      phone,
      openingHours,
      category,
      image,
      logo,
    } = body as {
      rating?: number;
      name?: string;
      description?: string;
      address?: string;
      phone?: string;
      openingHours?: string;
      category?: string;
      image?: any;
      logo?: any;
    };

    const patch: Record<string, unknown> = {};

    // rating (used by the ratings API)
    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 0 || rating > 5) {
        return NextResponse.json({ message: "Invalid rating" }, { status: 400 });
      }
      patch.rating = rating;
    }

    if (typeof name === "string") patch.name = name;
    if (typeof description === "string") patch.description = description;
    if (typeof address === "string") patch.address = address;
    if (typeof phone === "string") patch.phone = phone;
    if (typeof openingHours === "string") patch.openingHours = openingHours;
    if (typeof category === "string") patch.category = category;
    if (image !== undefined) patch.image = image;
    if (logo !== undefined) patch.logo = logo;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ message: "No fields provided" }, { status: 400 });
    }

    const updated = await client.patch(id).set(patch).commit();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Restaurant update API error:", error);
    return NextResponse.json(
      { message: "Failed to update restaurant" },
      { status: 500 }
    );
  }
}