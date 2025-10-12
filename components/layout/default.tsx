"use client";
import React from "react";
import { usePathname } from "next/navigation";

import Navbar from "../navbar";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const hideNavbar =
    pathname &&
    (pathname.startsWith("/auth") ||
      pathname.startsWith("/onboard") ||
      pathname.startsWith("/account"));

  if (hideNavbar) {
    return (
      <div className="relative">
        <div className="mx-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!hideNavbar && <Navbar />}
      <div className="mx-auto">{children}</div>
    </div>
  );
}
