import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET(_req: NextRequest) {
  try {
    const query = `*[_type == "restaurant"]{
      _id,
      name,
      description,
      address,
      phone,
      category,
      rating,
      image,
      logo
    } | order(_createdAt desc)`;
    const restaurants = await client.fetch(query);
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Admin restaurants error:", error);
    return NextResponse.json({ message: "Failed to load restaurants" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Missing restaurant id" }, { status: 400 });
    }

    await client.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete restaurant error:", error);
    return NextResponse.json({ message: "Failed to delete restaurant" }, { status: 500 });
  }
}


