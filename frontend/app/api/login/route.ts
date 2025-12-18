
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { client } from "@/app/sanity/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    let user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (!user) {
      // Auto-create admin user if not found and email is admin@gmail.com
      if (email === "admin@gmail.com") {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await client.create({
          _type: "user",
          name: "Admin",
          email,
          password: hashedPassword,
          role: "customer",
        });
      } else {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json({ success: true, message: "Login successful", user: safeUser }, { status: 200 });

  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
