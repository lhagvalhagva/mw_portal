"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { useLocale } from "@/contexts/LocaleContext";

type ColumnType = "text" | "boolean" | "time" | "many2one" | "selection" | "image" | "date";

type JsonTable = {
  rows: Record<string, any>[];
  columns: { name: string; type: ColumnType; options?: string[]; model?: string }[];
};

type DepartmentDetail = {
  id: number;
  date: string;
  json_data: JsonTable | string;
};

type Props = {
  baseUrl: string;
  jobId?: number;
  configId?: number;
  getDepartmentDetail?: (baseUrl: string, id: number) => Promise<{ success: boolean; data?: any; message?: string }>;
  getDepartmentConfigChart?: (baseUrl: string, configId: number) => Promise<{ success: boolean; data?: any; message?: string }>;
};

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeParseJsonData(json_data: any): JsonTable | null {
  if (!json_data) return null;
  if (typeof json_data === "string") {
    try {
      return JSON.parse(json_data);
    } catch {
      return null;
    }
  }
  return json_data as JsonTable;
}

function normalizeRowDate(row: Record<string, any>, fallbackDate?: string) {
  const d = row["__job_date"];
  if (typeof d === "string" && d.length >= 10) return d.slice(0, 10);
  return fallbackDate?.slice(0, 10) || "";
}

function inRange(dateISO: string, fromISO: string, toISO: string) {
  if (!dateISO) return false;
  return dateISO >= fromISO && dateISO <= toISO;
}

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

