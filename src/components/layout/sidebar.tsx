// components/layout/sidebar.tsx
"use client"

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Settings, Package,
  BarChart3, Calendar
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/hooks/useAuth";

const routeKeys: { key: string; icon: typeof LayoutDashboard; href: string; showOnlyForGroupUser?: boolean }[] = [
  { key: 'sidebar.dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'sidebar.checklist', icon: Calendar, href: '/checklist' },
  { key: 'sidebar.internal', icon: Users, href: '/dashboard/internal', showOnlyForGroupUser: true },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isOpen } = useSidebar();
  const { t } = useLocale();
  const { isGroupUser } = useAuth(false);
  const visibleRoutes = routeKeys.filter(r => !r.showOnlyForGroupUser || isGroupUser);
  const routes = visibleRoutes.map(r => ({ ...r, label: t(r.key) }));

  return (
    <div className={cn("flex flex-col h-full transition-all duration-300", isOpen ? "w-72" : "w-[70px]", className)}>
      {/* Logo хэсэг */}
      <div className={cn("p-6 mb-2 flex items-center", !isOpen && "px-4 justify-center")}>
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0">
            <Image 
              src="/assets/images/ayan_logo.png" 
              alt="Ayan Logo" 
              width={24} 
              height={24} 
              className="h-8 w-8 object-contain"
            />
          </div>
          <span className={cn("text-xl font-black tracking-tight gradient-text whitespace-nowrap transition-all duration-300",
            !isOpen && "opacity-0 w-0 hidden"
          )}>
            Ayan Hotel
          </span>
        </Link>
      </div>

      {/* Цэснүүд */}
      <div className="flex-1 px-4 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group relative",
              pathname === route.href
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              !isOpen && "justify-center px-2"
            )}
            title={!isOpen ? route.label : undefined}
          >
            <route.icon className={cn(
              "h-5 w-5 flex-shrink-0",
              pathname === route.href ? "text-white" : "group-hover:text-primary"
            )} />
            <span className={cn("whitespace-nowrap transition-all duration-300", !isOpen && "hidden w-0 opacity-0")}>
              {route.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Sidebar-ын доод хэсэг */}
      <div className={cn("p-4 mt-auto", !isOpen && "hidden")}>
        <div className="bg-muted/50 rounded-2xl p-4 border border-dashed border-primary/20 content-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('sidebar.system')}</p>
          <p className="text-xs font-semibold">{t('sidebar.version')}</p>
        </div>
      </div>
    </div>
  );
}