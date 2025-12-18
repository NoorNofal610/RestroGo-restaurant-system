import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET(_req: NextRequest) {
  try {
    const query = `
      {
        "restaurants": count(*[_type == "restaurant"]),
        "dishes": count(*[_type == "dish"]),
        "users": count(*[_type == "user"]),
        "pendingRequests": count(*[_type == "restaurantSignupRequest" && status == "pending"])
      }
    `;
    const stats = await client.fetch(query);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ message: "Failed to load stats" }, { status: 500 });
  }
}


