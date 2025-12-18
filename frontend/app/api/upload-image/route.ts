import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await client.assets.upload("image", buffer, {
      contentType: (file as any).type || "image/*",
      filename: (file as any).name || "upload.jpg",
    });

    return NextResponse.json({ assetId: asset._id, url: asset.url });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
  }
}


