// components/layout/mobile-sidebar.tsx
"use client"

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors">
          <Menu className="h-6 w-6 text-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 border-none">
        <Sidebar className="w-full" />
      </SheetContent>
    </Sheet>
  );
}