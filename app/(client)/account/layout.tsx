import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/navbar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-svh">
      <Navbar />
      <div className="pt-16 px-4 sm:px-8">
        <AppSidebar>
          <div className="lg:ml-10 py-5 pb-10 lg:pr-5">{children}</div>
        </AppSidebar>
      </div>
    </div>
  );
}
