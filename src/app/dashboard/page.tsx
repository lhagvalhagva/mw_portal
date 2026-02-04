"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DepartmentChecklist } from "@/components/dashboard/DepartmentChecklist";
import { checklistAPI } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

interface DashboardStats {
  totalJobs: number;
  doneJobs: number;
  inProgressJobs: number;
  sentJobs: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    doneJobs: 0,
    inProgressJobs: 0,
    sentJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const baseUrl = typeof window !== 'undefined' ? 
        (localStorage.getItem('odooBaseUrl') || localStorage.getItem('rememberMeBaseUrl')) : null;

      if (!baseUrl) {
        setLoading(false);
        return;
      }

      try {
        const response = await checklistAPI.getDepartmentList(baseUrl);
        if (response.success && Array.isArray(response.data)) {
          const jobs = response.data as any[];
          const stats: DashboardStats = {
            totalJobs: jobs.length,
            doneJobs: jobs.filter((j: any) => j.state === 'done').length,
            inProgressJobs: jobs.filter((j: any) => j.state === 'inprogress').length,
            sentJobs: jobs.filter((j: any) => j.state === 'sent').length,
          };
          setStats(stats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      label: "Нийт ажил", 
      value: loading ? "..." : stats.totalJobs.toString(), 
      icon: ClipboardList, 
      color: "text-blue-500", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Дууссан", 
      value: loading ? "..." : stats.doneJobs.toString(), 
      icon: CheckCircle, 
      color: "text-green-500", 
      bg: "bg-green-50" 
    },
    { 
      label: "Хийгдэж буй", 
      value: loading ? "..." : stats.inProgressJobs.toString(), 
      icon: Clock, 
      color: "text-yellow-500", 
      bg: "bg-yellow-50" 
    },
    { 
      label: "Илгээсэн", 
      value: loading ? "..." : stats.sentJobs.toString(), 
      icon: AlertCircle, 
      color: "text-orange-500", 
      bg: "bg-orange-50" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Мэндчилгээ */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Өдрийн мэнд! 👋</h1>
        <p className="text-muted-foreground text-sm">Өнөөдрийн байдлаар системийн ерөнхий үзүүлэлтүүд ийм байна.</p>
      </div>

      {/* Статистик картууд */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.label} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {item.label}
              </CardTitle>
              <div className={cn("p-2 rounded-xl", item.bg)}>
                {loading ? (
                  <Loader2 className={cn("h-4 w-4 animate-spin", item.color)} />
                ) : (
                  <item.icon className={cn("h-4 w-4", item.color)} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Checklist section */}
      <div>
        <DepartmentChecklist />
      </div>
    </div>
  );
}