// checklist/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { checklistAPI } from "@/lib/apiClient"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/contexts/LocaleContext"

interface ChecklistJob {
    id: number
    checklist_conf_id: [number, string]
    branch_id: [number, string]
    date: string
    state: string
    summary: string
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    sent: "default",
    received: "outline",
    inprogress: "default",
    done: "secondary"
}

export default function ChecklistListPage() {
    const { t } = useLocale()
    const router = useRouter()
    const [jobs, setJobs] = useState<ChecklistJob[]>([])
    const [loading, setLoading] = useState(true)
    
    const statusLabels: Record<string, string> = {
        draft: t('state.draft'),
        sent: t('state.sent'),
        received: t('checklist.list.received'),
        inprogress: t('checklist.list.inprogress'),
        done: t('checklist.list.done')
    }

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const baseUrl = localStorage.getItem('rememberMeBaseUrl') || ''
                if (!baseUrl) return
                const response = await checklistAPI.getList(baseUrl)
                if (response.success && response.data) {
                    setJobs(response.data as ChecklistJob[])
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchJobs()
    }, [])

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
        )
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text">{t('checklist.list.title')}</h2>
                    <p className="text-muted-foreground">
                        {t('checklist.list.description')}
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        {t('checklist.list.empty')}
                    </div>
                ) : (
                    jobs.map((job) => (
                        <Card
                            key={job.id}
                            className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] transition-transform"
                            onClick={() => router.push(`/checklist/${job.id}`)}
                        >
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{job.checklist_conf_id[1]}</h3>
                                        <Badge variant={statusColors[job.state]}>
                                            {statusLabels[job.state] || job.state}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            {job.date}
                                        </span>
                                        <span>•</span>
                                        <span>{job.branch_id[1]}</span>
                                    </div>
                                    {job.summary && (
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {job.summary}
                                        </p>
                                    )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
