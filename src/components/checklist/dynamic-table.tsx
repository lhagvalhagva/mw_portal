"use client";

import React, { useState, useEffect } from "react";
import { EditableCell } from "./editable-cell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Send, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";

interface DynamicTableProps {
  initialData: { columns: any[]; rows: any[] };
  onSave?: (rows: any[]) => void;
  onSubmit?: (rows: any[]) => void;
  readOnly?: boolean;
  showRowMeta?: boolean;
  showSendRows?: boolean;
  users?: { id: number; name: string }[];
  onSendRows?: (rowIndices: number[], userIds: number[]) => Promise<void>;
}

export function DynamicTable({ 
  initialData, onSave, onSubmit, readOnly, showRowMeta, showSendRows, users = [], onSendRows 
}: DynamicTableProps) {
  const { t } = useLocale();
  const [rows, setRows] = useState(initialData.rows);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => { setRows(initialData.rows); }, [initialData]);

  const toggleSelection = (list: number[], id: number) => 
    list.includes(id) ? list.filter(i => i !== id) : [...list, id];

  const handleUpdate = (idx: number, col: string, val: any) => {
    if (readOnly) return;
    const newRows = [...rows];
    newRows[idx] = { ...newRows[idx], [col]: val };
    setRows(newRows);
  };

  const handleSend = async () => {
    if (!onSendRows) return;
    setLoading(true);
    try {
      await onSendRows(selectedRows, selectedUsers);
      setSelectedRows([]);
      setSelectedUsers([]);
      setPopoverOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Төлөв болон илгээсэн хэрэглэгчдийг өнгөөр ялгаж харуулах
  const renderStatus = (row: any) => (
    <div className="space-y-1.5 py-1">
      <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase">
        {row.__state_display || "Draft"}
      </Badge>
      
      {row.__sent_to_users_display && (
        <div className="flex items-start gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
          <span className="shrink-0 font-bold">{t("checklist.table.sentToLabel")}:</span>
          <span className="truncate">{row.__sent_to_users_display}</span>
        </div>
      )}
      
      {row.__done_by_user_display && (
        <div className="flex items-start gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
          <span className="shrink-0 font-bold">{t("checklist.table.doneBy")}:</span>
          <span className="truncate">{row.__done_by_user_display}</span>
        </div>
      )}
    </div>
  );

  return (
    <Card className="border shadow-sm bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b bg-muted/5">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">{t("checklist.table.title")}</CardTitle>
          <CardDescription className="text-xs">{t("checklist.table.description")}</CardDescription>
        </div>
        {showSendRows && !readOnly && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={selectedRows.length === 0 || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {t("checklist.send.button")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-popover opacity-100 shadow-xl border z-[100]" align="end">
              <div className="p-4 border-b bg-muted/10">
                <h4 className="text-sm font-bold mb-2">{t("checklist.send.selectUsers")}</h4>
                <Input placeholder={t("common.search")} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="h-8 bg-background" />
              </div>
              <ScrollArea className="h-48 p-2">
                {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                  <label key={u.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors text-sm">
                    <Checkbox checked={selectedUsers.includes(u.id)} onCheckedChange={() => setSelectedUsers(p => toggleSelection(p, u.id))} />
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {u.name}
                  </label>
                ))}
              </ScrollArea>
              <div className="p-3 border-t bg-muted/10">
                <Button className="w-full bg-blue-600" onClick={handleSend} disabled={loading || !selectedUsers.length}>
                   {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("checklist.send.button")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Desktop View */}
        <div className="hidden md:block overflow-auto max-h-[calc(100vh-350px)]">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-background">
              <tr>
                {showSendRows && <th className="p-4 w-10 border-b border-r" />}
                <th className="p-4 w-12 text-center border-b font-bold text-muted-foreground text-[10px] uppercase tracking-wider bg-muted/10">№</th>
                {initialData.columns.map(col => col.name !== '№' && (
                  <th key={col.name} className="p-4 border-b border-l font-bold text-muted-foreground text-[10px] uppercase tracking-wider min-w-[150px] bg-muted/10">
                    {col.name}
                  </th>
                ))}
                {showRowMeta && <th className="p-4 border-b border-l font-bold text-muted-foreground text-[10px] uppercase tracking-wider bg-muted/10">{t('checklist.table.status')}</th>}
              </tr>
            </thead>
            <tbody className="bg-background">
              {rows.map((row, idx) => (
                <tr key={idx} className={cn("hover:bg-muted/30 transition-colors group", selectedRows.includes(idx) && "bg-blue-50/50")}>
                  {showSendRows && (
                    <td className="p-2 border-r border-b text-center">
                      <Checkbox checked={selectedRows.includes(idx)} onCheckedChange={() => setSelectedRows(p => toggleSelection(p, idx))} />
                    </td>
                  )}
                  <td className="p-4 text-center text-muted-foreground border-b align-top font-mono text-xs">{idx + 1}</td>
                  {initialData.columns.map(col => col.name !== '№' && (
                    <td key={col.name} className="p-2 border-l border-b align-top group-hover:bg-muted/10 transition-colors">
                      <EditableCell type={col.type} value={row[col.name]} options={col.options} onChange={(v) => handleUpdate(idx, col.name, v)} />
                    </td>
                  ))}
                  {showRowMeta && (
                    <td className="p-2 border-l border-b align-top min-w-[200px]">
                      {renderStatus(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-3 space-y-4 bg-muted/10">
          {rows.map((row, idx) => (
            <div key={idx} className={cn("bg-card border rounded-lg overflow-hidden shadow-sm transition-all", selectedRows.includes(idx) && "border-blue-400 ring-1 ring-blue-400")}>
              <div className="flex justify-between items-center px-4 py-3 bg-muted/30 border-b">
                <div className="flex items-center gap-3">
                  {showSendRows && <Checkbox checked={selectedRows.includes(idx)} onCheckedChange={() => setSelectedRows(p => toggleSelection(p, idx))} />}
                  <span className="font-bold text-primary">#{idx + 1}</span>
                </div>
                <div className="max-w-[120px] truncate font-bold text-[10px] uppercase text-muted-foreground">
                   {String(row[initialData.columns[0]?.name] || "")}
                </div>
              </div>
              <div className="p-4 space-y-4">
                {initialData.columns.map(col => col.name !== '№' && (
                  <div key={col.name} className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground/70 uppercase flex items-center gap-1">
                       <ChevronRight className="h-3 w-3" /> {col.name}
                    </label>
                    <EditableCell type={col.type} value={row[col.name]} options={col.options} isMobile onChange={(v) => handleUpdate(idx, col.name, v)} />
                  </div>
                ))}
                {showRowMeta && (
                   <div className="pt-3 border-t">
                      <label className="text-[10px] font-bold text-muted-foreground/70 uppercase mb-2 block">{t('checklist.table.status')}</label>
                      {renderStatus(row)}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {!readOnly && (
        <div className="p-4 bg-background/80 backdrop-blur-md border-t flex justify-end gap-3 sticky bottom-0 z-30">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/5" onClick={() => onSave?.(rows)}>
            <Save className="w-4 h-4 mr-2 text-primary" /> {t("checklist.table.save")}
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 shadow-md" onClick={() => onSubmit?.(rows)}>
            <Send className="w-4 h-4 mr-2" /> {t("checklist.table.submit")}
          </Button>
        </div>
      )}
    </Card>
  );
}

// Хэрэв ScrollArea ашиглах бол shadcn/ui-аас import хийнэ
function ScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("overflow-y-auto custom-scrollbar", className)}>{children}</div>;
}