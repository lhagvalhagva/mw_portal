// checklist/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { checklistAPI } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLocale } from "@/contexts/LocaleContext";

interface ChecklistJob {
  id: number;
  checklist_conf_id: number | [number, string];
  branch_id: number | [number, string];
  date: string;
  state: string;
  summary: string;
}

const statusStyles: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  sent: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  received: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  inprogress: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  done: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
};

function JobCard({
  job,
  t,
  onClick,
}: {
  job: ChecklistJob;
  t: (key: string) => string;
  onClick: () => void;
}) {
  const confName = Array.isArray(job.checklist_conf_id) ? job.checklist_conf_id[1] : `#${job.checklist_conf_id ?? job.id}`;
  const isDraft = job.state === "draft";
  const stateColor = statusStyles[job.state] || "bg-gray-100 text-gray-800";

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] group border-l-4 ${isDraft ? "border-l-amber-500 border-y-amber-200/50 border-r-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-500/50" : "border-l-transparent hover:border-l-primary"}`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {confName}
          </h4>
        </div>
        {job.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded-md italic">
            {job.summary}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${stateColor}`}>
            {t(`state.${job.state}`) || job.state}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChecklistListPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [jobs, setJobs] = useState<ChecklistJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const baseUrl = localStorage.getItem("rememberMeBaseUrl") || "";
        if (!baseUrl) return;
        const response = await checklistAPI.getList(baseUrl);
        if (response.success && response.data) {
          setJobs(response.data as ChecklistJob[]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const groupedJobs = useMemo(() => {
    const groups: Record<string, ChecklistJob[]> = {};
    jobs.forEach((job) => {
      const d = job.date || "";
      if (!groups[d]) groups[d] = [];
      groups[d].push(job);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4 p-6">
      <div className="shrink-0">
        <h2 className="text-3xl font-bold tracking-tight gradient-text">{t("checklist.list.title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("checklist.list.description")}</p>
      </div>

      <div className="flex-1 min-h-0">
        {jobs.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            {t("checklist.list.empty")}
          </div>
        ) : (
          <ScrollArea className="h-full w-full rounded-md border bg-muted/20">
            <div className="flex gap-4 p-4 min-w-max">
              {groupedJobs.map(([date, dateJobs]) => (
                <div key={date} className="w-[320px] shrink-0 flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-1 sticky top-0 z-10">
                    <Badge variant="outline" className="bg-background text-sm py-1 px-3 shadow-sm font-medium">
                      <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                      {date}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">({dateJobs.length})</span>
                  </div>
                  <div className="flex flex-col gap-3 pb-4">
                    {dateJobs.map((job) => (
                      <JobCard key={job.id} job={job} t={t} onClick={() => router.push(`/checklist/${job.id}`)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
