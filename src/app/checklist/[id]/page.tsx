// checklist/[id]page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { checklistAPI } from "@/lib/apiClient"
import { DynamicTable } from "@/components/checklist/dynamic-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Send } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChecklistDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params.id)

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [summary, setSummary] = useState("")

    useEffect(() => {
        if (!id) return

        const fetchDetail = async () => {
            try {
                const response = await checklistAPI.getDetail('', id)
                if (response.success) {
                    setData(response.data)
                    setSummary(response.data.summary || "")
                } else {
                    toast.error("Алдаа гарлаа", { description: response.message })
                    router.push('/checklist')
                }
            } catch (error) {
                console.error(error)
                toast.error("Сүлжээний алдаа")
            } finally {
                setLoading(false)
            }
        }

        fetchDetail()
    }, [id, router])

    const handleUpdate = async (newData: any, status: 'inprogress' | 'done') => {
        setSaving(true)
        try {
            const payload = {
                json_data: {
                    columns: data.json_data.columns, // Maintain columns
                    rows: newData.rows // Update rows
                },
                state: status,
                summary: summary
            }

            const response = await checklistAPI.update('', id, payload)
            if (response.success) {
                toast.success(status === 'done' ? "Амжилттай илгээлээ" : "Хадгалагдлаа")
                if (status === 'done') {
                    router.push('/checklist')
                } else {
                    // Refresh local state if needed
                    setData({ ...data, state: 'inprogress' })
                }
            } else {
                toast.error("Алдаа", { description: response.message })
            }
        } catch (error) {
            console.error(error)
            toast.error("Хадгалахад алдаа гарлаа")
        } finally {
            setSaving(false)
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
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{data.checklist_conf_id}</h2>
                        <p className="text-muted-foreground">{data.branch_id} • {data.date}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Тайлбар / Summary
                    </label>
                    <textarea
                        disabled={isReadOnly}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Нэмэлт тайлбар бичих..."
                    />
                </div>

                <DynamicTable
                    initialData={data.json_data}
                    onSave={(rows) => handleUpdate({ rows }, 'inprogress')}
                    onSubmit={(rows) => handleUpdate({ rows }, 'done')}
                    readOnly={isReadOnly}
                />
            </div>
        </div>
    )
}
