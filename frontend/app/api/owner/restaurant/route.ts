import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const restaurant = await client.fetch(
      `*[_type == "restaurant" && owner._ref == $userId][0]{
        _id,
        name,
        description,
        address,
        phone,
        rating,
        category,
        openingHours,
        logo,
        image,
        owner->{ _id, name, email }
      }`,
      { userId }
    );

    return NextResponse.json(restaurant ?? null);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch owner restaurant" }, { status: 500 });
  }
}


