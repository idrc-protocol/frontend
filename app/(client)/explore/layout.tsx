import Navbar from "@/components/navbar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-svh">
      <Navbar />
      <div className="pt-16 px-10">{children}</div>
    </div>
  );
}
