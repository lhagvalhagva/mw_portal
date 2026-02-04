'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/apiClient';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Server, Mail, Lock, Loader2, Eye, EyeOff, Shield, LogIn } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useLocale();
  const [baseUrl, setBaseUrl] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDbDialogOpen, setIsDbDialogOpen] = useState(false);
  const [dbList, setDbList] = useState<string[]>([]);
  const [selectedDb, setSelectedDb] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedBaseUrl = localStorage.getItem('rememberMeBaseUrl');
    const savedDb = localStorage.getItem('rememberMeDb');
    const savedLogin = localStorage.getItem('rememberMeLogin');
    if (savedBaseUrl && savedDb && savedLogin) {
      setBaseUrl(savedBaseUrl);
      setLogin(savedLogin);
      setRememberMe(true);
    }
  }, []);

  const normalizeUrl = async (input: string): Promise<string> => {
    if (input.startsWith('https://') || input.startsWith('http://')) {
      return input;
    }
    const httpsUrl = `https://${input}`;
    const isHttpsPage = window.location.protocol === 'https:';
    if (isHttpsPage) return httpsUrl;
    try {
      const response = await fetch(httpsUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
      if (response.ok || response.status === 302) return httpsUrl;
    } catch (e) {}
    return `http://${input}`;
  };

  const showDbSelectionDialog = (databases: string[]): Promise<string> => {
    setDbList(databases);
    setSelectedDb(databases[0] || '');
    setIsDbDialogOpen(true);
    return new Promise((resolve) => {
      (window as any).resolveDbSelection = (chosenDb: string) => {
        setIsDbDialogOpen(false);
        resolve(chosenDb);
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedBaseUrl = await normalizeUrl(baseUrl);
      const databases = await authAPI.getDatabases(normalizedBaseUrl);
      
      let finalDb = '';
      if (databases.length === 0) throw new Error(t('auth.noDatabase'));
      if (databases.length === 1) {
        finalDb = databases[0];
      } else {
        finalDb = await showDbSelectionDialog(databases);
        if (!finalDb) { setLoading(false); return; }
      }

      const response = await authAPI.login({ baseUrl: normalizedBaseUrl, db: finalDb, login, password });
      if (response.success) {
        toast.success(t('auth.loginSuccess'));
        localStorage.setItem('rememberMeBaseUrl', normalizedBaseUrl);
        localStorage.setItem('rememberMeDb', finalDb);
        if (rememberMe) {
          localStorage.setItem('rememberMeLogin', login);
        }
        router.push('/dashboard');
      } else {
        toast.error(response.message || t('auth.loginFailed'));
      }
    } catch (error: any) {
      toast.error(error.message || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={cn("flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700", className)} {...props}>
      <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(108,123,255,0.15)] rounded-[2rem]">
        <CardContent className="grid p-0 md:grid-cols-2">
          
          {/* Form Side */}
          <form className="p-6 md:p-10 bg-white dark:bg-card" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              
              {/* Header - Scaled down */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Shield className="h-8 w-8 text-primary"/>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-black tracking-tight gradient-text">{t('auth.welcome')}</h1>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-70">{t('auth.system')}</p>
                </div>
              </div>

              {/* Form Fields - Compacted */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    <Server size={12} className="text-primary"/> {t('auth.serverUrl')}
                  </Label>
                  <Input
                    required
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="example.odoo.com"
                    className="h-11 rounded-xl bg-muted/40 border-none focus:ring-2 focus:ring-primary/20 transition-all px-4"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    <Mail size={12} className="text-primary"/> {t('auth.user')}
                  </Label>
                  <Input
                    required
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="admin"
                    className="h-11 rounded-xl bg-muted/40 border-none px-4"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    <Lock size={12} className="text-primary"/> {t('auth.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-xl bg-muted/40 border-none px-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1 ml-1">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(c) => setRememberMe(!!c)}
                    className="h-4 w-4 rounded-md border-primary/20 data-[state=checked]:bg-primary"
                  />
                  <label htmlFor="rememberMe" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                    {t('auth.rememberMe')}
                  </label>
                </div>
              </div>

              {/* Submit - Compact */}
              <div className="space-y-4">
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold btn-gradient" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <div className="flex items-center gap-2"><LogIn size={18}/> {t('auth.login')}</div>}
                </Button>
                <div className="text-center">
                  <a href="#" className="text-xs font-bold text-primary/80 hover:text-primary transition-colors">{t('auth.forgotPassword')}</a>
                </div>
              </div>
            </div>
          </form>
          {/* Visual Side */}
          <div className="relative hidden md:flex flex-col items-center justify-center p-8 bg-muted/20 border-l border-border/40 overflow-hidden">
            {/* Арын Grid хээ */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] text-primary" />

            {/* Гол агуулга (Зураг болон Текст) */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-white dark:bg-card rounded-[2.5rem] shadow-xl rotate-[-2deg] border border-primary/5">
                <img src="/assets/login.svg" alt="ERP" className="w-52 h-52 object-contain" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">Ayan Hotel ERP</h2>
                <p className="text-sm text-muted-foreground font-medium max-w-[240px]">
                  {t('auth.tagline')}
                </p>
              </div>
            </div>

            {/* System Secure Badge - Зассан хувилбар */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-full border border-primary/10 shadow-sm transition-all hover:scale-105 select-none">
              {/* Анивчдаг ногоон цэг */}
              <div className="relative flex h-2 w-2">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">
                {t('auth.testEnvironment')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center space-y-2">
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
          {t('auth.copyright')} <span className="font-bold">Managewall LLC</span>
        </p>
      </footer>

      {/* Database Selection Dialog */}
      <Dialog open={isDbDialogOpen} onOpenChange={setIsDbDialogOpen}>
        {/* Дээд талын зайг хэмнэхийн тулд padding-ийг p-6 болгож багасгав */}
        <DialogContent className="rounded-[2rem] border-none p-6 max-w-sm max-h-[90vh] flex flex-col">
          <DialogHeader className="space-y-2 flex-shrink-0">
            <DialogTitle className="text-2xl font-black gradient-text text-center">
              {t('auth.selectDatabase')}
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-xs">
              {t('auth.selectDatabaseDesc')}
            </DialogDescription>
          </DialogHeader>

          {/* Scroll хийдэг хэсэг */}
          <div className="py-4 flex-1 overflow-hidden">
            <RadioGroup 
              value={selectedDb} 
              onValueChange={setSelectedDb} 
              className="gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar"
            >
              {dbList.map((db) => (
                <Label 
                  key={db} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                    selectedDb === db 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-muted bg-muted/20 hover:border-primary/20"
                  )}
                >
                  <RadioGroupItem value={db} className="sr-only" />
                  <Server 
                    size={16} 
                    className={selectedDb === db ? "text-primary" : "text-muted-foreground"}
                  />
                  <span className="font-bold text-sm truncate">{db}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Button 
            onClick={() => (window as any).resolveDbSelection(selectedDb)} 
            className="w-full h-12 rounded-xl font-bold btn-gradient mt-2 flex-shrink-0"
          >
            {t('auth.select')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}