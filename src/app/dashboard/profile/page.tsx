"use client"

import { useEffect, useState, cloneElement } from "react";
import { authAPI } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getOdooImage } from "@/lib/utils";
import { 
  Mail, Phone, MapPin, Briefcase, 
  Building2, Calendar, User, IdCard, 
  Copy, Check, AlertCircle, Send, Smartphone 
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

interface EmployeeProfile {
  id: number;
  name: string;
  display_name: string;
  job_title?: string;
  work_email?: string;
  work_phone?: string;
  work_location_id?: [number, string];
  department_id?: [number, string];
  engagement_in_company?: string;
  live_address?: string;
  image_1920?: string;
}

export default function ProfilePage() {
  const { t } = useLocale();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    const baseUrl = localStorage.getItem('rememberMeBaseUrl') || "";
    try {
      const res = await authAPI.getEmployeeProfile(baseUrl);
      if (res.status === "success") {
        setEmployee(res.data);
      } else {
        setError(res.message || t('profile.notFound'));
      }
    } catch (error) {
      setError(t('profile.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Хуулах функц
  const handleCopy = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(t('profile.copied', { label }), {
      icon: <Check className="h-4 w-4 text-green-500" />,
    });
  };

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground font-medium">{error}</p>
        <Button onClick={fetchProfile} variant="outline">{t('profile.reload')}</Button>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. HEADER SECTION */}
      <Card className="border-none shadow-lg shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-white dark:bg-card group">
        {/* Cover Image with Gradient */}
        <div className="h-40 bg-gradient-to-r from-[#6C7BFF] via-[#8E9AFF] to-[#6C7BFF] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10" /> {/* Optional Pattern */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        
        <CardContent className="relative px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-36 w-36 border-[6px] border-white dark:border-card shadow-2xl rounded-[2rem] transition-transform duration-300 group-hover:scale-105">
            <AvatarImage 
                src={getOdooImage(employee.image_1920) || ""} 
                className="object-cover"
            />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary font-black">
                {employee.name?.charAt(0)}
            </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 border-4 border-white dark:border-card rounded-full" title={t('profile.active')} />
            </div>

            {/* Name & Title */}
            <div className="flex-1 mb-2 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-foreground tracking-tight">{employee.display_name}</h1>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold px-3 py-1 rounded-lg cursor-pointer" onClick={() => handleCopy(employee.id.toString(), "ID")}>
                  ID: {employee.id}
                </Badge>
              </div>
              <p className="text-muted-foreground font-medium flex items-center gap-2 text-lg">
                <Briefcase size={18} className="text-primary/70" />
                {employee.job_title || t('profile.jobTitleUnknown')}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 mb-2 w-full md:w-auto">
              {employee.work_email && (
                <Button className="flex-1 md:flex-none rounded-xl" onClick={() => window.open(`mailto:${employee.work_email}`)}>
                  <Send className="mr-2 h-4 w-4" /> {t('profile.email')}
                </Button>
              )}
              {employee.work_phone && (
                <Button variant="outline" className="flex-1 md:flex-none rounded-xl" onClick={() => window.open(`tel:${employee.work_phone}`)}>
                  <Smartphone className="mr-2 h-4 w-4" /> {t('profile.call')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. TABS & CONTENT */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-transparent p-0 gap-6 border-b rounded-none w-full justify-start h-auto">
          <TabTrigger value="general" label={t('profile.tab.general')} icon={<User size={16} />} />
          <TabTrigger value="organization" label={t('profile.tab.organization')} icon={<Building2 size={16} />} />
          {/* Ирээдүйд нэмэх боломжтой */}
          {/* <TabTrigger value="documents" label="Бичиг баримт" icon={<FileText size={16} />} /> */}
        </TabsList>

        <div className="mt-8">
          <TabsContent value="general" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Card */}
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> {t('profile.contact')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <CopyableInfoItem 
                    icon={<Mail />} 
                    label={t('profile.emailAddress')} 
                    value={employee.work_email} 
                    onCopy={() => handleCopy(employee.work_email, t('profile.email'))}
                  />
                  <CopyableInfoItem 
                    icon={<Phone />} 
                    label={t('profile.phoneNumber')} 
                    value={employee.work_phone} 
                    onCopy={() => handleCopy(employee.work_phone, t('profile.phoneNumber'))}
                  />
                  <CopyableInfoItem 
                    icon={<MapPin />} 
                    label={t('profile.workLocation')} 
                    value={employee.work_location_id?.[1]} 
                  />
                </CardContent>
              </Card>

              {/* Personal Info Card */}
              <Card className="md:col-span-2 border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-primary" /> {t('profile.personalInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  <CopyableInfoItem icon={<MapPin />} label={t('profile.homeAddress')} value={employee.live_address} />
                  {/* Энд нэмэлт талбарууд байж болно: Төрсөн өдөр, Хүйс г.м */}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="organization" className="mt-0">
             <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> {t('profile.positionInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  <CopyableInfoItem icon={<Building2 />} label={t('profile.department')} value={employee.department_id?.[1]} />
                  <CopyableInfoItem icon={<Briefcase />} label={t('profile.position')} value={employee.job_title} />
                  <CopyableInfoItem icon={<Calendar />} label={t('profile.startDate')} value={employee.engagement_in_company} />
                  <CopyableInfoItem icon={<User />} label={t('profile.manager')} value="Manager Name (Placeholder)" />
                </CardContent>
              </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ------------------------------------------------------------
// Reusable Components
// ------------------------------------------------------------

function TabTrigger({ value, label, icon }: { value: string, label: string, icon: any }) {
  return (
    <TabsTrigger 
      value={value} 
      className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 font-bold text-muted-foreground flex items-center gap-2 transition-all hover:text-primary/80"
    >
      {icon} {label}
    </TabsTrigger>
  );
}

function CopyableInfoItem({ 
  icon, 
  label, 
  value, 
  onCopy 
}: { 
  icon: any, 
  label: string, 
  value?: string | null, 
  onCopy?: () => void 
}) {
  return (
    <div className="flex items-center gap-4 py-3 group hover:bg-muted/30 p-2 rounded-xl transition-colors">
      <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
        {cloneElement(icon, { size: 18 })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{value || "—"}</p>
        </div>
      </div>
      {onCopy && value && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCopy} 
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Copy size={14} />
        </Button>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <Skeleton className="h-[280px] w-full rounded-[2.5rem]" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full rounded-[2rem]" />
          <Skeleton className="md:col-span-2 h-64 w-full rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}