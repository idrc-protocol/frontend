"use client";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconX, IconChevronRight, IconMenu } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface SubLink {
  label: string;
  href: string;
}

interface Links {
  label: string;
  href?: string;
  icon?: React.JSX.Element | React.ReactNode;
  subLinks?: SubLink[];
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider animate={animate} open={open} setOpen={setOpen}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <>
      <motion.div
        animate={{
          width: animate ? (open ? "240px" : "60px") : "240px",
        }}
        className={cn(
          "h-full px-4 hidden md:flex md:flex-col bg-background dark:bg-neutral-800 w-[240px] shrink-0",
          className,
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <div
        className={cn(
          "h-14 px-4 flex flex-row md:hidden items-center justify-between bg-white dark:bg-neutral-900 w-full border-b border-neutral-200 dark:border-neutral-700 relative z-40",
        )}
        {...props}
      >
        <button
          aria-label="Toggle sidebar"
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          type="button"
          onClick={() => setOpen(!open)}
        >
          <div>
            <IconMenu className="text-neutral-700 dark:text-neutral-300 w-5 h-5" />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              animate={{ x: 0 }}
              className={cn(
                "fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-neutral-900 z-50 flex flex-col shadow-2xl md:hidden",
                className,
              )}
              exit={{ x: "-100%" }}
              initial={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <button
                  aria-label="Close sidebar"
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  <IconX className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>

              <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-4">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  classNameLabel,
  ...props
}: {
  link: Links;
  className?: string;
  classNameLabel?: string;
}) => {
  const { open, animate, setOpen } = useSidebar();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const hasSubLinks = link.subLinks && link.subLinks.length > 0;
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubLinks) {
      e.preventDefault();
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  const handleSubLinkClick = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const LinkContent = () => (
    <div
      className={cn(
        "flex items-center justify-between gap-2 group/sidebar py-3 px-3 cursor-pointer transition-all duration-200 rounded-lg",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "focus-within:bg-neutral-100 dark:focus-within:bg-neutral-800",
        className,
      )}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {link.icon && <div className="shrink-0">{link.icon}</div>}
        <motion.span
          animate={{
            display: animate
              ? open
                ? "inline-block"
                : "none"
              : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-neutral-700 dark:text-neutral-200 text-sm font-medium group-hover/sidebar:translate-x-0.5 transition-transform duration-150 whitespace-nowrap truncate"
        >
          {link.label}
        </motion.span>
      </div>

      {hasSubLinks && (
        <motion.div
          animate={{ rotate: isSubmenuOpen ? 90 : 0 }}
          className="text-neutral-400 dark:text-neutral-500 shrink-0"
          transition={{ duration: 0.2 }}
        >
          <IconChevronRight size={16} />
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {hasSubLinks ? (
        <div>
          <LinkContent />
          <AnimatePresence>
            {isSubmenuOpen && hasSubLinks && (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="ml-9 overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="py-2 space-y-1">
                  {link.subLinks?.map((subLink, index) => {
                    const isActiveLink = (href: string) => {
                      if (href && pathname?.startsWith(href) && href !== "#") {
                        return true;
                      }

                      return false;
                    };

                    return (
                      <Link
                        key={index}
                        className={cn(
                          "flex items-center gap-3 py-2.5 px-3 text-neutral-600 dark:text-neutral-300 text-sm rounded-lg transition-all duration-200 group",
                          "hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                          isActiveLink(subLink.href)
                            ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                            : "",
                        )}
                        href={subLink.href}
                        onClick={handleSubLinkClick}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0 transition-colors duration-200",
                            isActiveLink(subLink.href)
                              ? "bg-primary"
                              : "bg-neutral-300 dark:bg-neutral-600 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-500",
                          )}
                        />
                        <span className="whitespace-nowrap truncate group-hover:translate-x-0.5 transition-transform duration-150">
                          {subLink.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Link
          className={cn(
            "flex items-center justify-start gap-3 group/sidebar py-2 px-3 rounded-lg transition-all duration-200",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            className,
          )}
          href={link.href || "#"}
          onClick={() => {
            if (window.innerWidth < 768) {
              setOpen(false);
            }
          }}
          {...props}
        >
          <div className="shrink-0">{link.icon}</div>
          <motion.span
            animate={{
              display: animate
                ? open
                  ? "inline-block"
                  : "none"
                : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className={cn(
              "text-neutral-700 dark:text-neutral-200 text-sm font-normal group-hover/sidebar:translate-x-0.5 transition-transform duration-150 whitespace-nowrap truncate",
              classNameLabel,
            )}
          >
            {link.label}
          </motion.span>
        </Link>
      )}
    </div>
  );
};
