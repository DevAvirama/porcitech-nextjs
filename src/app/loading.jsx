export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-zinc-400">Cargando Sistema Integral Porcino...</p>
      </div>
    </div>
  );
}
