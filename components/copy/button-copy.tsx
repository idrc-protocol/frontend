"use client";

import React, { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function ButtonCopy({
  text = "Hello world!",
  iconSize = 4,
  className,
}: {
  text?: string;
  iconSize?: number;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              `w-${iconSize} h-${iconSize} cursor-pointer flex items-center justify-center`,
              className,
            )}
            onClick={handleCopy}
          >
            {copied ? (
              <CopyCheck className={`w-${iconSize} h-${iconSize}`} />
            ) : (
              <Copy className={`w-${iconSize} h-${iconSize}`} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="w-auto max-w-xs whitespace-normal break-words text-left inline-block"
          side="top"
        >
          <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
