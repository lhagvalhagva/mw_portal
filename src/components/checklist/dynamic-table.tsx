"use client"

import React, { useState, useEffect } from "react"
import { EditableCell } from "./editable-cell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Save, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Column {
    name: string
    type: string
    options?: string[]
}

interface DynamicTableProps {
    initialData: { columns: Column[]; rows: any[] }
    onSave?: (rows: any[]) => void
    onSubmit?: (rows: any[]) => void
    readOnly?: boolean
}

export function DynamicTable({ initialData, onSave, onSubmit, readOnly = false }: DynamicTableProps) {
    const [rows, setRows] = useState(initialData.rows)
    const columns = initialData.columns

    useEffect(() => { setRows(initialData.rows) }, [initialData])

    const handleUpdate = (rowIndex: number, colName: string, newValue: any) => {
        if (readOnly) return
        const updatedRows = [...rows]
        updatedRows[rowIndex] = { ...updatedRows[rowIndex], [colName]: newValue }
        setRows(updatedRows)
    }

    return (
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 px-6">
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Шалгах хуудас</CardTitle>
                    <CardDescription>Мэдээллийг үнэн зөв бөглөнө үү</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* DESKTOP VIEW */}
                <div className="hidden md:block overflow-auto max-h-[calc(100vh-300px)] border-t custom-scrollbar">
                    <table className="table-auto w-full text-sm text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20 bg-white dark:bg-slate-950">
                            <tr>
                                <th className="px-4 py-4 w-12 text-center border-b font-bold text-muted-foreground text-[11px] uppercase tracking-wider bg-inherit">№</th>
                                {columns.map(col => col.name !== '№' && (
                                    <th key={col.name} className="px-6 py-4 min-w-[180px] max-w-[350px] border-b border-l first:border-l-0 font-bold text-muted-foreground text-[11px] uppercase tracking-wider bg-inherit whitespace-normal break-words leading-tight">
                                        {col.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y bg-background">
                            {rows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-4 py-4 text-center text-muted-foreground bg-muted/5 font-medium border-r border-b align-top">{idx + 1}</td>
                                    {columns.map(col => col.name !== '№' && (
                                        <td key={col.name} className="px-2 py-2 border-l border-b first:border-l-0 align-top whitespace-normal break-words">
                                            <EditableCell type={col.type} value={row[col.name]} options={col.options} onChange={(val) => handleUpdate(idx, col.name, val)} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE VIEW */}
                <div className="md:hidden space-y-4 p-4 bg-muted/20">
                    {rows.map((row, idx) => (
                        <div key={idx} className="bg-card border rounded-xl shadow-sm overflow-hidden">
                            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 border-b flex justify-between items-center">
                                <span className="font-bold text-primary">#{idx + 1}</span>
                                <span className="text-xs font-semibold truncate ml-4 text-muted-foreground uppercase">{String(row[columns[0]?.name] || "")}</span>
                            </div>
                            <div className="p-4 space-y-5">
                                {columns.map(col => col.name !== '№' && (
                                    <div key={col.name} className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{col.name}</label>
                                        <EditableCell type={col.type} value={row[col.name]} options={col.options} isMobile onChange={(val) => handleUpdate(idx, col.name, val)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* ACTION BAR */}
            {!readOnly && (
                <div className="p-4 bg-background/80 backdrop-blur-md border-t flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onSave?.(rows)}><Save className="w-4 h-4 mr-2" /> Хадгалах</Button>
                    <Button className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" onClick={() => onSubmit?.(rows)}><Send className="w-4 h-4 mr-2" /> Дуусгах</Button>
                </div>
            )}
        </Card>
    )
}