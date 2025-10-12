"use client";
import { UserRound, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  SidebarBody,
  Sidebar as SidebarComponent,
  SidebarLink,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/components/providers/auth-provider";
import { signOut } from "@/lib/auth-client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    } catch {
      toast.error("Failed to logout");
    }
  };

  const links = [
    {
      label: "Overview",
      href: "/account/overview",
    },
    {
      label: "Account Activity",
      href: "/account/activity",
    },
    {
      label: "Onboarding",
      href: "/account/onboarding",
    },
    {
      label: "Wallets",
      href: "/account/wallets",
    },
    {
      label: "Settings",
      href: "/account/settings",
    },
  ];

  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActiveLink = (link: (typeof links)[0]) => {
    if (
      link.href &&
      pathname &&
      pathname.startsWith(link.href) &&
      link.href !== "#"
    ) {
      return true;
    }

    return false;
  };

  return (
    <>
      <div className="hidden lg:flex mx-auto w-full flex-1 flex-col overflow-hidden bg-background md:flex-row h-full">
        <SidebarComponent animate={false} open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between md:gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <span className="font-semibold text-2xl text-black pl-3 mt-5 mb-8">
                My Account
              </span>

              <nav
                aria-label="Main navigation"
                className="flex flex-col gap-2"
                role="navigation"
              >
                {links.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    className={cn(
                      "rounded-md px-1 transition-all duration-200",
                      isActiveLink(link)
                        ? "bg-neutral-200"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    )}
                    classNameLabel={
                      isActiveLink(link)
                        ? "text-black font-medium text-[14px]"
                        : "text-neutral-600 dark:text-neutral-400"
                    }
                    link={link}
                  />
                ))}
                <Separator />
                <button
                  className={cn(
                    "flex items-center gap-2 group/sidebar py-2 px-3 cursor-pointer transition-all duration-200 rounded-lg",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    "focus-within:bg-neutral-100 dark:focus-within:bg-neutral-800",
                    "rounded-md px-1 transition-all duration-200 text-start pl-5 text-sm cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700",
                  )}
                  onClick={handleLogout}
                >
                  <span className="text-red-500">Log Out</span>
                </button>
              </nav>
            </div>
          </SidebarBody>
        </SidebarComponent>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      <div className="lg:hidden w-full flex-1 flex flex-col overflow-hidden bg-background h-full">
        <div className="flex items-center justify-between py-4 border-b">
          <span className="font-semibold text-2xl text-black">My Account</span>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[280px] sm:w-[320px]" side="right">
              <SheetHeader>
                <SheetTitle className="text-left">Navigation</SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Main navigation"
                className="flex flex-col gap-2 px-4"
                role="navigation"
              >
                {links.map((link, idx) => (
                  <Link
                    key={idx}
                    className={cn(
                      "rounded-md px-4 py-2.5 transition-all duration-200 text-sm",
                      isActiveLink(link)
                        ? "bg-neutral-200 text-black font-medium"
                        : "text-neutral-600 hover:bg-neutral-100",
                    )}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Separator className="my-2" />
                <button
                  className={cn(
                    "rounded-md px-4 py-2.5 transition-all duration-200 text-sm text-start font-semibold",
                    "text-red-500 hover:bg-neutral-100",
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Log Out
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}

export const UserProfile = () => {
  const { open } = useSidebar();
  const { user } = useAuthContext();

  const getUserInitials = (user: any) => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }

    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  const getUserRole = () => {
    return "User";
  };

  return (
    <Link
      className="flex items-center gap-3 bg-background rounded-2xl p-3 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
      href="/account/overview"
    >
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
          {getUserInitials(user)}
        </AvatarFallback>
        <AvatarImage alt="User Avatar" src={user?.image!} />
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-0.5 transition-opacity duration-200 min-w-0",
          !open && "hidden md:flex",
        )}
      >
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {getUserDisplayName()}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {getUserRole()}
        </span>
      </div>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
      <UserRound className="h-5 w-5 text-primary-foreground" />
    </div>
  );
};
