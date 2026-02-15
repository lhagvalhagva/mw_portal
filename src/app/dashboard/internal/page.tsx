"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, MapPin, ChevronRight, ChevronLeft, Loader2, Plus, 
  Calendar, User, LayoutGrid, Check, History 
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

import { checklistAPI } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

// --- Constants & Types ---
const STORAGE_KEYS = { dept: "int_dept", branch: "int_branch" };

const STATUS_CONFIG: Record<string, { border: string, badge: string }> = {
  draft: { border: "border-amber-500", badge: "bg-amber-100 text-amber-800" },
  sent: { border: "border-blue-500", badge: "bg-blue-100 text-blue-800" },
  received: { border: "border-purple-500", badge: "bg-purple-100 text-purple-800" },
  inprogress: { border: "border-indigo-500", badge: "bg-indigo-100 text-indigo-800" },
  done: { border: "border-emerald-500", badge: "bg-emerald-100 text-emerald-800" },
};

type Item = { id: number; name: string };
interface ChecklistJob {
  id: number;
  checklist_conf_id: number | [number, string];
  branch_id: number | [number, string];
  date: string;
  state: keyof typeof STATUS_CONFIG;
  summary: string;
}

export default function InternalPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { isGroupUser, isLoading: authLoading } = useAuth(false);
  const baseUrl = typeof window !== "undefined" ? localStorage.getItem("rememberMeBaseUrl") : null;

  const [state, setState] = useState({
    depts: [] as Item[],
    branches: [] as Item[],
    jobs: [] as ChecklistJob[],
    selectedDept: null as Item | null,
    selectedBranch: null as Item | null,
    loading: true,
    createOpen: false
  });

  // Redirect logic
  useEffect(() => {
    if (!authLoading && !isGroupUser) router.replace("/dashboard");
  }, [isGroupUser, authLoading, router]);

  // Data Fetching
  const fetchData = useCallback(async () => {
    if (!isGroupUser || !baseUrl) return;
    setState(s => ({ ...s, loading: true }));

    try {
      if (!state.selectedDept) {
        const res = await checklistAPI.getMyDepartments(baseUrl);
        if (res.success) setState(s => ({ ...s, depts: res.data as Item[], loading: false }));
      } else if (!state.selectedBranch) {
        const res = await checklistAPI.getDepartmentBranches(baseUrl, state.selectedDept.id);
        if (res.success) setState(s => ({ ...s, branches: res.data as Item[], loading: false }));
      } else {
        const res = await checklistAPI.getBranchJobs(baseUrl, state.selectedBranch.id);
        if (res.success) setState(s => ({ ...s, jobs: res.data as ChecklistJob[], loading: false }));
      }
    } catch (err) {
      toast.error("Мэдээлэл авахад алдаа гарлаа");
      setState(s => ({ ...s, loading: false }));
    }
  }, [isGroupUser, baseUrl, state.selectedDept, state.selectedBranch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Grouping Jobs
  const groupedJobs = useMemo(() => {
    const groups: Record<string, ChecklistJob[]> = {};
    state.jobs.forEach(j => (groups[j.date] = [...(groups[j.date] || []), j]));
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [state.jobs]);

  const handleBack = () => {
    if (state.selectedBranch) setState(s => ({ ...s, selectedBranch: null, jobs: [] }));
    else if (state.selectedDept) setState(s => ({ ...s, selectedDept: null, branches: [] }));
  };

  const goToJob = (jobId: number) => {
    sessionStorage.setItem(STORAGE_KEYS.dept, JSON.stringify(state.selectedDept));
    sessionStorage.setItem(STORAGE_KEYS.branch, JSON.stringify(state.selectedBranch));
    router.push(`/dashboard/internal/jobs/${jobId}`);
  };

  if (authLoading || !isGroupUser) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4 bg-muted/5 p-2 rounded-lg relative">
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px] z-50 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Navigation Header */}
      <header className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-1">
          {state.selectedDept && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <nav className="flex items-center text-sm font-medium">
            <NavBadge active={!state.selectedDept} label={t("internal.myDepartment")} icon={<LayoutGrid className="h-4 w-4" />} />
            {state.selectedDept && (
              <>
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/40" />
                <NavBadge active={!state.selectedBranch} label={state.selectedDept.name} icon={<Building2 className="h-4 w-4" />} />
              </>
            )}
            {state.selectedBranch && (
              <>
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/40" />
                <NavBadge active label={state.selectedBranch.name} icon={<MapPin className="h-4 w-4" />} />
              </>
            )}
          </nav>
        </div>
        {state.selectedBranch && (
          <Button onClick={() => setState(s => ({ ...s, createOpen: true }))} size="sm">
            <Plus className="h-4 w-4 mr-2" /> {t("internal.create.newJob")}
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0">
        {!state.selectedDept || !state.selectedBranch ? (
          <SelectionGrid 
            items={!state.selectedDept ? state.depts : state.branches} 
            type={!state.selectedDept ? 'dept' : 'branch'}
            onSelect={(item) => setState(s => ({ ...s, [!s.selectedDept ? 'selectedDept' : 'selectedBranch']: item }))}
          />
        ) : (
          <ScrollArea className="h-full rounded-xl border bg-muted/10 shadow-inner">
            <div className="flex gap-6 p-6 min-w-max h-full">
              {groupedJobs.length === 0 ? <EmptyState t={t} /> : groupedJobs.map(([date, items]) => (
                <div key={date} className="w-[320px] shrink-0 space-y-4">
                  <div className="flex items-center justify-between sticky top-0 z-10">
                    <div className="bg-background border shadow-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {date}
                    </div>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {items.map(job => <JobCard key={job.id} job={job} t={t} onClick={() => goToJob(job.id)} />)}
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
          </ScrollArea>
        )}
      </main>

      {state.selectedBranch && baseUrl && (
        <CreateJobDialog 
          open={state.createOpen} 
          onOpenChange={(v: boolean) => setState(s => ({ ...s, createOpen: v }))}
          branch={state.selectedBranch}
          baseUrl={baseUrl}
          onSuccess={(job: ChecklistJob) => {
            setState(s => ({ ...s, jobs: [job, ...s.jobs] }));
            goToJob(job.id);
          }}
          t={t}
        />
      )}
    </div>
  );
}

// --- Reusable Sub-components ---

const NavBadge = ({ active, label, icon }: { active: boolean, label: string, icon: React.ReactNode }) => (
  <span className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md transition-all", active ? "font-bold text-primary bg-primary/10" : "text-muted-foreground")}>
    {icon} {label}
  </span>
);

const SelectionGrid = ({ items, type, onSelect }: { items: Item[], type: 'dept' | 'branch', onSelect: (i: Item) => void }) => (
  <ScrollArea className="h-full p-2">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item)} className="group flex items-center gap-4 p-5 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98]">
          <div className={cn("p-3 rounded-lg shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors", type === 'dept' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600")}>
            {type === 'dept' ? <Building2 /> : <MapPin />}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground font-mono opacity-70">ID: {item.id}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary" />
        </button>
      ))}
    </div>
  </ScrollArea>
);

const JobCard = ({ job, t, onClick }: { job: ChecklistJob, t: any, onClick: () => void }) => {
  const confName = Array.isArray(job.checklist_conf_id) ? job.checklist_conf_id[1] : `Config #${job.checklist_conf_id}`;
  const styles = STATUS_CONFIG[job.state] || STATUS_CONFIG.draft;
  return (
    <Card onClick={onClick} className={cn("group cursor-pointer shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden border-t-0 border-b-0 border-r-0 border-l-4", styles.border)}>
      <CardContent className="p-4 space-y-3">
        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">{confName}</h4>
        {job.summary && <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-md italic">{job.summary}</p>}
        <div className="flex items-center justify-between pt-2 border-t border-dashed">
          <Badge variant="outline" className={cn("text-[10px] uppercase font-bold border-none", styles.badge)}>{t(`state.${job.state}`)}</Badge>
          <span className="text-[10px] text-muted-foreground font-mono">#{job.id}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ t }: { t: any }) => (
  <div className="w-full flex flex-col items-center justify-center text-muted-foreground/50 gap-4 mt-20">
    <History className="h-12 w-12 opacity-20" />
    <p>{t("internal.noJobs")}</p>
  </div>
);

// --- Create Dialog ---

function CreateJobDialog({ open, onOpenChange, branch, baseUrl, onSuccess, t }: any) {
  const [data, setData] = useState({ configs: [] as Item[], users: [] as Item[] });
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), configId: "", summary: "", responsibleIds: [] as number[], searchUser: "", loading: false });

  useEffect(() => {
    if (!open) return;
    Promise.all([
      checklistAPI.getBranchConfigs(baseUrl, branch.id),
      checklistAPI.getChecklistUsers(baseUrl)
    ]).then(([c, u]) => setData({
      configs: (c.success ? c.data : []) as Item[],
      users: (u.success ? u.data : []) as Item[]
    }));
  }, [open, branch.id, baseUrl]);

  const handleSubmit = async () => {
    if (!form.configId) return toast.error(t("internal.create.configRequired"));
    setForm(f => ({ ...f, loading: true }));
    try {
      const res = await checklistAPI.createJob(baseUrl, {
        branch_id: branch.id,
        date: form.date,
        checklist_conf_id: Number(form.configId),
        summary: form.summary || undefined,
        responsible_user_ids: form.responsibleIds.length ? form.responsibleIds : undefined,
      });
      if (res.success) {
        toast.success(t("internal.create.success"));
        onOpenChange(false);
        onSuccess({ id: (res.data as { id: number }).id, checklist_conf_id: Number(form.configId), branch_id: branch.id, date: form.date, state: "draft", summary: form.summary });
      } else toast.error(res.message);
    } catch { toast.error(t("internal.create.error")); }
    finally { setForm(f => ({ ...f, loading: false })); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/10">
          <DialogTitle>{t("internal.create.title")}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {branch.name}</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">{t("internal.create.date")}</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">{t("internal.create.config")}</Label>
              <Select onValueChange={v => setForm(f => ({ ...f, configId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="z-[110] bg-white dark:bg-slate-950 !opacity-100 shadow-xl border border-border">{data.configs.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">{t("internal.create.responsible")} ({form.responsibleIds.length})</Label>
            <div className="border rounded-lg overflow-hidden">
              <Input placeholder="Search user..." className="h-8 border-none bg-muted/20 rounded-none" onChange={e => setForm(f => ({ ...f, searchUser: e.target.value }))} />
              <ScrollArea className="h-32 p-2">
                {data.users.filter(u => u.name.toLowerCase().includes(form.searchUser.toLowerCase())).map(u => {
                  const isChecked = form.responsibleIds.includes(u.id);
                  return (
                    <div key={u.id} className={cn("flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors", isChecked ? "bg-primary/10 text-primary" : "hover:bg-muted")} onClick={() => setForm(f => ({ ...f, responsibleIds: isChecked ? f.responsibleIds.filter(id => id !== u.id) : [...f.responsibleIds, u.id] }))}>
                      <div className={cn("w-4 h-4 rounded border flex items-center justify-center", isChecked ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                        {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="text-sm truncate"><User className="inline h-3 w-3 mr-1" />{u.name}</span>
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">{t("internal.create.summary")}</Label>
            <Textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="..." className="h-20" />
          </div>
        </div>
        <DialogFooter className="p-4 bg-muted/10 border-t sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={form.loading}>{t("internal.create.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={form.loading}>{form.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t("internal.create.submit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}