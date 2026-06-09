import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.1),transparent_50%)] pointer-events-none" />
        <h1 className="text-9xl font-black text-rose-500/20">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Página No Encontrada</h2>
        </div>
      </div>
      <p className="mt-4 text-zinc-400 max-w-sm">
        La ruta que intentas acceder no existe en el Sistema Integral Porcino.
      </p>
      <Link
        href="/"
        className="mt-8 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white shadow transition-all"
      >
        Volver al Inicio
      </Link>
    </main>
  );
}
