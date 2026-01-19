// app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FF] dark:bg-background">
      {/* Sidebar - Зүүн талд */}
      <Sidebar className="hidden md:flex w-72 flex-shrink-0 border-r bg-white dark:bg-card" />
      
      {/* Үндсэн хэсэг */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}