import React, { Suspense } from "react";

import Loading from "@/components/loader/loading";

import Settings from "./_components/settings";

export default function page() {
  return (
    <Suspense fallback={<Loading />}>
      <Settings />
    </Suspense>
  );
}
