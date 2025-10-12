"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-black text-black bg-gray-200/10 shadow-xs hover:bg-gray-200/80 hover:text-accent-foreground dark:bg-input/10 dark:border-neutral-400 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "relative w-48 h-48 px-4 py-6 rounded-full bg-gradient-to-b from-[#363B49] to-black text-white hover:from-[#4f5669] hover:to-black/90 transition duration-200 shadow-[inset_0_0_5px_4px_rgba(125,131,147,0.6),inset_0_0_0_1px_#7d8393] border-2 border-black after:content-[''] after:absolute after:inset-0 after:rounded-inherit after:bg-[radial-gradient(ellipse_50%_60%_at_bottom,rgba(0,123,255,0.35)_20%,transparent_100%)] after:pointer-events-none",
        gradientSecondary:
          "relative w-48 h-48 px-4 py-6 rounded-full bg-gradient-to-b from-[#363B49] to-black text-white hover:from-[#4f5669] hover:to-black/90 transition duration-200 shadow-[inset_0_0_5px_4px_rgba(125,131,147,0.6),inset_0_0_0_1px_#7d8393] border-2 border-black after:content-[''] after:absolute after:inset-0 after:rounded-inherit after:bg-[radial-gradient(ellipse_50%_60%_at_bottom,rgba(0,255,123,0.35)_20%,transparent_100%)] after:pointer-events-none",
        gradientDisabled:
          "relative w-48 h-48 px-4 py-6 rounded-full bg-gradient-to-b from-[#363B49] to-black text-white hover:from-[#4f5669] hover:to-black/90 transition duration-200 shadow-[inset_0_0_5px_4px_rgba(125,131,147,0.6),inset_0_0_0_1px_#7d8393] border-2 border-black after:content-[''] after:absolute after:inset-0 after:rounded-inherit after:bg-[radial-gradient(ellipse_50%_60%_at_bottom,rgba(128,128,128,0.35)_20%,transparent_100%)] after:pointer-events-none",
        purple:
          "bg-purple-700 text-primary-foreground shadow-xs hover:bg-purple-700/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  const hasIcon = React.Children.toArray(children).some(
    (child: any) => React.isValidElement(child) && child.type === "svg",
  );

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size }),
        hasIcon && size === "default" && "px-3",
        className,
      )}
      data-slot="button"
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
