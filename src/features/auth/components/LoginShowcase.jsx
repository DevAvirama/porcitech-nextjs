import BrandMark from '../../../components/BrandMark.jsx'

function LoginShowcase() {
  return (
    <div className="flex flex-col items-center gap-16 text-center">
      <BrandMark light />
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
          Acceso seguro
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight">
          Bienvenido al Sistema Integral de Gestion Porcina
        </h1>
      </div>
    </div>
  )
}

export default LoginShowcase
