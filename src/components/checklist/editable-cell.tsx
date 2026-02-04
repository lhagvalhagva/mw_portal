"use client"

import React, { useEffect, useRef } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// UI Components
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Icons
import { ImagePlus, Calendar as CalendarIcon, Clock, X, Maximize2 } from "lucide-react"

interface EditableCellProps {
    type: string
    value: any
    options?: string[]
    onChange: (value: any) => void
    isMobile?: boolean
}

export function EditableCell({ type, value, options, onChange, isMobile }: EditableCellProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const solidPopoverStyles = "z-[100] bg-white dark:bg-slate-950 opacity-100 shadow-xl border border-border p-0"

    useEffect(() => {
        if (type === 'text' && textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [value, type])

    const baseInputStyles = cn(
        "bg-transparent border-transparent hover:border-border focus:border-primary transition-all rounded-md w-full",
        isMobile ? "h-11 border-border bg-background px-3" : "h-9 px-2 text-sm"
    )

    switch (type) {
        case 'boolean':
            return (
                <div className={cn("flex items-center", isMobile ? "justify-end" : "justify-center h-full")}>
                    <Checkbox
                        checked={!!value}
                        onCheckedChange={onChange}
                        className="h-6 w-6 rounded-md border-muted-foreground/30 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                </div>
            )

        case 'selection':
            return (
                <Select value={value || ""} onValueChange={onChange}>
                    <SelectTrigger className={baseInputStyles}>
                        <SelectValue placeholder="Сонгох..." />
                    </SelectTrigger>
                    <SelectContent className={solidPopoverStyles}>
                        {options?.map((opt) => (
                            <SelectItem key={opt} value={opt} className="cursor-pointer">
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )

        case 'time':
            return (
                <div className="relative group w-full">
                    <div className={cn("flex items-center border rounded-md relative overflow-hidden", baseInputStyles)}>
                        <Clock className="absolute left-3 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                        <input
                            type="time"
                            value={value || ""} // null/empty үед хөтөч автоматаар --:-- харуулна
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full h-full bg-transparent pl-9 pr-3 outline-none text-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0"
                        />
                    </div>
                </div>
            )

        case 'date':
            const dateValue = value ? new Date(value) : undefined
            return (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("justify-start text-left font-normal px-2", baseInputStyles, !value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">{dateValue && !isNaN(dateValue.getTime()) ? format(dateValue, "yyyy-MM-dd") : "Огноо"}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={solidPopoverStyles} align="start">
                        <Calendar mode="single" selected={dateValue} onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")} initialFocus />
                    </PopoverContent>
                </Popover>
            )

        case 'image':
            return (
                <div className="flex items-center gap-2">
                    {value ? (
                        // Зураг сонгогдсон үед харагдах хэсэг (Preview & Delete)
                        <div className="relative group/img flex shrink-0 border rounded-md overflow-hidden bg-muted/30">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <img src={value} className="h-10 w-10 object-cover cursor-zoom-in" alt="thumb" />
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
                                    <DialogTitle className="sr-only">Preview</DialogTitle>
                                    <img src={value} className="w-full h-auto rounded-lg shadow-2xl" alt="full" />
                                </DialogContent>
                            </Dialog>
                            <button
                                onClick={() => onChange(null)}
                                className="absolute top-0 right-0 p-1 bg-black/50 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-destructive"
                                type="button" // button type зааж өгөх нь зөв
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        // Зураг сонгох товч (Label & Input)
                        <label className={cn(
                            "flex items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 rounded-md cursor-pointer transition-all active:scale-95",
                            isMobile ? "w-full h-11" : "h-10 w-10"
                        )}>
                            {/* Mobile дээр "Зураг дарах/сонгох" гэсэн текст нэмбэл илүү ойлгомжтой */}
                            {isMobile ? (
                                <span className="flex items-center gap-2 text-muted-foreground font-medium">
                                    <ImagePlus className="h-5 w-5" />
                                    <span className="text-sm">Зураг оруулах</span>
                                </span>
                            ) : (
                                <ImagePlus className="h-4 w-4 text-muted-foreground" />
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                multiple={false}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        // Файлын хэмжээг шалгах (сонголтоор)
                                        // if (file.size > 5 * 1024 * 1024) { alert("Зураг хэт том байна (max 5MB)"); return; }

                                        const reader = new FileReader();
                                        reader.onloadend = () => onChange(reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    )}
                </div>
            )

        case 'text':
        default:
            return (
                <textarea
                    ref={textareaRef}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    rows={1}
                    placeholder="Бичих..."
                    className={cn(
                        "resize-none outline-none focus:ring-2 focus:ring-primary/10 rounded-md py-1.5 leading-relaxed overflow-hidden whitespace-pre-wrap break-words overflow-wrap-anywhere w-full",
                        baseInputStyles,
                        isMobile ? "min-h-[80px] h-auto" : "min-h-[36px] h-auto"
                    )}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                />
            )
    }
}