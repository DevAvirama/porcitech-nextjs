import BrandMark from '../../../../components/BrandMark.jsx'

function ForgotPasswordShowcase() {
  return (
    <>
      <BrandMark light />
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
          Recuperación
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight">
          ¿Problemas para acceder a tu cuenta?
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Ingresa tu dirección de correo electrónico y te enviaremos las instrucciones paso a paso para que puedas configurar una nueva contraseña y continuar trabajando.
        </p>
      </div>
      <div className="flex-1"></div>
    </>
  )
}

export default ForgotPasswordShowcase
