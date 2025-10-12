"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/fallback-image";

export default function OnboardSuccess() {
  const router = useRouter();

  const handleExplore = () => {
    router.push("/explore");
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-md">
      <div className="flex flex-col gap-5">
        <span className="text-black text-2xl font-semibold text-center">
          Onboarding Complete!
        </span>

        <div className="flex flex-col gap-5">
          <p className="text-sm text-center">
            Congratulations! You&apos;ve successfully completed the onboarding
            process. Your identity has been verified and your wallet has been
            added.
          </p>

          <div className="w-full flex items-center justify-center">
            <FallbackImage
              alt={"Success Image"}
              className="w-36 h-auto"
              height={500}
              src={"/images/icons/card-with-check.webp"}
              width={700}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-5">
          <Button
            className="flex-1 text-md font-semibold py-5"
            variant="purple"
            onClick={handleExplore}
          >
            Explore Market
          </Button>

          <Button
            className="flex-1 text-md font-semibold py-5"
            variant="outline"
            onClick={() => router.push("/account/overview")}
          >
            Go to Account
          </Button>
        </div>
      </div>

      <p className="text-sm text-center mt-2">
        Get assistance via{" "}
        <Link
          className="underline"
          href="mailto:support@idrc.site"
          target="_blank"
        >
          support@idrc.site
        </Link>
      </p>
    </div>
  );
}
