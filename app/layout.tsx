import "./globals.css";

import { Metadata, Viewport } from "next";
import { getMessages, getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import React from "react";

import DefaultLayout from "@/components/layout/default";
import Providers from "@/components/providers";
import { siteConfig } from "@/config/site";
import { FarcasterInit } from "@/components/farcaster-init";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    const checkSDK = setInterval(() => {
                      if (window.sdk && window.sdk.actions && window.sdk.actions.ready) {
                        clearInterval(checkSDK);
                        window.sdk.actions.ready().then(() => {
                          console.log('✅ Farcaster SDK ready() called successfully!');
                        }).catch((err) => {
                          console.error('❌ Farcaster SDK ready() failed:', err);
                        });
                      }
                    }, 100);
                    setTimeout(() => clearInterval(checkSDK), 5000);
                  }
                } catch (e) {
                  console.error('Error initializing Farcaster SDK:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased bg-background text-foreground`}>
        <Script
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="lazyOnload"
        />
        <FarcasterInit />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <DefaultLayout>{children}</DefaultLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
