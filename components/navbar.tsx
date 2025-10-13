"use client";
import {
  IconDropletHalf,
  IconMenu,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";
import { SearchIcon, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { assetData } from "@/data/asset.data";
import { cn } from "@/lib/utils";

import FallbackImage from "./fallback-image";
import { useAuthContext } from "./providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const navigationMenu = [
  {
    id: "explore",
    label: "Explore",
    href: "/explore",
    type: "link" as const,
    icon: <IconWorld size={25} stroke={1} />,
    desc: "Discover global investment opportunities",
  },
  {
    id: "faucet",
    label: "Faucet",
    href: "/faucet",
    type: "link" as const,
    icon: <IconDropletHalf size={25} stroke={1} />,
    desc: "Educational resources on global markets",
  },
  {
    id: "account",
    label: "Account",
    href: "/account",
    type: "link" as const,
    icon: <IconUser size={25} stroke={1} />,
    desc: "Manage your account settings",
  },
];

export default function Navbar() {
  const { user } = useAuthContext();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }

    return "U";
  };

  const filteredAssets = assetData.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderMenuItem = (item: (typeof navigationMenu)[0]) => {
    return (
      <li key={item.id}>
        <Link href={item.href!}>
          <Button
            className={`hover:bg-gray-50 ${isActive(item.href!) ? "bg-gray-100" : ""}`}
            variant="ghost"
          >
            {item.label}
          </Button>
        </Link>
      </li>
    );
  };

  return (
    <div className="w-full mx-auto border-b z-40 absolute top-0 bg-background">
      <div className="px-5 sm:px-7 md:px-12 py-3 flex items-center">
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-5">
            <Link href="/explore">
              <FallbackImage
                alt="Logo"
                className="w-7 h-7"
                height={30}
                src="/logo-black.png"
                width={120}
              />
            </Link>
            <div className="relative hidden lg:block">
              <Popover
                open={desktopSearchOpen}
                onOpenChange={setDesktopSearchOpen}
              >
                <PopoverAnchor asChild>
                  <div className="relative">
                    <SearchIcon
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10"
                      size={16}
                    />
                    <input
                      className="pl-9 pr-3 py-2 min-w-[300px] rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
                      placeholder="Search Asset"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setDesktopSearchOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setDesktopSearchOpen(false);
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  </div>
                </PopoverAnchor>
                <PopoverContent
                  align="start"
                  className="w-[300px] p-0"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="max-h-[400px] overflow-y-auto">
                    <div className="flex items-center gap-1 px-3 pt-2">
                      <span className="text-xs text-neutral-600">Trending</span>
                      <TrendingUp className="text-neutral-600" size={12} />
                    </div>
                    {filteredAssets.length > 0 ? (
                      <div className="flex flex-col">
                        {filteredAssets.map((asset, idx) => {
                          const price = parseFloat(asset.primaryMarket.price);
                          const changePercent = parseFloat(
                            asset.primaryMarket.priceChangePct24h,
                          );
                          const isPositive = changePercent >= 0;

                          return (
                            <Link
                              key={idx}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0 rounded-lg"
                              href={`/assets/${asset.symbol}`}
                              onClick={() => {
                                setDesktopSearchOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <FallbackImage
                                  alt={asset.assetName}
                                  className="rounded-full w-10 h-10"
                                  height={40}
                                  src={asset.iconSrc}
                                  width={40}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">
                                    {asset.symbol}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {asset.assetName}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="font-medium text-sm">
                                  ${price.toFixed(2)}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    isPositive
                                      ? "text-green-600"
                                      : "text-red-500",
                                  )}
                                >
                                  {isPositive ? "+" : ""}
                                  {changePercent.toFixed(2)}%
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <SearchIcon className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">
                          {searchQuery
                            ? "No assets found"
                            : "Start typing to search assets"}
                        </p>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
              <SheetTrigger asChild>
                <Button className="lg:hidden" size="icon" variant="ghost">
                  <SearchIcon className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                className="h-auto max-h-[50vh] flex flex-col p-0 rounded-t-2xl"
                side="bottom"
              >
                <SheetHeader className="p-4">
                  <SheetTitle>Search Assets</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-3">
                  {filteredAssets.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {filteredAssets.map((asset, idx) => {
                        const price = parseFloat(asset.primaryMarket.price);
                        const changePercent = parseFloat(
                          asset.primaryMarket.priceChangePct24h,
                        );
                        const isPositive = changePercent >= 0;

                        return (
                          <Link
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            href={`/assets/${asset.symbol}`}
                            onClick={() => {
                              setMobileSearchOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <FallbackImage
                                alt={asset.assetName}
                                className="rounded-full w-10 h-10"
                                height={40}
                                src={asset.iconSrc}
                                width={40}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">
                                  {asset.symbol}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {asset.assetName}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-medium text-sm">
                                ${price.toFixed(2)}
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  isPositive
                                    ? "text-green-600"
                                    : "text-red-500",
                                )}
                              >
                                {isPositive ? "+" : ""}
                                {changePercent.toFixed(2)}%
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <SearchIcon className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">
                        {searchQuery
                          ? "No assets found"
                          : "Start typing to search assets"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white">
                  <div className="relative">
                    <SearchIcon
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <input
                      className="w-full pl-9 pr-3 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
                      placeholder="Search assets..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex w-full justify-center">
            <ul className="flex items-center gap-3 text-sm font-medium">
              {navigationMenu.map(renderMenuItem)}
            </ul>
          </div>

          <div className="flex w-full justify-end items-center gap-3">
            <Link href="/account/overview">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-black text-white text-sm font-normal">
                  {getUserInitials(user)}
                </AvatarFallback>
                <AvatarImage alt="User Avatar" src={user?.image!} />
              </Avatar>
            </Link>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button className="md:hidden" size="icon" variant="ghost">
                  <IconMenu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px]" side="right">
                <SheetHeader className="p-0 px-4 pt-4">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <Separator />
                <nav className="flex flex-col gap-5 px-4">
                  {navigationMenu.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1 rounded-lg ${isActive(item.href) ? "bg-foreground text-white" : "bg-[#f0f0f0]"} text-neutral-500`}
                        >
                          {item.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {item.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
