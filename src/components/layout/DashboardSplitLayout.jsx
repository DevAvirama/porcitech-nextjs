import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function DashboardSplitLayout({ children }) {
  return (
    <div className="dashboard-shell min-h-screen flex bg-slate-100 text-slate-900">
      <DashboardSidebar />
      <main className="dashboard-main w-full flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
