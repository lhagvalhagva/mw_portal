"use client"

import { useState, useEffect, useCallback } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { attendanceAPI } from "@/lib/apiClient";
import { formatOdooDatetime } from "@/lib/date";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

export function AttendanceNav() {
  const { t } = useLocale();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string>("");
  const [timer, setTimer] = useState("00:00");
  const [loading, setLoading] = useState(false);

  // Цагийн зөрүүг тооцоолох функц (HH:mm формат)
  const calculateDuration = useCallback((startTimeStr: string) => {
    if (!startTimeStr) return "00:00";

    try {
      // Odoo-ийн "YYYY-MM-DD HH:mm:ss" форматыг JS Date болгох
      const start = new Date(startTimeStr.replace(/-/g, "/"));
      const now = new Date();
      
      const diffMs = now.getTime() - start.getTime();
      if (diffMs < 0) return "00:00";

      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${diffHrs.toString().padStart(2, "0")}:${diffMins.toString().padStart(2, "0")}`;
    } catch (e) {
      return "00:00";
    }
  }, []);

  // Статус шалгах
  const syncStatus = useCallback(async () => {
    const baseUrl = localStorage.getItem('rememberMeBaseUrl') || "";
    const res = await attendanceAPI.checkAttendanceStatus(baseUrl);
    
    if (res.success) {
      setIsCheckedIn(res.is_working ?? false);
      if (res.last_time) {
        setLastCheckIn(res.last_time);
        // Хэрэв ажиллаж байгаа бол ажилласан хугацааг шууд бодно
        if (res.is_working ?? false) {
          setTimer(calculateDuration(res.last_time));
        }
      }
    }
  }, [calculateDuration]);

  useEffect(() => {
    syncStatus();
  }, [syncStatus]);

  // Dropdown нээгдэх үед цагийг дахин бодох
  const handleOpenChange = (open: boolean) => {
    if (open && isCheckedIn && lastCheckIn) {
      setTimer(calculateDuration(lastCheckIn));
    }
  };

  const handleAttendanceAction = async () => {
    setLoading(true);
    const baseUrl = localStorage.getItem('rememberMeBaseUrl') || "";
    const formattedTime = formatOdooDatetime(new Date());

    const res = await attendanceAPI.createAttendance(baseUrl, formattedTime);

    if (res.success) {
      const nextState = !isCheckedIn;
      setIsCheckedIn(nextState);
      setLastCheckIn(formattedTime);
      
      if (nextState) {
        setTimer("00:00"); // Дөнгөж орсон бол 0-ээс эхэлнэ
      }
      toast.success(isCheckedIn ? t('attendance.checkOutSuccess') : t('attendance.checkInSuccess'));
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 w-9 h-9">
          <Clock className={cn("h-5 w-5 transition-colors", isCheckedIn ? "text-green-500" : "text-muted-foreground")} />
          <span className={cn(
            "absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white",
            isCheckedIn ? "bg-green-500 animate-pulse" : "bg-orange-400"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 mt-2 rounded-2xl p-3 bg-white dark:bg-card shadow-xl border z-[100]" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{t('attendance.title')}</span>
            <div className={cn(
              "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase",
              isCheckedIn ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
            )}>
              {isCheckedIn ? t('attendance.working') : t('attendance.notWorking')}
            </div>
          </div>

          <div className="text-center py-1">
            {isCheckedIn ? (
              <div className="space-y-0">
                <p className="text-[10px] text-muted-foreground">
                  {t('attendance.started')}: {lastCheckIn ? lastCheckIn.split(' ')[1].substring(0, 5) : "--:--"}
                </p>
                <h3 className="text-3xl font-black tracking-tight text-primary leading-tight">
                  {timer}
                </h3>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-xs font-semibold text-muted-foreground">{t('attendance.notRegistered')}</p>
                {lastCheckIn && (
                  <p className="text-[9px] text-muted-foreground mt-1">{t('attendance.last')}: {lastCheckIn.split(' ')[1].substring(0, 5)}</p>
                )}
              </div>
            )}
          </div>

          <Button 
            onClick={handleAttendanceAction}
            disabled={loading}
            className={cn(
              "w-full h-10 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95",
              isCheckedIn ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"
            )}
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isCheckedIn ? (
                <><LogOut size={14} className="mr-2"/> {t('attendance.checkOut')}</>
              ) : (
                <><LogIn size={14} className="mr-2"/> {t('attendance.checkIn')}</>
              )
            )}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}