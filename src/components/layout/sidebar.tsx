// components/layout/sidebar.tsx
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Users, Settings, Package, 
  BarChart3, Calendar, ShieldCheck 
} from "lucide-react";

const routes = [
  { label: 'Хяналтын самбар', icon: LayoutDashboard, href: '/' },
  { label: 'Хүний нөөц', icon: Users, href: '/employees' },
  { label: 'Борлуулалт', icon: Package, href: '/sales' },
  { label: 'Тайлан', icon: BarChart3, href: '/reports' },
  { label: 'Хуанли', icon: Calendar, href: '/calendar' },
  { label: 'Тохиргоо', icon: Settings, href: '/settings' },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Logo хэсэг */}
      <div className="p-6 mb-2">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-black tracking-tight gradient-text">
            Managewall
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
              "flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group",
              pathname === route.href
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <route.icon className={cn(
              "h-5 w-5",
              pathname === route.href ? "text-white" : "group-hover:text-primary"
            )} />
            {route.label}
          </Link>
        ))}
      </div>

      {/* Sidebar-ын доод хэсэг (Support эсвэл Update) */}
      <div className="p-4 mt-auto">
        <div className="bg-muted/50 rounded-2xl p-4 border border-dashed border-primary/20">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Систем:</p>
          <p className="text-xs font-semibold">Хувилбар 2.0.4 (Beta)</p>
        </div>
      </div>
    </div>
  );
}