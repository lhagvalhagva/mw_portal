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

type JobDetailData = {
  checklist_conf_id?: string;
  branch_id?: string;
  date?: string;
  state?: string;
  summary?: string;
  json_data?: { columns?: { name: string; type: string }[]; rows?: unknown[]; __sent_sequences?: unknown[] };
  responsible_ids?: string[];
};

function getBaseUrl(): string {
  return typeof window !== "undefined" ? localStorage.getItem("rememberMeBaseUrl") || "" : "";
}

const STATE_LABELS_KEYS: Record<string, string> = {
  draft: "state.draft",
  sent: "state.sent",
  received: "checklist.list.received",
  inprogress: "checklist.list.inprogress",
  done: "checklist.list.done",
};

export default function InternalJobDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { isGroupUser, isLoading: authLoading } = useAuth(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JobDetailData | null>(null);
  const [summary, setSummary] = useState("");
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (!authLoading && !isGroupUser) router.replace("/dashboard");
  }, [isGroupUser, authLoading, router]);

  useEffect(() => {
    if (!id || !isGroupUser) return;
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      router.push("/dashboard/internal");
      return;
    }
    const tid = setTimeout(() => setLoading(true), 0);
    checklistAPI
      .getDepartmentDetail(baseUrl, id)
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data as JobDetailData;
          setData(d);
          setSummary(d.summary ?? "");
        } else {
          toast.error(t("checklist.detail.notFound"), { description: !res.success ? res.message : undefined });
          router.push("/dashboard/internal");
        }
      })
      .catch(() => {
        toast.error("Сүлжээний алдаа");
        router.push("/dashboard/internal");
      })
      .finally(() => setLoading(false));
    return () => clearTimeout(tid);
  }, [id, isGroupUser, router, t]);

  useEffect(() => {
    if (!isGroupUser) return;
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;
    checklistAPI.getChecklistUsers(baseUrl).then((res) => {
      if (res.success && res.data) setUsers((res.data as { id: number; name: string }[]) ?? []);
    });
  }, [isGroupUser]);

  const handleUpdate = async (newData: { rows?: unknown[] }, status: "inprogress" | "done") => {
    if (!data) return;
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;
    const currentJson = data.json_data ?? { columns: [], rows: [] };
    const payload = {
      json_data: {
        columns: currentJson.columns,
        rows: newData.rows ?? currentJson.rows ?? [],
        __sent_sequences: currentJson.__sent_sequences,
      },
      summary,
      ...(status === "done" && { state: "done" }),
    };
    try {
      const res = await checklistAPI.updateDepartmentJob(baseUrl, id, payload);
      if (res.success && res.data) {
        const rd = res.data as { state?: string; json_data?: JobDetailData["json_data"] };
        toast.success(status === "done" ? t("checklist.detail.understood") : "Хадгалагдлаа");
        setData((prev) => (prev ? { ...prev, state: rd.state ?? prev.state, json_data: rd.json_data ?? prev.json_data } : prev));
        if (status === "done") router.push("/dashboard/internal");
      } else {
        toast.error("Алдаа", { description: !res.success ? res.message : undefined });
      }
    } catch {
      toast.error("Хадгалахад алдаа гарлаа");
    }
  };

  const handleSendRows = async (rowIndices: number[], userIds: number[]) => {
    if (!data) return;
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;
    const res = await checklistAPI.sendRowTask(baseUrl, id, rowIndices, userIds);
    if (res.success && res.data) {
      const rd = res.data as { json_data?: JobDetailData["json_data"]; responsible_ids?: string[] };
      setData((prev) => (prev ? { ...prev, json_data: rd.json_data ?? prev.json_data, responsible_ids: rd.responsible_ids ?? prev.responsible_ids } : prev));
      toast.success(t("checklist.send.success"), { description: res.message });
    } else {
      toast.error(res.message ?? "Илгээхэд алдаа гарлаа");
      throw new Error(res.message);
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
  const stateLabel = (s: string) => (STATE_LABELS_KEYS[s] ? t(STATE_LABELS_KEYS[s]) : s);

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
            <span className="font-medium">{stateLabel(data.state ?? "")}</span>
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
          showSendRows={isGroupUser && !isReadOnly}
          users={users}
          onSendRows={handleSendRows}
        />
      ) : (
        <Card className="border-none shadow-sm">
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm text-center">{t("internal.tableEmpty")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
