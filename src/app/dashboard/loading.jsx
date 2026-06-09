import Skeleton from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-zinc-800"></div>
        <div className="h-4 w-72 rounded bg-zinc-800"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-24 rounded bg-zinc-800"></div>
        <div className="h-24 rounded bg-zinc-800"></div>
        <div className="h-24 rounded bg-zinc-800"></div>
        <div className="h-24 rounded bg-zinc-800"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded bg-zinc-800"></div>
        <div className="h-96 rounded bg-zinc-800"></div>
      </div>
    </div>
  );
}
