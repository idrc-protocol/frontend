import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, bypassCaptcha } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    const authRequest = new Request(
      `${process.env.BETTER_AUTH_URL}/api/auth/sign-in/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          ...(bypassCaptcha && { disableCaptcha: true }),
        }),
      },
    );

    const authResponse = await auth.handler(authRequest);

    if (!authResponse.ok) {
      const text = await authResponse.text();
      let authData;

      try {
        authData = JSON.parse(text);
      } catch {
        authData = { message: text || "Invalid email or password" };
      }

      return NextResponse.json(
        {
          error: "Login failed",
          details: authData.message || "Invalid email or password",
        },
        { status: 401 },
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin login successful",
      },
      { status: 200 },
    );

    const cookies = authResponse.headers.getSetCookie();

    cookies.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Login failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
