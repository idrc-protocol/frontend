export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "IDRC",
  description: "IDRC is a Tokenized RWA platform.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  navItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Bond Staking",
      href: "/bond-staking",
    },
    {
      label: "Portfolio History",
      href: "/portfolio-history",
    },
  ],
};
