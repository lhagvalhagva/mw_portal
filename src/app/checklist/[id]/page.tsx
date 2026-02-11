"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { checklistAPI } from "@/lib/apiClient"
import { DynamicTable } from "@/components/checklist/dynamic-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/contexts/LocaleContext"
import { useAuth } from "@/hooks/useAuth"

function getBaseUrl(): string {
    return typeof window !== "undefined" ? localStorage.getItem("rememberMeBaseUrl") || "" : ""
}

export default function ChecklistDetailPage() {
    const { t } = useLocale()
    const params = useParams()
    const router = useRouter()
    const id = Number(params.id)
    const { isGroupUser } = useAuth(false)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<Record<string, unknown> | null>(null)
    const [summary, setSummary] = useState("")
    const [isManagerView, setIsManagerView] = useState(false)
    const [users, setUsers] = useState<{ id: number; name: string }[]>([])

    useEffect(() => {
        if (!id) return
        const baseUrl = getBaseUrl()
        if (!baseUrl) {
            toast.error("Сервер тохируулаагүй байна")
            router.push("/checklist")
            setLoading(false)
            return
        }
        setLoading(true)
        const run = async () => {
            try {
                const res = await checklistAPI.getDetail(baseUrl, id)
                if (res.success && res.data) {
                    const d = res.data as Record<string, unknown>
                    setData(d)
                    setSummary((d.summary as string) ?? "")
                    setIsManagerView(!!isGroupUser)
                } else {
                    toast.error("Алдаа гарлаа", { description: !res.success ? res.message : undefined })
                    router.push("/checklist")
                }
            } catch {
                toast.error("Сүлжээний алдаа")
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [id, isGroupUser, router])

    useEffect(() => {
        if (!isGroupUser) return
        const baseUrl = getBaseUrl()
        if (!baseUrl) return
        checklistAPI.getChecklistUsers(baseUrl).then((r) => r.success && r.data && setUsers(r.data as { id: number; name: string }[]))
    }, [isGroupUser])

    const handleUpdate = async (newData: { rows?: unknown[] }, status: "inprogress" | "done") => {
        const baseUrl = getBaseUrl()
        if (!baseUrl || !data) return
        const rows = newData.rows ?? []
        const json = (data.json_data as { columns?: unknown[] }) ?? {}
        try {
            const res = await checklistAPI.update(baseUrl, id, {
                json_data: { columns: json.columns, rows },
                state: status === "done" ? "done" : "draft",
                summary,
            })
            if (res.success) {
                toast.success(status === "done" ? "Амжилттай илгээлээ" : "Хадгалагдлаа")
                if (status === "done") router.push("/checklist")
                else setData((prev) => (prev ? { ...prev, state: "draft" } : prev))
            } else toast.error("Алдаа", { description: res.message })
        } catch {
            toast.error("Хадгалахад алдаа гарлаа")
        }
    }

    const handleSendRows = async (rowIndices: number[], userIds: number[]) => {
        const baseUrl = getBaseUrl()
        if (!baseUrl || !data) return
        const rows = (data.json_data as { rows?: { __sequence?: number }[] })?.rows ?? []
        const sentSequences = rowIndices.map((i) => rows[i]?.__sequence).filter((s): s is number => s != null)
        const res = await checklistAPI.sendRowTaskChecklist(baseUrl, id, sentSequences, userIds)
        if (res.success && res.data) {
            const rd = res.data as Record<string, unknown>
            setData((prev) => (prev ? { ...prev, json_data: rd.json_data ?? prev.json_data, responsible_ids: rd.responsible_ids ?? prev.responsible_ids } : prev))
            toast.success(t("checklist.send.success"), { description: res.message as string })
        } else {
            toast.error((res.message as string) || "Илгээхэд алдаа гарлаа")
            throw new Error(res.message as string)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        )
    }

    if (!data) return null

    const isReadOnly = data.state === 'done' || data.state === 'cancel'

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label={t('aria.goBack')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{String(data.checklist_conf_id ?? "")}</h2>
                        <p className="text-muted-foreground">{String(data.branch_id ?? "")} • {String(data.date ?? "")}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t("checklist.detail.summary")}
                    </label>
                    <textarea
                        disabled={isReadOnly}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t("checklist.detail.noSummary")}
                    />
                </div>

                <DynamicTable
                    initialData={(data.json_data as { columns: { name: string; type: string }[]; rows: unknown[] }) ?? { columns: [], rows: [] }}
                    onSave={(rows) => handleUpdate({ rows }, 'inprogress')}
                    onSubmit={(rows) => handleUpdate({ rows }, 'done')}
                    readOnly={isReadOnly}
                    showRowMeta={isManagerView}
                    showSendRows={isManagerView && !isReadOnly}
                    users={users}
                    onSendRows={isManagerView ? handleSendRows : undefined}
                />
            </div>
        </div>
    )
}
