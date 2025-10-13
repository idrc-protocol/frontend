import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
    betterAuthUrl: process.env.BETTER_AUTH_URL ? "SET" : "NOT SET",
  });
}
