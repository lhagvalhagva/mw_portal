"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { checklistAPI } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, MapPin, ClipboardList, ChevronRight, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface ChecklistJob {
  id: number;
  checklist_conf_id: [number, string] | boolean;
  branch_id: [number, string];
  date: string;
  state: string;
  summary: string | boolean;
}

interface ChecklistJobDetail extends ChecklistJob {
  json_data?: {
    columns?: { name: string; type: string }[];
    rows?: any[];
  };
  responsible_ids?: string[];
}

export function DepartmentChecklist() {
  const { t } = useLocale();
  const [jobs, setJobs] = useState<ChecklistJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail view state
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [jobDetail, setJobDetail] = useState<ChecklistJobDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const baseUrl = typeof window !== 'undefined' ? 
        (localStorage.getItem('odooBaseUrl') || localStorage.getItem('rememberMeBaseUrl')) : null;

      if (!baseUrl) {
        setLoading(false);
        return;
      }

      try {
        const response = await checklistAPI.getDepartmentList(baseUrl);
        if (response.success && Array.isArray(response.data)) {
          setJobs(response.data as ChecklistJob[]);
        }
      } catch (err) {
        setError("Мэдээлэл татахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleRowClick = async (jobId: number) => {
    setSelectedJobId(jobId);
    setDetailOpen(true);
    setDetailLoading(true);
    setJobDetail(null);

    const baseUrl = typeof window !== 'undefined' ? 
      (localStorage.getItem('odooBaseUrl') || localStorage.getItem('rememberMeBaseUrl')) : null;

    if (!baseUrl) {
      setDetailLoading(false);
      return;
    }

    try {
      const response = await checklistAPI.getDepartmentDetail(baseUrl, jobId);
      if (response.success) {
        setJobDetail(response.data as ChecklistJobDetail);
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const groupedByConfig = useMemo(() => {
    const groups: Record<number, { configName: string; configId: number; jobs: ChecklistJob[] }> = {};
    jobs.forEach((job) => {
      const configId = Array.isArray(job.checklist_conf_id) ? job.checklist_conf_id[0] : null;
      if (configId && typeof configId === 'number') {
        if (!groups[configId]) {
          groups[configId] = {
            configId,
            configName: Array.isArray(job.checklist_conf_id) ? job.checklist_conf_id[1] : String(configId),
            jobs: []
          };
        }
        groups[configId].jobs.push(job);
      }
    });
    return Object.values(groups);
  }, [jobs]);

  const getStateBadge = (state: string) => {
    const config: Record<string, { labelKey: string; class: string }> = {
      draft: { labelKey: 'state.draft', class: "bg-slate-100 text-slate-600 border-none" },
      sent: { labelKey: 'state.sent', class: "bg-blue-50 text-blue-600 border-none" },
      received: { labelKey: 'state.received', class: "bg-indigo-50 text-indigo-600 border-none" },
      inprogress: { labelKey: 'state.inprogress', class: "bg-amber-50 text-amber-600 border-none" },
      done: { labelKey: 'state.done', class: "bg-emerald-50 text-emerald-700 border-none" },
    };
    const s = config[state] || { labelKey: state, class: "bg-gray-100" };
    return <Badge className={`${s.class} font-medium px-2.5 py-0.5 whitespace-nowrap`}>{t(s.labelKey)}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <p className="text-sm text-muted-foreground animate-pulse">Ажлуудыг ачаалж байна...</p>
      </div>
    );
  }

  if (jobs.length === 0 && !error) return null;

  return (
    <>
      <Card className="border-none shadow-sm ring-1 ring-black/5 mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">{t('checklist.department.title')}</CardTitle>
              <CardDescription>{t('checklist.department.description')}</CardDescription>
            </div>
            <Badge variant="outline" className="h-fit">{t('checklist.detail.jobsCount', { count: jobs.length })}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="m-4 flex items-center gap-3 p-4 bg-destructive/5 text-destructive rounded-lg border border-destructive/10">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-y text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-3">{t('table.date')}</th>
                    <th className="px-6 py-3">{t('table.branch')}</th>
                    <th className="px-6 py-3">{t('table.type')}</th>
                    <th className="px-6 py-3">{t('table.state')}</th>
                    <th className="px-6 py-3 text-right">{t('table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {jobs.map((job) => (
                    <tr 
                      key={job.id} 
                      onClick={() => handleRowClick(job.id)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{job.date}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {Array.isArray(job.branch_id) ? job.branch_id[1] : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium italic text-slate-700">
                        {Array.isArray(job.checklist_conf_id) ? job.checklist_conf_id[1] : '-'}
                      </td>
                      <td className="px-6 py-4">{getStateBadge(job.state)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {groupedByConfig.length > 0 && (
        <Card className="border-none shadow-sm ring-1 ring-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold tracking-tight">{t('checklist.department.configChart')}</CardTitle>
            <CardDescription>{t('checklist.department.configChartDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {groupedByConfig.map((group) => (
                <div key={group.configId} className="p-4 hover:bg-muted/20 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{group.configName}</p>
                    <p className="text-sm text-muted-foreground">{t('checklist.detail.jobsCount', { count: group.jobs.length })}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href={`/dashboard/checklist-config-chart/${group.configId}`}>
                      <BarChart3 className="h-4 w-4" />
                      {t('checklist.department.viewChart')}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden gap-0 border-none shadow-2xl">
        {/* HEADER SECTION */}
        <DialogHeader className="px-6 py-5 bg-white border-b sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-slate-900">{t('checklist.detail.title')}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t('checklist.detail.id')}: #{selectedJobId}</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">{jobDetail?.date}</span>
              </div>
            </div>
            {jobDetail && (
              <div className="shadow-sm">
                {getStateBadge(jobDetail.state)}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* CONTENT SECTION */}
        {detailLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-100"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">{t('checklist.detail.loading')}</p>
          </div>
        ) : jobDetail ? (
          <div className="p-6 bg-slate-50/50 space-y-6 max-h-[65vh] overflow-y-auto">
            
            {/* 1. KEY INFO CARDS (Grid layout improved) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t('checklist.detail.branch')}</p>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {Array.isArray(jobDetail.branch_id) ? jobDetail.branch_id[1] : (jobDetail.branch_id || '-')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t('checklist.detail.config')}</p>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {Array.isArray(jobDetail.checklist_conf_id) ? jobDetail.checklist_conf_id[1] : (jobDetail.checklist_conf_id || '-')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. RESPONSIBLE PEOPLE (Avatar style) */}
            {jobDetail.responsible_ids && jobDetail.responsible_ids.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-3.5 w-3.5" /> {t('checklist.detail.responsible')}
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {jobDetail.responsible_ids.map((name, idx) => (
                      <div key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                        <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-700">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. SUMMARY (Quote style) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> {t('checklist.detail.summary')}
              </h4>
              <div className={`relative p-4 rounded-xl border border-l-4 shadow-sm ${
                typeof jobDetail.summary === 'string' && jobDetail.summary.length > 0
                  ? 'bg-white border-slate-100 border-l-primary'
                  : 'bg-slate-100/50 border-slate-200 border-l-slate-300'
              }`}>
                {typeof jobDetail.summary === 'string' && jobDetail.summary.length > 0 ? (
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{jobDetail.summary}"
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {t('checklist.detail.noSummary')}
                  </p>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
            <AlertCircle className="h-10 w-10 opacity-20" />
            <p>{t('checklist.detail.notFound')}</p>
          </div>
        )}

        {/* FOOTER SECTION */}
        <div className="p-4 bg-white border-t flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDetailOpen(false)} className="rounded-lg text-slate-500 hover:text-slate-900">
                {t('common.close')}
            </Button>
            <Button onClick={() => setDetailOpen(false)} className="rounded-lg px-6 shadow-lg shadow-primary/20">
                {t('checklist.detail.understood')}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}