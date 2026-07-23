import { ShieldCheck, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";

const DEFAULT_STATS = [
  {
    title: "Total de cerdos",
    value: 1500,
    detail: "+2.5%",
    width: "w-[88%]",
    tone: "bg-emerald-500",
  },
  {
    title: "Cerdos en crecimiento",
    value: 1200,
    detail: "80% del total",
    width: "w-[80%]",
    tone: "bg-sky-500",
  },
  {
    title: "Listos para venta",
    value: 300,
    detail: "20% del total",
    width: "w-[35%]",
    tone: "bg-amber-400",
  },
];

export default function StatsGrid({ stats = DEFAULT_STATS }) {
  return (
    <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {stat.title}
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="text-4xl font-black text-slate-950">
              {typeof stat.value === "number"
                ? stat.value.toLocaleString()
                : stat.value}
            </p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {stat.detail}
            </span>
          </div>
          <div className="mt-5 h-3 rounded-full bg-slate-100">
            <div className={`h-3 rounded-full ${stat.tone} ${stat.width}`}></div>
          </div>
        </Card>
      ))}

      <Card>
        <div className="flex items-start justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Rendimiento Crecimiento
          </p>
          <div className="rounded-xl bg-blue-100 p-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="text-4xl font-black text-slate-950">
            820<span className="text-lg text-slate-500 font-bold">g/d</span>
          </p>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            Óptimo
          </span>
        </div>

        {/* Sparkline Comparativa */}
        <div className="mt-4 h-10 w-full relative overflow-hidden rounded-lg">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,80 33,60 66,35 100,5"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="8 8"
              className="opacity-50"
            />
            <polyline
              points="0,90 33,70 66,45 100,10"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Cumplimiento Sanitario
          </p>
          <div className="rounded-xl bg-emerald-100 p-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="text-4xl font-black text-slate-950">85%</p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            ICA
          </span>
        </div>
        <div className="mt-5 h-3 rounded-full bg-slate-100">
          <div className="h-3 w-[85%] rounded-full bg-emerald-500"></div>
        </div>
      </Card>
    </section>
  );
}
