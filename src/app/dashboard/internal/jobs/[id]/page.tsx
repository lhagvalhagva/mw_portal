"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { checklistAPI } from "@/lib/apiClient";
import { DynamicTable } from "@/components/checklist/dynamic-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/hooks/useAuth";

export default function InternalJobDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { isGroupUser, isLoading: authLoading } = useAuth(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    checklist_conf_id?: string;
    branch_id?: string;
    date?: string;
    state?: string;
    summary?: string;
    json_data?: { columns?: { name: string; type: string }[]; rows?: unknown[] };
    responsible_ids?: string[];
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!authLoading && !isGroupUser) {
      router.replace("/dashboard");
      return;
    }
  }, [isGroupUser, authLoading, router]);

  useEffect(() => {
    if (!id || !isGroupUser) return;
    const baseUrl = localStorage.getItem("rememberMeBaseUrl") || "";
    if (!baseUrl) {
      router.push("/dashboard/internal");
      return;
    }
    setLoading(true);
    checklistAPI
      .getDepartmentDetail(baseUrl, id)
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data as { summary?: string; [k: string]: unknown };
          setData(res.data as any);
          setSummary((d.summary as string) ?? "");
        } else {
          toast.error(t("checklist.detail.notFound"), { description: res.message });
          router.push("/dashboard/internal");
        }
      })
      .catch(() => {
        toast.error("Сүлжээний алдаа");
        router.push("/dashboard/internal");
      })
      .finally(() => setLoading(false));
  }, [id, isGroupUser, router, t]);

  const handleUpdate = async (newData: { rows?: unknown[] }, status: "inprogress" | "done") => {
    if (!data) return;
    setSaving(true);
    const baseUrl = localStorage.getItem("rememberMeBaseUrl") || "";
    if (!baseUrl) {
      setSaving(false);
      return;
    }
    try {
      const currentJson = data.json_data || { columns: [], rows: [] };
      const payload = {
        json_data: {
          columns: currentJson.columns,
          rows: newData.rows ?? currentJson.rows ?? [],
          __sent_sequences: (currentJson as { __sent_sequences?: unknown[] }).__sent_sequences,
        },
        summary,
        ...(status === "done" && { state: "done" }),
      };
      const response = await checklistAPI.updateDepartmentJob(baseUrl, id, payload);
      if (response.success) {
        const resData = response.data as { state?: string; json_data?: typeof data.json_data };
        toast.success(status === "done" ? t("checklist.detail.understood") : "Хадгалагдлаа");
        setData((prev) => (prev ? { ...prev, state: resData.state ?? prev.state, json_data: resData.json_data ?? prev.json_data } : prev));
        if (status === "done") router.push("/dashboard/internal");
      } else {
        toast.error("Алдаа", { description: response.message });
      }
    } catch {
      toast.error("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isGroupUser) return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!data) return null;

  const isReadOnly = data.state === "done" || data.state === "cancel";
  const stateLabels: Record<string, string> = {
    draft: t("state.draft"),
    sent: t("state.sent"),
    received: t("checklist.list.received"),
    inprogress: t("checklist.list.inprogress"),
    done: t("checklist.list.done"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/internal")}
          aria-label={t("aria.goBack")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">{data.checklist_conf_id}</h1>
          <p className="text-muted-foreground text-sm">
            {t("checklist.detail.id")}: #{id}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("internal.jobInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{t("checklist.detail.branch")}:</span>
            <span className="font-medium">{data.branch_id ?? "–"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{t("table.date")}:</span>
            <span className="font-medium">{data.date ?? "–"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("table.state")}:</span>
            <span className="font-medium">{stateLabels[data.state ?? ""] ?? data.state}</span>
          </div>
          {data.responsible_ids && data.responsible_ids.length > 0 && (
            <div className="flex items-start gap-2 text-sm sm:col-span-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-muted-foreground">{t("checklist.detail.responsible")}: </span>
                <span className="font-medium">{data.responsible_ids.join(", ")}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("checklist.detail.summary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            disabled={isReadOnly}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t("checklist.detail.noSummary")}
          />
        </CardContent>
      </Card>

      {data.json_data?.columns && data.json_data.columns.length > 0 ? (
        <DynamicTable
          initialData={{
            columns: data.json_data.columns,
            rows: data.json_data?.rows ?? [],
          }}
          onSave={(rows) => handleUpdate({ rows }, "inprogress")}
          onSubmit={(rows) => handleUpdate({ rows }, "done")}
          readOnly={isReadOnly}
          showRowMeta
        />
      ) : (
        <Card className="border-none shadow-sm">
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm text-center">
              {t("internal.tableEmpty")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
