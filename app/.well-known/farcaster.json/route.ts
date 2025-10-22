type PropertyValue = string | string[] | undefined;

export function withValidProperties(properties: Record<string, PropertyValue>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;

      return Boolean(value);
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return Response.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjEwNTA0NjMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhBMDhDMjNDOEQzN0FkNjNFQzNDNWFDNGI5NDlmMENGMDVENzdkQ2ExIn0",
      payload: "eyJkb21haW4iOiJhcHAuaWRyYy5zaXRlIn0",
      signature:
        "sM09Mg7ET5frsrIZ5mLQomb54CdH17HURp46qxZvnYt3iRnvWv+g9Tgm2aA5/C/L0NLJ66j7jR3RwihWoMC5Zxs=",
    },

    miniapp: {
      version: "1",
      name: "IDRC Protocol",
      homeUrl: URL,
      iconUrl: `${URL}/logo-white.png`,
      splashImageUrl: `${URL}/logo-white.png`,
      splashBackgroundColor: "#0D0D0D",
      webhookUrl: `${URL}/api/webhook`,

      subtitle: "Tokenized RWA Platform",
      description:
        "IDRC Protocol is a Tokenized Real World Asset (RWA) platform that bridges traditional finance with DeFi, enabling secure and transparent asset tokenization on-chain.",

      screenshotUrls: [
        `${URL}/logo-white.png`,
        `${URL}/logo-white.png`,
        `${URL}/logo-white.png`,
      ],

      primaryCategory: "finance",
      tags: ["rwa", "defi", "idrc", "web3", "tokenization"],
      heroImageUrl: `${URL}/logo-white.png`,

      tagline: "Tokenize Real Assets",
      ogTitle: "IDRC — Tokenized RWA Protocol",
      ogDescription:
        "Empowering real-world asset tokenization with DeFi transparency.",
      ogImageUrl: `${URL}/logo-white.png`,
      noindex: false,
    },

    baseBuilder: {
      allowedAddresses: ["0x2b502a871d26990a690418513d4d8dc16e21477d"],
    },
  });
}
