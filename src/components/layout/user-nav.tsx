"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authAPI } from "@/lib/apiClient";
import { LogOut, User, Settings } from "lucide-react";
import { toast } from "sonner";
import { getOdooImage } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";

export function UserNav() {
  const { t } = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; login?: string; image?: string | null } | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    const baseUrl = localStorage.getItem('rememberMeBaseUrl') || "";
    
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUser(parsed);
      } catch (e) {
        console.error("Profile parse error");
      }
    }

    // 2. Зураг болон шинэ мэдээллийг API-аас татах
    const fetchLatestProfile = async () => {
        if (!baseUrl) return;
        try {
            const res = await authAPI.getEmployeeProfile(baseUrl);
            if (res.status === 'success' && res.data) {
                setUser(prev => ({
                    ...prev,
                    name: res.data.display_name,
                    login: prev?.login || res.data.work_email,
                    image: getOdooImage(res.data.image_1920) 
                }));
            }

        } catch (error) {
            console.error("Failed to fetch user image for navbar");
        }
    };

    fetchLatestProfile();
  }, []);

  const handleLogout = async () => {
    const baseUrl = localStorage.getItem('rememberMeBaseUrl') || "";
    try {
      if (baseUrl) await authAPI.logout(baseUrl);
    } catch (err) {
      console.error("Logout failed");
    } finally {
      localStorage.removeItem('user_profile');
      toast.success(t('user.logoutSuccess'));
      router.push("/auth/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 rounded-full border-2 border-primary/20 p-0.5 hover:border-primary/50 transition-all outline-none">
          <Avatar className="h-full w-full">
            {/* Helper функц ашигласан зургийн зам */}
            <AvatarImage src={user?.image || ""} alt="User" className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-1.5 bg-white dark:bg-card shadow-xl border z-[100]" align="end">
        <DropdownMenuLabel className="font-normal p-0">
          <div className="flex flex-col space-y-0.5 p-2 bg-primary/5 rounded-xl">
            <p className="text-xs font-bold leading-none truncate">{user?.name || t('user.name')}</p>
            <p className="text-[10px] text-muted-foreground truncate font-medium">{user?.login || "user@ayanhotel.mn"}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="my-1.5 opacity-50" />
        
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="rounded-lg cursor-pointer py-2 px-2.5 transition-colors focus:bg-primary/5 group">
            <User className="mr-2.5 h-3.5 w-3.5 text-muted-foreground group-focus:text-primary" />
            <span className="text-xs font-semibold">{t('user.profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-2.5 transition-colors focus:bg-primary/5 group">
            <Settings className="mr-2.5 h-3.5 w-3.5 text-muted-foreground group-focus:text-primary" />
            <span className="text-xs font-semibold">{t('user.settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
     
        <DropdownMenuSeparator className="my-1.5 opacity-50" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="rounded-lg cursor-pointer py-2 px-2.5 text-destructive focus:bg-destructive/10 group transition-all"
        >
          <LogOut className="mr-2.5 h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-xs font-bold">{t('user.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}