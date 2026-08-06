import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
