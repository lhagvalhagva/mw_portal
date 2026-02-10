"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, ChevronRight, ChevronLeft, Loader2, Plus, Calendar } from "lucide-react";
import { checklistAPI } from "@/lib/apiClient";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// --- Types ---
type Dept = { id: number; name: string };
type Branch = { id: number; name: string };
type Config = { id: number; name: string };
type UserItem = { id: number; name: string };

interface ChecklistJob {
  id: number;
  checklist_conf_id: number | [number, string];
  branch_id: number | [number, string];
  date: string;
  state: "draft" | "sent" | "received" | "inprogress" | "done";
  summary: string;
}

// --- Helpers ---
const statusStyles: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  sent: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  received: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  inprogress: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  done: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
};

// --- Main Component ---
export default function InternalPage() {
  const { t } = useLocale();
  const { isGroupUser, isLoading: authLoading } = useAuth(false);
  const router = useRouter();
  const baseUrl = typeof window !== "undefined" ? localStorage.getItem("rememberMeBaseUrl") : null;

  // Data State
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [jobs, setJobs] = useState<ChecklistJob[]>([]);
  
  // Selection State
  const [selectedDept, setSelectedDept] = useState<Dept | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const STORAGE_KEYS = { dept: "internal_selected_dept", branch: "internal_selected_branch" };

  // --- Effects ---
  useEffect(() => {
    if (!authLoading && !isGroupUser) router.replace("/dashboard");
  }, [isGroupUser, authLoading, router]);

  // Restore branch when returning from job detail
  useEffect(() => {
    if (!isGroupUser || departments.length === 0) return;
    try {
      const savedDept = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEYS.dept) : null;
      const savedBranch = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEYS.branch) : null;
      if (savedDept && savedBranch) {
        const dept = JSON.parse(savedDept) as Dept;
        const branch = JSON.parse(savedBranch) as Branch;
        if (dept?.id && branch?.id) {
          setSelectedDept(dept);
          setSelectedBranch(branch);
        }
        sessionStorage.removeItem(STORAGE_KEYS.dept);
        sessionStorage.removeItem(STORAGE_KEYS.branch);
      }
    } catch (_) {}
  }, [isGroupUser, departments.length]);

  // Initial Load (Departments)
  useEffect(() => {
    if (!isGroupUser || !baseUrl) return;
    setLoading(true);
    checklistAPI.getMyDepartments(baseUrl)
      .then((res) => res.success && Array.isArray(res.data) && setDepartments(res.data))
      .finally(() => setLoading(false));
  }, [isGroupUser, baseUrl]);

  // Load Branches
  useEffect(() => {
    if (!selectedDept || !baseUrl) {
      setBranches([]);
      return;
    }
    setLoading(true);
    checklistAPI.getDepartmentBranches(baseUrl, selectedDept.id)
      .then((res) => res.success && Array.isArray(res.data) && setBranches(res.data))
      .finally(() => setLoading(false));
  }, [selectedDept, baseUrl]);

  // Load Jobs
  useEffect(() => {
    if (!selectedBranch || !baseUrl) {
      setJobs([]);
      return;
    }
    setLoading(true);
    checklistAPI.getBranchJobs(baseUrl, selectedBranch.id)
      .then((res) => res.success && Array.isArray(res.data) && setJobs(res.data as ChecklistJob[]))
      .finally(() => setLoading(false));
  }, [selectedBranch, baseUrl]);

  // --- Derived State (Kanban Grouping) ---
  const groupedJobs = useMemo(() => {
    const groups: Record<string, ChecklistJob[]> = {};
    jobs.forEach((job) => {
      if (!groups[job.date]) groups[job.date] = [];
      groups[job.date].push(job);
    });
    // Sort dates descending (newest first)
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [jobs]);

  // --- Handlers ---
  const handleBack = () => {
    if (selectedBranch) {
      setSelectedBranch(null);
      setJobs([]);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEYS.dept);
        sessionStorage.removeItem(STORAGE_KEYS.branch);
      }
    } else if (selectedDept) {
      setSelectedDept(null);
      setBranches([]);
    }
  };

  const goToJob = (jobId: number) => {
    if (selectedDept && selectedBranch && typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEYS.dept, JSON.stringify(selectedDept));
      sessionStorage.setItem(STORAGE_KEYS.branch, JSON.stringify(selectedBranch));
    }
    router.push(`/dashboard/internal/jobs/${jobId}`);
  };

  const handleJobCreated = (newJob: ChecklistJob) => {
    setJobs((prev) => [newJob, ...prev]);
    goToJob(newJob.id);
  };

  if (authLoading || !isGroupUser) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {selectedDept && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <span className={!selectedDept ? "text-foreground font-bold" : ""}>{t("internal.myDepartment")}</span>
            {selectedDept && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className={!selectedBranch ? "text-foreground font-bold" : ""}>{selectedDept.name}</span>
              </>
            )}
            {selectedBranch && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-foreground font-bold">{selectedBranch.name}</span>
              </>
            )}
          </div>
        </div>
        {selectedBranch && (
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("internal.create.newJob")}
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>{t("internal.loading")}</span>
          </div>
        ) : !selectedDept ? (
          /* Level 1: Select Department */
          <SelectionGrid 
            items={departments} 
            onSelect={setSelectedDept} 
            icon={<Building2 className="h-5 w-5 text-primary" />} 
          />
        ) : !selectedBranch ? (
          /* Level 2: Select Branch */
          <SelectionGrid 
            items={branches} 
            onSelect={setSelectedBranch} 
            icon={<MapPin className="h-5 w-5 text-primary" />} 
          />
        ) : (
          /* Level 3: Kanban Board */
          <ScrollArea className="h-full w-full rounded-md border bg-muted/20">
            <div className="flex gap-4 p-4 min-w-max">
              {groupedJobs.length === 0 ? (
                 <div className="w-full h-40 flex items-center justify-center text-muted-foreground">
                    {t("internal.noJobs")}
                 </div>
              ) : (
                groupedJobs.map(([date, dateJobs]) => (
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
                        <JobCard key={job.id} job={job} t={t} onClick={() => goToJob(job.id)} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      {selectedBranch && baseUrl && (
        <CreateJobDialog 
          open={createOpen} 
          onOpenChange={setCreateOpen}
          branchId={selectedBranch.id}
          branchName={selectedBranch.name}
          baseUrl={baseUrl}
          onSuccess={handleJobCreated}
          t={t}
        />
      )}
    </div>
  );
}

// --- Sub-Components ---

function SelectionGrid({ items, onSelect, icon }: { items: any[], onSelect: (item: any) => void, icon: React.ReactNode }) {
  if (items.length === 0) return <div className="p-4 text-muted-foreground">No items found.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-full p-1">
      {items.map((item) => (
        <Card 
          key={item.id} 
          onClick={() => onSelect(item)}
          className="cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all active:scale-[0.99]"
        >
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-background border shadow-xs">{icon}</div>
              <span className="font-semibold">{item.name}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function JobCard({ job, t, onClick }: { job: ChecklistJob; t: any; onClick: () => void }) {
  const confName = Array.isArray(job.checklist_conf_id) ? job.checklist_conf_id[1] : `ID: ${job.checklist_conf_id}`;
  const isDraft = job.state === "draft";
  const stateColor = statusStyles[job.state] || "bg-gray-100 text-gray-800";

  return (
    <Card 
      onClick={onClick}
      className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] group border-l-4 ${isDraft ? "border-l-amber-500 border-y-amber-200/50 border-r-amber-200/50 bg-amber-50/50" : "border-l-transparent hover:border-l-primary"}`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {confName || `#${job.id}`}
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

// --- Create Dialog (Refactored) ---

function CreateJobDialog({ open, onOpenChange, branchId, branchName, baseUrl, onSuccess, t }: any) {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    configId: "",
    summary: "",
    responsibleIds: [] as number[],
    searchUser: ""
  });

  useEffect(() => {
    if (!open) return;
    // Reset form
    setForm(f => ({ ...f, configId: "", summary: "", responsibleIds: [], searchUser: "" }));
    
    // Fetch dependencies
    checklistAPI.getBranchConfigs(baseUrl, branchId).then(r => r.success && setConfigs(r.data ?? []));
    checklistAPI.getChecklistUsers(baseUrl).then(r => r.success && setUsers(r.data ?? []));
  }, [open, branchId, baseUrl]);

  const handleSubmit = async () => {
    if (!form.date) return toast.error(t("internal.create.dateRequired"));
    
    setLoading(true);
    try {
      const res = await checklistAPI.createJob(baseUrl, {
        branch_id: branchId,
        date: form.date,
        checklist_conf_id: form.configId ? Number(form.configId) : undefined,
        summary: form.summary || undefined,
        responsible_user_ids: form.responsibleIds.length ? form.responsibleIds : undefined,
      });

      if (res.success && res.data?.id) {
        toast.success(t("internal.create.success"));
        onOpenChange(false);
        onSuccess({
          id: res.data.id,
          checklist_conf_id: form.configId || 0, // Simplified for UI update
          branch_id: branchId,
          date: form.date,
          state: "draft",
          summary: form.summary,
        });
      } else {
        toast.error(res.message || t("internal.create.error"));
      }
    } catch {
      toast.error(t("internal.create.error"));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(form.searchUser.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("internal.create.title")}</DialogTitle>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {branchName}
          </p>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>{t("internal.create.date")}</Label>
            <Input 
              type="date" 
              value={form.date} 
              onChange={e => setForm({...form, date: e.target.value})} 
            />
          </div>

          <div className="grid gap-1.5">
            <Label>{t("internal.create.config")}</Label>
            <Select 
              value={form.configId} 
              onValueChange={v => setForm({...form, configId: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("internal.create.configPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {configs.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>{t("internal.create.responsible")}</Label>
            <div className="border rounded-md p-2 space-y-2">
                <Input 
                    placeholder={t("internal.create.searchResponsible")} 
                    value={form.searchUser}
                    onChange={e => setForm({...form, searchUser: e.target.value})}
                    className="h-8 text-xs"
                />
                <div className="h-24 overflow-y-auto space-y-1">
                    {filteredUsers.map(u => (
                        <div key={u.id} className="flex items-center space-x-2 p-1 hover:bg-muted rounded cursor-pointer" onClick={() => {
                             const ids = form.responsibleIds.includes(u.id) 
                                ? form.responsibleIds.filter(id => id !== u.id)
                                : [...form.responsibleIds, u.id];
                             setForm({...form, responsibleIds: ids});
                        }}>
                             <div className={`w-4 h-4 rounded border flex items-center justify-center ${form.responsibleIds.includes(u.id) ? "bg-primary border-primary" : "border-input"}`}>
                                {form.responsibleIds.includes(u.id) && <Plus className="h-3 w-3 text-primary-foreground" />}
                             </div>
                             <span className="text-sm">{u.name}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>{t("internal.create.summary")}</Label>
            <Textarea 
              value={form.summary} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, summary: e.target.value})}
              placeholder={t("checklist.detail.noSummary")}
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>{t("internal.create.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("internal.create.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}