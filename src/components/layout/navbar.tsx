"use client"

import React, { useState, useEffect } from "react";
import { UserNav } from "@/components/layout/user-nav";
import { AttendanceNav } from "@/components/layout/attendance-nav";
import { NotificationNav } from "@/components/layout/notification-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";

export function Navbar() {
  const { toggle } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <header className="h-16 border-b bg-white/60 dark:bg-card/60 backdrop-blur-xl" />;
  }

  return (
    <header className="h-16 border-b bg-white/60 dark:bg-card/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 border-white/20">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Sidebar Trigger - Зөвхөн гар утсанд */}
        <MobileSidebar />

        {/* Desktop Sidebar Trigger - Sidebar-ыг хураах/дэлгэх */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex hover:bg-white/20 transition-all active:scale-95"
          onClick={toggle}
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Хайлтын хэсэг - Зөвхөн таблет болон компьютер дээр харагдана */}
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Хайх..."
            className="pl-10 h-10 bg-white/20 dark:bg-white/5 border-white/10 dark:border-white/5 backdrop-blur-md rounded-xl focus-visible:ring-primary/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Баруун талын цэсүүд */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Ирц бүртгэл, Мэдэгдэл, Хэрэглэгчийн мэдээлэл */}
        <AttendanceNav />
        <NotificationNav />
        <UserNav />
      </div>
    </header>
  );
}