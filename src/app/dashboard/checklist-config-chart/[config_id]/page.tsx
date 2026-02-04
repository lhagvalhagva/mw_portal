"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { checklistAPI } from "@/lib/apiClient";
import DepartmentChecklistChartWidget from "@/components/dashboard/DepartmentChecklistChart";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChecklistConfigChartPage() {
  const params = useParams();
  const configId = Number(params?.config_id ?? 0);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const url = localStorage.getItem("odooBaseUrl") || localStorage.getItem("rememberMeBaseUrl");
    setBaseUrl(url);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Ачаалж байна...</p>
      </div>
    );
  }

  if (!baseUrl) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-muted-foreground">Нэвтрээгүй байна. График харахын тулд эхлээд нэвтрэнэ үү.</p>
        <Button asChild variant="outline">
          <Link href="/auth/login">Нэвтрэх</Link>
        </Button>
      </div>
    );
  }

  if (!configId || Number.isNaN(configId)) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-destructive">Тохиргооны ID буруу байна.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Буцах</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Буцах</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Тохиргооны график</h1>
          <p className="text-sm text-muted-foreground">Тохиргоо #{configId} — бүх ажлуудын нэгтгэсэн график</p>
        </div>
      </div>

      <DepartmentChecklistChartWidget
        baseUrl={baseUrl}
        configId={configId}
        getDepartmentConfigChart={checklistAPI.getDepartmentConfigChart}
      />
    </div>
  );
}
