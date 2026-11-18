import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function DashboardSplitLayout({ children }) {
  return (
    <div className="dashboard-shell min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-slate-100 text-slate-900">
      <DashboardSidebar />
      <main className="dashboard-main w-full flex-1 min-w-0 lg:h-screen px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col gap-6 overflow-x-hidden lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
