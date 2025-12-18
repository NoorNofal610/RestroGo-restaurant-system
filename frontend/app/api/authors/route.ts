import { NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET() {
  const query = `*[_type == "author"]{
    _id,
    name,
    bio,
    img
  }`;

  try {
    const authors = await client.fetch(query);
    return NextResponse.json(authors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching authors", error }, { status: 500 });
  }
}
