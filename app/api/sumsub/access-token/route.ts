import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  TokenGenerationRequest,
  SumsubTokenResponse,
} from "@/types/sumsub/sumsub.type";

function createSignature(
  method: string,
  url: string,
  body?: string,
  SUMSUB_SECRET_KEY?: string,
): { signature: string; timestamp: number; SUMSUB_SECRET_KEY?: string } {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac("sha256", SUMSUB_SECRET_KEY!);

  const signatureString = timestamp + method.toUpperCase() + url;

  signature.update(signatureString);

  if (body) {
    signature.update(body);
  }

  const hexSignature = signature.digest("hex");

  return {
    signature: hexSignature,
    timestamp,
  };
}

export async function POST(request: NextRequest) {
  const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN!;
  const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY!;

  try {
    if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
      return NextResponse.json(
        {
          error: "SumSub configuration error",
          details: "Missing required environment variables",
        },
        { status: 500 },
      );
    }

    const body: TokenGenerationRequest = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const tokenRequest = {
      userId: body.userId,
      levelName:
        body.levelName || process.env.KYC_LEVEL_NAME || "id-and-liveness",
      ttlInSecs:
        body.ttlInSecs || parseInt(process.env.KYC_TOKEN_TTL || "1200"),
    };

    const url = "/resources/accessTokens/sdk";
    const requestBody = JSON.stringify(tokenRequest);
    const { signature, timestamp } = createSignature(
      "POST",
      url,
      requestBody,
      SUMSUB_SECRET_KEY,
    );

    const response = await fetch(`https://api.sumsub.com${url}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-App-Token": SUMSUB_APP_TOKEN,
        "X-App-Access-Ts": timestamp.toString(),
        "X-App-Access-Sig": signature,
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.text();

      return NextResponse.json(
        {
          error: "Failed to generate access token",
          details: errorData,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status },
      );
    }

    const tokenResponse: SumsubTokenResponse = await response.json();

    return NextResponse.json(tokenResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
