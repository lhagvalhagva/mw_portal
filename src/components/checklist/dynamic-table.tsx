"use client"

import React, { useState, useEffect } from "react"
import { EditableCell } from "./editable-cell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Loader2, Save, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/contexts/LocaleContext"

interface Column {
    name: string
    type: string
    options?: string[]
}

interface DynamicTableProps {
    initialData: { columns: Column[]; rows: any[] }
    onSave?: (rows: any[]) => void
    onSubmit?: (rows: any[]) => void
    readOnly?: boolean
    showRowMeta?: boolean
    showSendRows?: boolean
    users?: { id: number; name: string }[]
    onSendRows?: (rowIndices: number[], userIds: number[]) => Promise<void>
}

function toggleInSet(set: number[], val: number, sort = false): number[] {
    const next = set.includes(val) ? set.filter((i) => i !== val) : [...set, val]
    return sort ? next.sort((a, b) => a - b) : next
}

export function DynamicTable({
    initialData,
    onSave,
    onSubmit,
    readOnly = false,
    showRowMeta = false,
    showSendRows = false,
    users = [],
    onSendRows,
}: DynamicTableProps) {
    const { t } = useLocale()
    const [rows, setRows] = useState(initialData.rows)
    const columns = initialData.columns
    const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([])
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
    const [sending, setSending] = useState(false)
    const [sendPopoverOpen, setSendPopoverOpen] = useState(false)
    const [userSearch, setUserSearch] = useState("")

    useEffect(() => { setRows(initialData.rows) }, [initialData])

    const handleSendRows = async () => {
        if (!selectedRowIndices.length || !selectedUserIds.length || !onSendRows) return
        setSending(true)
        try {
            await onSendRows(selectedRowIndices, selectedUserIds)
            setSelectedRowIndices([])
            setSelectedUserIds([])
            setSendPopoverOpen(false)
            setUserSearch("")
        } finally {
            setSending(false)
        }
    }

    const handleUpdate = (rowIndex: number, colName: string, newValue: any) => {
        if (readOnly) return
        const next = [...rows]
        next[rowIndex] = { ...next[rowIndex], [colName]: newValue }
        setRows(next)
    }

    const renderStatus = (row: Record<string, unknown>) => (
        <>
            <span>{String(row.__state_display ?? "–")}</span>
            {(row.__sent_to_users_display as string)?.trim() ? (
                <span className="block text-muted-foreground text-xs mt-0.5">{t("checklist.table.sentToLabel")} {String(row.__sent_to_users_display)}</span>
            ) : null}
            {(row.__done_by_user_display as string)?.trim() ? (
                <span className="block text-muted-foreground text-xs mt-0.5">{t("checklist.table.doneBy")}: {String(row.__done_by_user_display)}</span>
            ) : null}
        </>
    )

    return (
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 px-6">
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">{t("checklist.table.title")}</CardTitle>
                    <CardDescription>{t("checklist.table.description")}</CardDescription>
                </div>
                {showSendRows && !readOnly && (
                    <Popover open={sendPopoverOpen} onOpenChange={setSendPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={selectedRowIndices.length === 0 || sending}
                            >
                                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                {t("checklist.send.button")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 bg-white dark:bg-slate-950 border border-border shadow-lg" align="end">
                            <p className="text-sm font-medium text-muted-foreground mb-2">{t("checklist.send.selectUsers")}</p>
                            <Input
                                placeholder={t("common.search")}
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="mb-3 h-9"
                            />
                            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                                {users
                                    .filter((u) => u.name.toLowerCase().includes(userSearch.trim().toLowerCase()))
                                    .map((u) => (
                                    <label key={u.id} className={cn("flex items-center gap-2 text-sm", sending && "pointer-events-none opacity-60")}>
                                        <Checkbox
                                            checked={selectedUserIds.includes(u.id)}
                                            onCheckedChange={() => setSelectedUserIds((p) => toggleInSet(p, u.id))}
                                            disabled={sending}
                                        />
                                        <span>{u.name}</span>
                                    </label>
                                    ))}
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="sm"
                                disabled={sending || selectedUserIds.length === 0}
                                onClick={() => void handleSendRows()}
                            >
                                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                {t("checklist.send.button")}
                            </Button>
                        </PopoverContent>
                    </Popover>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {/* DESKTOP VIEW */}
                <div className="hidden md:block overflow-auto max-h-[calc(100vh-300px)] border-t custom-scrollbar">
                    <table className="table-auto w-full text-sm text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20 bg-white dark:bg-slate-950">
                            <tr>
                                {showSendRows && (
                                    <th className="px-2 py-4 w-10 text-center border-b border-r font-bold text-muted-foreground text-[11px] uppercase tracking-wider bg-inherit">
                                        <span className="sr-only">{t('checklist.send.selectRows')}</span>
                                    </th>
                                )}
                                <th className="px-4 py-4 w-12 text-center border-b font-bold text-muted-foreground text-[11px] uppercase tracking-wider bg-inherit">№</th>
                                {columns.map(col => col.name !== '№' && (
                                    <th key={col.name} className={cn(
                                        "px-6 py-4 min-w-[180px] border-b border-l first:border-l-0 font-bold text-muted-foreground text-[11px] uppercase tracking-wider bg-inherit whitespace-normal break-words leading-tight",
                                        col.type === 'text' ? "max-w-[400px]" : "max-w-[350px]"
                                    )}>
                                        {col.name}
                                    </th>
                                ))}
                                {showRowMeta && (
                                    <th className="px-6 py-4 min-w-[200px] border-b border-l font-bold text-muted-foreground text-[11px] uppercase tracking-wider bg-inherit">{t('checklist.table.status')}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y bg-background">
                            {rows.map((row, idx) => (
                                <tr key={idx} className={cn("hover:bg-muted/5 transition-colors group", showSendRows && selectedRowIndices.includes(idx) && "bg-primary/5")}>
                                    {showSendRows && (
                                        <td className="px-2 py-2 border-r border-b align-middle text-center">
                                            <Checkbox
                                                checked={selectedRowIndices.includes(idx)}
                                                onCheckedChange={() => setSelectedRowIndices((p) => toggleInSet(p, idx, true))}
                                                aria-label={t("checklist.send.selectRows")}
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-4 text-center text-muted-foreground bg-muted/5 font-medium border-r border-b align-top">{idx + 1}</td>
                                    {columns.map(col => col.name !== '№' && (
                                        <td key={col.name} className={cn(
                                            "px-2 py-2 border-l border-b first:border-l-0 align-top",
                                            col.type === 'text' 
                                                ? "whitespace-normal break-words overflow-wrap-anywhere" 
                                                : "whitespace-normal break-words"
                                        )}>
                                            <EditableCell type={col.type} value={row[col.name]} options={col.options} onChange={(val) => handleUpdate(idx, col.name, val)} />
                                        </td>
                                    ))}
                                    {showRowMeta && (
                                        <td className="px-2 py-2 border-l border-b align-top text-sm whitespace-normal break-words">{renderStatus(row)}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE VIEW */}
                <div className="md:hidden space-y-4 p-4 bg-muted/20">
                    {rows.map((row, idx) => (
                        <div key={idx} className="bg-card border rounded-xl shadow-sm overflow-hidden">
                            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 border-b flex justify-between items-center gap-2">
                                {showSendRows && (
                                    <Checkbox
                                        checked={selectedRowIndices.includes(idx)}
                                        onCheckedChange={() => setSelectedRowIndices((p) => toggleInSet(p, idx, true))}
                                        aria-label={t("checklist.send.selectRows")}
                                    />
                                )}
                                <span className="font-bold text-primary">#{idx + 1}</span>
                                <span className="text-xs font-semibold truncate ml-4 text-muted-foreground uppercase">{String(row[columns[0]?.name] || "")}</span>
                            </div>
                            <div className="p-4 space-y-5">
                                {columns.map(col => col.name !== '№' && (
                                    <div key={col.name} className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{col.name}</label>
                                        <EditableCell type={col.type} value={row[col.name]} options={col.options} isMobile onChange={(val) => handleUpdate(idx, col.name, val)} />
                                    </div>
                                ))}
                                {showRowMeta && (
                                    <div className="space-y-1.5 pt-2 border-t">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("checklist.table.status")}</label>
                                        <p className="text-sm">{renderStatus(row)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* ACTION BAR */}
            {!readOnly && (
                <div className="p-4 bg-background/80 backdrop-blur-md border-t flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onSave?.(rows)}><Save className="w-4 h-4 mr-2" /> {t("checklist.table.save")}</Button>
                    <Button className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" onClick={() => onSubmit?.(rows)}><Send className="w-4 h-4 mr-2" /> {t("checklist.table.submit")}</Button>
                </div>
            )}
        </Card>
    )
}