import Link from 'next/link'
import BrandMark from '../BrandMark.jsx'
import Button from '../ui/Button.jsx'

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <BrandMark />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex">
          <a href="#inicio" className="transition hover:text-slate-950">
            Inicio
          </a>
          <a href="#caracteristicas" className="transition hover:text-slate-950">
            Caracteristicas
          </a>
          <a href="#impacto" className="transition hover:text-slate-950">
            Impacto
          </a>
        </nav>
         <Link href="/login">
          <Button className="rounded-full px-8 py-2 text-sm">
            Acceder
          </Button>
        </Link>
      </div>
    </header>
  )
}

