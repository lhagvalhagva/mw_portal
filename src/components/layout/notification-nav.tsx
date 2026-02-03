"use client"

import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { checklistAPI } from "@/lib/apiClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";

export function NotificationNav() {
    const [notifications, setNotifications] = useState<{ count: number, jobs: any[] }>({ count: 0, jobs: [] });

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const baseUrl = localStorage.getItem('rememberMeBaseUrl') || '';
                if (!baseUrl) return;
                const response = await checklistAPI.getNotifications(baseUrl);
                if (response.success && response.data) {
                    setNotifications(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {notifications.count > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-[11px] font-black text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in-50 duration-300">
                            {notifications.count > 9 ? '9+' : notifications.count}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden rounded-2xl" align="end">
                <div className="p-4 border-b border-white/10 bg-white/30 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold tracking-tight">Мэдэгдэл</h4>
                        {notifications.count > 0 && (
                            <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                                {notifications.count} Шинэ
                            </span>
                        )}
                    </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.jobs.length > 0 ? (
                        <div className="divide-y divide-white/10">
                            {notifications.jobs.map((job: any) => (
                                <Link
                                    key={job.id}
                                    href={`/checklist/${job.id}`}
                                    className="flex items-start gap-4 p-4 hover:bg-white/40 dark:hover:bg-white/5 transition-colors group"
                                >
                                    <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary transition-all duration-300 transform group-hover:scale-105">
                                        <Calendar className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold leading-none text-foreground group-hover:text-primary transition-colors">
                                            {job.checklist_conf_id}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground line-clamp-1 font-medium">
                                            {job.branch_id} • {job.date}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-white/20 dark:bg-black/10">
                            <Bell className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground font-medium">Танд одоогоор шинэ мэдэгдэл байхгүй байна.</p>
                        </div>
                    )}
                </div>
                <Link
                    href="/checklist"
                    className="block p-3 text-center text-[11px] font-black text-primary hover:bg-primary/10 transition-all border-t border-white/10 uppercase tracking-widest bg-white/20 dark:bg-black/10"
                >
                    Миний ажлууд / Бүгдийг харах
                </Link>
            </PopoverContent>
        </Popover>
    );
}
