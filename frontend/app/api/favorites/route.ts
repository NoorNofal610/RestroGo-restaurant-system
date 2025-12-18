import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";
import { v4 as uuidv4 } from "uuid";

type FavoriteItem = {
  _key: string;
  dish?: {
    _id: string;
    name?: string;
    description?: string;
    price?: number;
    image?: unknown;
    restaurant?:
      | { _ref: string; _type: "reference" }
      | { _id: string; name?: string; logo?: unknown };
  };
  createdAt?: string;
};

type FavoriteDocument = {
  _id: string;
  items?: FavoriteItem[];
};

const favoritesByUserQuery = `
  *[_type == "favorite" && user._ref == $userId][0]{
    _id,
    items[]{
      _key,
      createdAt,
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

const favoritesRawItemsQuery = `
  *[_type == "favorite" && user._ref == $userId][0]{
    _id,
    items[]{
      _key,
      dish
    }
  }
`;

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const dishId = req.nextUrl.searchParams.get("dishId");

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const doc = await client.fetch<FavoriteDocument | null>(favoritesByUserQuery, { userId });
    const items = doc?.items ?? [];

    if (dishId) {
      const isFavorite = items.some((item) => item.dish?._id === dishId);
      return NextResponse.json({ isFavorite });
    }

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, dishId } = await req.json();

    if (!userId || !dishId) {
      return NextResponse.json({ message: "Missing userId or dishId" }, { status: 400 });
    }

    const existing = await client.fetch<FavoriteDocument | null>(favoritesByUserQuery, { userId });

    // Create new favorites document for this user
    if (!existing?._id) {
      const favoriteDoc = await client.create({
        _type: "favorite",
        _id: uuidv4(),
        user: { _type: "reference", _ref: userId },
        items: [
          {
            _key: uuidv4(),
            dish: { _type: "reference", _ref: dishId },
            createdAt: new Date().toISOString(),
          },
        ],
      });

      return NextResponse.json({ success: true, favoriteId: favoriteDoc._id }, { status: 201 });
    }

    const items = existing.items ?? [];

    // If already in favorites, do nothing
    if (items.some((item) => item.dish?._id === dishId)) {
      return NextResponse.json({ success: true });
    }

    const updatedItems = [
      ...items.map((item) => ({
        _key: item._key,
        dish: { _type: "reference", _ref: item.dish?._id },
        createdAt: item.createdAt,
      })),
      {
        _key: uuidv4(),
        dish: { _type: "reference", _ref: dishId },
        createdAt: new Date().toISOString(),
      },
    ];

    await client.patch(existing._id).set({ items: updatedItems }).commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to add favorite" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, dishId } = await req.json();

    if (!userId || !dishId) {
      return NextResponse.json({ message: "Missing userId or dishId" }, { status: 400 });
    }

    const existing = await client.fetch<{ _id: string; items?: { _key: string; dish?: { _ref: string } }[] } | null>(
      favoritesRawItemsQuery,
      { userId }
    );

    if (!existing?._id) {
      return NextResponse.json({ success: true });
    }

    const currentItems = existing.items ?? [];
    const remaining = currentItems.filter((item) => item.dish?._ref !== dishId);

    if (remaining.length === 0) {
      await client.delete(existing._id);
      return NextResponse.json({ success: true });
    }

    await client
      .patch(existing._id)
      .set({
        items: remaining,
      })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to remove favorite" }, { status: 500 });
  }
}

