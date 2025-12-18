import { NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET() {
  const query = `*[_type == "restaurant"]{
    _id,
    name,
    description,
    address,
    phone,
    rating,
    category,
    openingHours,
    logo {
      asset->{
        _id,
        url
      }
    },
    image {
      asset->{
        _id,
        url
      }
    },
    owner->{
      _id,
      name,
      email
    }
  }`;

  try {
    const restaurants = await client.fetch(query);
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json({ message: "Error fetching restaurants", error }, { status: 500 });
  }
}