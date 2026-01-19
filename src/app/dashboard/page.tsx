// app/(dashboard)/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, TrendingUp, AlertCircle } from "lucide-react";

const stats = [
  { label: "Нийт ажилчид", value: "124", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Идэвхтэй төсөл", value: "12", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Борлуулалт /сараар/", value: "₮45.2M", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
  { label: "Шийдвэрлэх хүсэлт", value: "5", icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Мэндчилгээ */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Өдрийн мэнд! 👋</h1>
        <p className="text-muted-foreground text-sm">Өнөөдрийн байдлаар системийн ерөнхий үзүүлэлтүүд ийм байна.</p>
      </div>

      {/* Статистик картууд */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {item.label}
              </CardTitle>
              <div className={cn("p-2 rounded-xl", item.bg)}>
                <item.icon className={cn("h-4 w-4", item.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Энд нэмэлт графикууд эсвэл хүснэгт байрлуулж болно */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 rounded-3xl border-none shadow-sm h-[300px] flex items-center justify-center text-muted-foreground italic">
          Төслийн явцын график энд харагдана
        </Card>
        <Card className="md:col-span-3 rounded-3xl border-none shadow-sm h-[300px] flex items-center justify-center text-muted-foreground italic">
          Сүүлийн үйлдлүүд
        </Card>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";