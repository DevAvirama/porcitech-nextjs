import Card from "@/components/ui/Card";
import StatsGrid from "../components/StatsGrid";
import QuickActions from "../components/QuickActions";
import RecentActivityTable from "../components/RecentActivityTable";
import SystemSuggestion from "../components/SystemSuggestion";
import { getDashboardData } from "@/services/dashboard/dashboardService";

export default function DashboardHomeView() {
  const { stats, quickActions, recentActivity } = getDashboardData();

  return (
    <div className="space-y-6">
      {/* HEADER DE BIENVENIDA / LOTE DESTACADO */}
      <Card
        as="header"
        className="flex flex-col gap-4 mb-8 rounded-[2rem] lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Dashboard general
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Resumen de información clave
          </h1>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <p className="text-sm text-slate-400">Lote destacado</p>
          <p className="mt-1 text-xl font-black">Lote #42</p>
        </div>
      </Card>

      {/* SECCIÓN DE ESTADÍSTICAS Y MÉTRICAS */}
      <StatsGrid stats={stats} />

      {/* ACCIONES RÁPIDAS */}
      <QuickActions actions={quickActions} />

      {/* TABLA DE ACTIVIDAD Y SUGERENCIA DEL SISTEMA */}
      <section className="mt-6 grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <RecentActivityTable rows={recentActivity} />
        <SystemSuggestion />
      </section>
    </div>
  );
}
