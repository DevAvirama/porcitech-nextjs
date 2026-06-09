import StatsGrid from "@/features/dashboard/components/StatsGrid";
import QuickActions from "@/features/dashboard/components/QuickActions";
import RecentActivityTable from "@/features/dashboard/components/RecentActivityTable";
import SystemSuggestion from "@/features/dashboard/components/SystemSuggestion";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Panel de Control</h1>
        <p className="text-zinc-400 text-sm">Resumen analítico del estado del sistema porcino.</p>
      </div>

      <StatsGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentActivityTable />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <SystemSuggestion />
        </div>
      </div>
    </div>
  );
}
