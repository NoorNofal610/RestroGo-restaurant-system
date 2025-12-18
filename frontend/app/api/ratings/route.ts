import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

type RatingDoc = {
  _id: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  user?: { _id: string; name?: string };
  restaurant?: { _id: string; name?: string; logo?: unknown };
};

export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId");
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam ?? 10) || 10, 1), 50);

    const query = `
      *[_type == "restaurantRating" ${restaurantId ? "&& restaurant._ref == $restaurantId" : ""}]
        | order(createdAt desc)[0...$limit]{
          _id,
          rating,
          comment,
          createdAt,
          user->{
            _id,
            name
          },
          restaurant->{
            _id,
            name,
            logo
          }
        }
    `;

    const ratings = await client.fetch<RatingDoc[]>(query, { restaurantId, limit });
    return NextResponse.json(ratings);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch ratings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, restaurantId, rating, comment } = body as {
      userId?: string;
      restaurantId?: string;
      rating?: number;
      comment?: string;
    };

    if (!userId || !restaurantId) {
      return NextResponse.json({ message: "Missing userId or restaurantId" }, { status: 400 });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!comment || comment.trim().length < 2) {
      return NextResponse.json({ message: "Comment is required" }, { status: 400 });
    }

    await client.create({
      _type: "restaurantRating",
      user: { _type: "reference", _ref: userId },
      restaurant: { _type: "reference", _ref: restaurantId },
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    });

    // Recompute average rating and store it on the restaurant document
    const allRatings = await client.fetch<number[]>(
      `*[_type == "restaurantRating" && restaurant._ref == $restaurantId].rating`,
      { restaurantId }
    );

    const valid = allRatings.filter((r) => typeof r === "number" && r >= 1 && r <= 5);
    const avg = valid.length ? valid.reduce((s, r) => s + r, 0) / valid.length : 0;
    const avgRounded = Math.round(avg * 10) / 10;

    await client.patch(restaurantId).set({ rating: avgRounded }).commit();

    return NextResponse.json({ success: true, rating: avgRounded });
  } catch (error) {
    return NextResponse.json({ message: "Failed to submit rating" }, { status: 500 });
  }
}


