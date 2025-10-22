import "./globals.css";

import { Metadata, Viewport } from "next";
import { getMessages, getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import React from "react";

import DefaultLayout from "@/components/layout/default";
import Providers from "@/components/providers";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s`,
  },
  description: siteConfig.description,
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "TypeScript",
    "Web App",
    siteConfig.name,
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  generator: "Next.js 15",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "fc:frame": JSON.stringify({
      version: siteConfig.miniapp.version,
      imageUrl: siteConfig.miniapp.heroImageUrl,
      button: {
        title: `${siteConfig.miniapp.name} Protocol`,
        action: {
          name: `Launch ${siteConfig.miniapp.name}`,
          type: "launch_frame",
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html suppressHydrationWarning lang="en">
      <body className={`antialiased bg-background text-foreground`}>
        <Script
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="lazyOnload"
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <DefaultLayout>{children}</DefaultLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
