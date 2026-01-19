// components/layout/navbar.tsx
"use client"

import { UserNav } from "@/components/layout/user-nav";
import { AttendanceNav } from "@/components/layout/attendance-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="h-16 border-b bg-white/80 dark:bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Sidebar Trigger - Зөвхөн жижиг дэлгэцэнд */}
        <MobileSidebar />
        {/* Хайлтын хэсэг - Том дэлгэцэнд */}
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Хайх..." 
            className="pl-10 h-10 bg-muted/50 border-none rounded-xl focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <AttendanceNav />
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-destructive rounded-full border-2 border-white" />
        </Button>
        <UserNav />
      </div>
    </header>
  );
}