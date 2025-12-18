
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { client } from "@/app/sanity/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      restaurantName,
      restaurantCategory,
      restaurantDescription,
    } = body as {
      name: string;
      email: string;
      password: string;
      role: "customer" | "restaurant";
      restaurantName?: string;
      restaurantCategory?: string;
      restaurantDescription?: string;
    };

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If customer -> create user directly
    if (role === "customer") {
      const newUser = await client.create({
        _type: "user",
        name,
        email,
        password: hashedPassword,
        role,
      });

      return NextResponse.json(
        {
          success: true,
          message: "User created successfully",
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        },
        { status: 201 }
      );
    }

    // If restaurant -> create signup request instead
    if (!restaurantName || !restaurantCategory || !restaurantDescription) {
      return NextResponse.json(
        { success: false, message: "Restaurant name, category and description are required" },
        { status: 400 }
      );
    }

    await client.create({
      _type: "restaurantSignupRequest",
      name,
      email,
      password: hashedPassword,
      restaurantName,
      restaurantCategory,
      restaurantDescription,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Signup request submitted. Waiting for admin approval.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) message = err.message;

    console.error("Signup Error:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
