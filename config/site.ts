export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "IDRC Protocol",
  description: "IDRC Protocol is a Tokenized RWA platform.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  navItems: [],
  miniapp: {
    name: "IDRC MiniApp",
    version: "1",
    heroImageUrl: process.env.NEXT_PUBLIC_APP_URL + "/logo-white.png",
  },
};
