import {
  SumsubTokenResponse,
  TokenGenerationRequest,
} from "@/types/sumsub/sumsub.type";

export async function generateSumsubToken(
  userId: string,
  levelName?: string,
  ttlInSecs?: number,
): Promise<SumsubTokenResponse | null> {
  try {
    const response = await fetch("/api/sumsub/access-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        levelName,
        ttlInSecs,
      } as TokenGenerationRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(
        `Failed to generate access token: ${errorData.message || response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error generating access token: ${error}`);
  }
}

export async function getKYCStatus(applicantId: string) {
  try {
    const response = await fetch(`/api/sumsub/status/${applicantId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(
        `Failed to get KYC status: ${errorData.message || response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error getting KYC status: ${error}`);
  }
}

export function generateExternalUserId(prefix: string = "user"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `${prefix}-${timestamp}-${random}`;
}
