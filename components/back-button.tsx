"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BackButton() {
  return (
    <Button
      className="flex items-center gap-2"
      variant="outline"
      onClick={() => window.history.back()}
    >
      <ArrowLeft />
      <span className="-mt-0.5">Go back</span>
    </Button>
  );
}
