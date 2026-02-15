"use client";

import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Calendar as CalendarIcon, Clock, X } from "lucide-react";

interface EditableCellProps {
  type: string;
  value: any;
  options?: string[];
  onChange: (value: any) => void;
  isMobile?: boolean;
}

export function EditableCell({ type, value, options, onChange, isMobile }: EditableCellProps) {
  const { t } = useLocale();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (type === "text" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, type]);

  const baseInputClass = cn(
    "w-full transition-all rounded-md bg-transparent border-transparent hover:border-border focus:border-primary outline-none",
    isMobile ? "h-11 border-border bg-background px-3" : "h-9 px-2 text-sm"
  );

// editable-cell.tsx доторх классыг ингэж сольж үзээрэй:
const dropdownContentClass = "z-[100] !opacity-100 bg-white dark:bg-slate-950 text-popover-foreground shadow-xl border border-border outline-none fill-mode-forwards";

  if (type === "boolean") {
    return (
      <div className={cn("flex items-center", isMobile ? "justify-end" : "justify-center h-full")}>
        <Checkbox
          checked={!!value}
          onCheckedChange={onChange}
          className="h-6 w-6 border-muted-foreground/30 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
        />
      </div>
    );
  }

  if (type === "selection") {
    return (
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className={baseInputClass}>
          <SelectValue placeholder={t("checklist.table.select")} />
        </SelectTrigger>
        <SelectContent className={dropdownContentClass}>
          {options?.map((opt) => (
            <SelectItem key={opt} value={opt} className="cursor-pointer">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === "time") {
    return (
      <div className={cn("flex items-center border rounded-md relative", baseInputClass)}>
        <Clock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full bg-transparent pl-8 outline-none cursor-pointer"
        />
      </div>
    );
  }

  if (type === "date") {
    const dateValue = value ? new Date(value) : undefined;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("justify-start font-normal", baseInputClass, !value && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{dateValue && !isNaN(dateValue.getTime()) ? format(dateValue, "yyyy-MM-dd") : t("checklist.table.date")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0", dropdownContentClass)} align="start">
          <Calendar mode="single" selected={dateValue} onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")} initialFocus />
        </PopoverContent>
      </Popover>
    );
  }

  if (type === "image") {
    return (
      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative group border rounded-md overflow-hidden shrink-0 bg-muted/20">
            <Dialog>
              <DialogTrigger asChild>
                <img src={value} className="h-10 w-10 object-cover cursor-zoom-in" alt="thumb" />
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0 bg-black/5 overflow-hidden">
                <DialogTitle className="sr-only">Preview</DialogTitle>
                <img src={value} className="w-full h-auto" alt="full" />
              </DialogContent>
            </Dialog>
            <button onClick={() => onChange(null)} className="absolute top-0 right-0 p-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className={cn("flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 rounded-md cursor-pointer w-full transition-all", isMobile ? "h-11" : "h-10 w-10")}>
            <ImagePlus className={cn("text-muted-foreground", isMobile ? "h-5 w-5 mr-2" : "h-4 w-4")} />
            {isMobile && <span className="text-sm font-medium text-muted-foreground">{t("checklist.table.image")}</span>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => onChange(reader.result);
                reader.readAsDataURL(file);
              }
            }} />
          </label>
        )}
      </div>
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
      placeholder={t("checklist.table.write")}
      className={cn(baseInputClass, "resize-none py-1.5 leading-relaxed min-h-[36px]", isMobile && "min-h-[80px]")}
    />
  );
}