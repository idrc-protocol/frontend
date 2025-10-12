import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { SumsubApplicantResponse } from "@/types/sumsub/sumsub.type";

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

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ applicantId: string }> },
) => {
  const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN!;
  const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY!;

  try {
    const { applicantId } = await params;

    if (!applicantId) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 },
      );
    }

    if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
      return NextResponse.json(
        {
          error: "SumSub configuration error",
          details: "Missing required environment variables",
        },
        { status: 500 },
      );
    }

    const url = `/resources/applicants/${applicantId}/one`;
    const { signature, timestamp } = createSignature(
      "GET",
      url,
      undefined,
      SUMSUB_SECRET_KEY,
    );

    const response = await fetch(`https://api.sumsub.com${url}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-App-Token": SUMSUB_APP_TOKEN,
        "X-App-Access-Ts": timestamp.toString(),
        "X-App-Access-Sig": signature,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to get applicant status",
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status },
      );
    }

    const applicantResponse: SumsubApplicantResponse = await response.json();

    const review = applicantResponse.review || {};
    const requiredIdDocs = applicantResponse.requiredIdDocs || [];
    const info = applicantResponse.info || {};

    interface ProcessedDoc {
      type: string;
      setType: string;
      videoRequired?: boolean;
    }

    const processedDocs: ProcessedDoc[] = [];

    if (Array.isArray(requiredIdDocs)) {
      requiredIdDocs.forEach((docSet: any) => {
        if (docSet.types && Array.isArray(docSet.types)) {
          docSet.types.forEach((type: string) => {
            processedDocs.push({
              type: type,
              setType: docSet.idDocSetType,
              videoRequired: docSet.videoRequired,
            });
          });
        }
      });
    }

    const kycStatus = {
      applicantId: applicantResponse.id,
      externalUserId: applicantResponse.externalUserId,
      reviewStatus: review.reviewStatus || "init",
      levelName: review.levelName || "basic-kyc-level",
      createdAt: applicantResponse.createdAt,
      attemptCount: review.attemptCnt || 0,
      isReprocessing: review.reprocessing || false,
      requiredDocuments: processedDocs,

      info: info,
      inspectionId: applicantResponse.inspectionId,

      rawReview: review,
    };

    return NextResponse.json(kycStatus);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};

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
