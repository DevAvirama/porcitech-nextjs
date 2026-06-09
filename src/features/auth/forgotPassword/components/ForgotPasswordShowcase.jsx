export default function ForgotPasswordShowcase() {
  return (
    <div className="relative h-full flex flex-col justify-center items-center p-12 text-center text-white bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.05),transparent_60%)] pointer-events-none" />
      <div className="space-y-6 max-w-sm relative z-20">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-rose-500 shadow-lg">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-zinc-100">Seguridad de la Cuenta</h3>
          <p className="text-sm text-zinc-400">
            Nuestros protocolos garantizan que tu acceso esté seguro. Si tienes problemas, ponte en contacto con soporte técnico del SENA.
          </p>
        </div>
      </div>
    </div>
  );
}
