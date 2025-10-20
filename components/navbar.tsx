"use client";
import {
  IconDropletHalf,
  IconMenu,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import FallbackImage from "./fallback-image";
import { useAuthContext } from "./providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
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
    id: "idrc",
    label: "Buy IDRC",
    href: "/idrc",
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="w-full mx-auto z-40 absolute top-0">
      <div className="px-5 sm:px-7 md:px-12 py-3 flex items-center">
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-5">
            <Link href="/idrc">
              <FallbackImage
                alt="Logo"
                className="w-7 h-7"
                height={30}
                src="/logo-black.png"
                width={120}
              />
            </Link>
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
                <AvatarImage
                  alt="User Avatar"
                  className="object-cover"
                  src={user?.image!}
                />
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
