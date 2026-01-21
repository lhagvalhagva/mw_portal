
// checklist/layout.tsx
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function ChecklistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F8F9FF] dark:bg-background">
            {/* Sidebar */}
            <Sidebar className="hidden md:flex flex-shrink-0 border-r bg-white dark:bg-card" />

            {/* Main Content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
