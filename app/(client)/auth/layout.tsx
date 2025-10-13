import FallbackImage from "@/components/fallback-image";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-svh w-full bg-background">
      <div className="lg:hidden block relative h-[20vh] lg:h-full w-full">
        <FallbackImage
          fill
          priority
          alt="Authentication Background"
          className="object-cover object-center lg:hidden block"
          sizes="50vw"
          src="/images/background/auth.webp"
        />
      </div>
      {children}
      <div className="hidden lg:block relative h-[20vh] lg:h-full w-full p-5 rounded-2xl overflow-hidden">
        <FallbackImage
          priority
          alt="Authentication Background"
          className="w-full h-full object-contain hidden lg:block"
          height={1920}
          sizes="50vw"
          src="/images/background/auth.webp"
          width={1000}
        />
      </div>
    </div>
  );
}
