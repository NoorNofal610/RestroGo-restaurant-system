import { NextRequest, NextResponse } from "next/server";
import { client } from "@/app/sanity/client";

export async function GET(_req: NextRequest) {
  try {
    const query = `*[_type == "restaurantSignupRequest" && status == "pending"] | order(_createdAt asc){
      _id,
      name,
      email,
      restaurantName,
      restaurantCategory,
      restaurantDescription,
      createdAt
    }`;
    const requests = await client.fetch(query);
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Admin requests error:", error);
    return NextResponse.json({ message: "Failed to load requests" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json() as { id?: string; action?: "approve" | "reject" };
    if (!id || !action) {
      return NextResponse.json({ message: "Missing id or action" }, { status: 400 });
    }

    const requestDoc = await client.fetch(
      `*[_type == "restaurantSignupRequest" && _id == $id][0]`,
      { id }
    );

    if (!requestDoc) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // Prevent double-processing (idempotent behavior)
    if (requestDoc.status && requestDoc.status !== "pending") {
      return NextResponse.json({ success: true, message: "Request already processed" }, { status: 200 });
    }

    if (action === "reject") {
      await client
        .patch(id)
        .set({ status: "rejected" })
        .commit();
      return NextResponse.json({ success: true });
    }

    // Approve: create user + restaurant, then mark request approved
    const { name, email, password, restaurantName, restaurantCategory, restaurantDescription } =
      requestDoc as {
        name: string;
        email: string;
        password: string;
        restaurantName: string;
        restaurantCategory: string;
        restaurantDescription: string;
      };

    // Create user only if it doesn't already exist (avoid duplicates)
    let user = await client.fetch(`*[_type == "user" && email == $email][0]{ _id }`, { email });
    if (!user?._id) {
      user = await client.create({
        _type: "user",
        name,
        email,
        password,
        role: "restaurant",
      });
    }

    // Create restaurant linked to this user only if it doesn't already exist (avoid duplicates)
    const existingRestaurant = await client.fetch(
      `*[_type == "restaurant" && owner._ref == $ownerId][0]{ _id }`,
      { ownerId: user._id }
    );

    if (!existingRestaurant?._id) {
      await client.create({
        _type: "restaurant",
        name: restaurantName,
        description: restaurantDescription,
        category: restaurantCategory,
        owner: { _type: "reference", _ref: user._id },
      });
    }

    await client
      .patch(id)
      .set({ status: "approved" })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approve request error:", error);
    return NextResponse.json({ message: "Failed to update request" }, { status: 500 });
  }
}