type ChartKind = "auto" | "bar" | "line" | "stacked";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DepartmentChecklistChartWidget({
  baseUrl,
  jobId,
  configId,
  getDepartmentDetail,
  getDepartmentConfigChart,
}: Props) {
  const { t } = useLocale();
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState<string>(() => toISODate(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState<string>(() => toISODate(today));
  const [metric, setMetric] = useState<string>("");
  const [chartKind, setChartKind] = useState<ChartKind>("auto");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [detail, setDetail] = useState<DepartmentDetail | null>(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      let res;
      if (configId && getDepartmentConfigChart) {
        res = await getDepartmentConfigChart(baseUrl, configId);
        if (res.success && res.data) {
          const configData = res.data as any;
          setDetail({
            id: configData.config_id || 0,
            date: '',
            json_data: {
              columns: configData.columns || [],
              rows: configData.rows || []
            }
          });
        } else {
          setErr(res.message || t('checklist.chart.loadError'));
          setDetail(null);
          return;
        }
      } else if (jobId && getDepartmentDetail) {
        res = await getDepartmentDetail(baseUrl, jobId);
        if (!res.success) {
          setErr(res.message || t('checklist.chart.loadError'));
          setDetail(null);
          return;
        }
        setDetail(res.data as DepartmentDetail);
      } else {
        setErr(t('checklist.chart.missingParams'));
        setDetail(null);
        return;
      }
    } catch (e: any) {
      setErr(e?.message || t('checklist.chart.networkError'));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }

  const table = useMemo(() => safeParseJsonData(detail?.json_data), [detail]);

  const metricColumns = useMemo(() => {
    const cols = table?.columns || [];
    return cols.filter((c) => c.type !== "text" && c.type !== "image");
  }, [table]);

  useEffect(() => {
    if (!metric && metricColumns.length) setMetric(metricColumns[0].name);
  }, [metric, metricColumns]);

  const metricMeta = useMemo(() => {
    if (!table) return null;
    return table.columns.find((c) => c.name === metric) || null;
  }, [table, metric]);

  type RowWithDate = Record<string, any> & { __date: string };
  const filteredRows = useMemo((): RowWithDate[] => {
    if (!table) return [];
    const fallbackDate = detail?.date;
    return table.rows
      .map((r) => ({ ...r, __date: normalizeRowDate(r, fallbackDate) }))
      .filter((r) => inRange(r.__date, from, to));
  }, [table, detail, from, to]);

  const { series, keys, suggestedKind } = useMemo(() => {
    const meta = metricMeta;
    if (!meta) return { series: [] as any[], keys: [] as string[], suggestedKind: "bar" as ChartKind };

    const type = meta.type;
    const map = new Map<string, any>();

    const ensureBucket = (dateISO: string) => {
      if (!map.has(dateISO)) map.set(dateISO, { date: dateISO });
      return map.get(dateISO);
    };

    const dynKeys = new Set<string>();

    for (const r of filteredRows) {
      const day = r.__date;
      if (!day) continue;
      const bucket = ensureBucket(day);

      if (type === "boolean") {
        const v = !!r[meta.name];
        bucket.value = (bucket.value ?? 0) + (v ? 1 : 0);
        bucket.total = (bucket.total ?? 0) + 1;
      }

      if (type === "date") {
        bucket.value = (bucket.value ?? 0) + 1;
      }

      if (type === "selection") {
        const v = r[meta.name];
        const label = typeof v === "string" && v.length ? v : "null";
        bucket[label] = (bucket[label] ?? 0) + 1;
        dynKeys.add(label);
      }

      if (type === "many2one") {
        const v = r[meta.name];
        const label = Array.isArray(v) ? String(v[1]) : String(v ?? "null");
        bucket[label] = (bucket[label] ?? 0) + 1;
        dynKeys.add(label);
      }

      if (type === "time") {
        const t = r[meta.name];
        if (typeof t === "string" && t.includes(":")) {
          const [hh, mm] = t.split(":").map((x: string) => Number(x));
          const minutes = (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0);
          bucket.sum = (bucket.sum ?? 0) + minutes;
        }
      }
    }

    const out = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    const outKeys = Array.from(dynKeys);

    let sk: ChartKind = "bar";
    if (type === "boolean" || type === "date") sk = "bar";
    if (type === "time") sk = "line";
    if (type === "selection" || type === "many2one") sk = "stacked";

    return { series: out, keys: outKeys, suggestedKind: sk };
  }, [filteredRows, metricMeta]);

  const kindToRender: ChartKind = chartKind === "auto" ? suggestedKind : chartKind;
  const dataKey = metricMeta?.type === "time" ? "sum" : "value";
  const isTimeType = metricMeta?.type === "time";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t('chart.from')}</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t('chart.to')}</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t('chart.metric')}</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm min-w-[140px]"
          >
            {metricColumns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t('chart.type')}</label>
          <select
            value={chartKind}
            onChange={(e) => setChartKind(e.target.value as ChartKind)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="auto">{t('chart.type.auto')}</option>
            <option value="bar">{t('chart.type.bar')}</option>
            <option value="line">{t('chart.type.line')}</option>
            <option value="stacked">{t('chart.type.stacked')}</option>
          </select>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="h-9 rounded-lg border border-input bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? t('chart.loading') : t('chart.load')}
        </button>
        {err ? <span className="text-sm text-destructive">{err}</span> : null}
      </div>

      <div className="mt-4 h-[360px]">
        {!detail ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('chart.noData')}
          </div>
        ) : !table ? (
          <div className="flex h-full items-center justify-center text-sm text-destructive">
            {t('chart.parseError')}
          </div>
        ) : series.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('chart.noDataInRange')}
          </div>
        ) : kindToRender === "line" ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis 
                className="text-xs" 
                tickFormatter={isTimeType ? (val) => formatMinutesToTime(val) : undefined}
              />
              <Tooltip 
                contentStyle={{ borderRadius: 8 }} 
                formatter={isTimeType ? (val: any) => formatMinutesToTime(val) : undefined}
              />
              <Legend />
              <Line type="monotone" dataKey={dataKey} stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} name={metric} />
            </LineChart>
          </ResponsiveContainer>
        ) : kindToRender === "stacked" && keys.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis 
                className="text-xs" 
                tickFormatter={isTimeType ? (val) => formatMinutesToTime(val) : undefined}
              />
              <Tooltip 
                contentStyle={{ borderRadius: 8 }} 
                formatter={isTimeType ? (val: any) => formatMinutesToTime(val) : undefined}
              />
              <Legend />
              {keys.map((k, i) => (
                <Bar key={k} dataKey={k} stackId="s" fill={CHART_COLORS[i % CHART_COLORS.length]} name={k} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis 
                className="text-xs" 
                tickFormatter={isTimeType ? (val) => formatMinutesToTime(val) : undefined}
              />
              <Tooltip 
                contentStyle={{ borderRadius: 8 }} 
                formatter={isTimeType ? (val: any) => formatMinutesToTime(val) : undefined}
              />
              <Legend />
              <Bar dataKey={dataKey} fill={CHART_COLORS[0]} name={metric} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {detail && metricMeta?.type === "boolean" ? (
        <p className="mt-2 text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('checklist.chart.booleanMetric') }} />
      ) : null}
    </div>
  );
}
