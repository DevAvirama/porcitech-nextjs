import Link from "next/link";
import BrandMark from "../BrandMark";

export default function PublicHeader() {
  return (
    <header className="w-full bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <BrandMark />
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
            Iniciar Sesión
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white transition-colors"
          >
            Acceder al Sistema
          </Link>
        </nav>
      </div>
    </header>
  );
}
