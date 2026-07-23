import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({ children }) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full flex-col xl:flex-row">
        <DashboardSidebar />
        <section className="flex-1 px-6 py-8 lg:px-10 overflow-y-auto">
          {children}
        </section>
      </div>
    </main>
  );
}
