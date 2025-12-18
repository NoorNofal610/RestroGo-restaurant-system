import { NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET() {
  const query = `*[_type == "restaurant"]{
    category
  }`;

  try {
    const restaurants = await client.fetch<{ category?: "Fast Food" | "Italian" | "Asian" | "Cafe" | "Other" }[]>(query);
    
    const categories = [...new Set(
      restaurants
        .map((r: { category?: "Fast Food" | "Italian" | "Asian" | "Cafe" | "Other" }) => r.category)
        .filter((cat): cat is "Fast Food" | "Italian" | "Asian" | "Cafe" | "Other" => 
          cat !== undefined && cat !== null
        )
    )];
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ message: "Error fetching categories", error }, { status: 500 });
  }
}