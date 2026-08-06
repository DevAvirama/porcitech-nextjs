import React from 'react';
import BrandMark from '../BrandMark'; // Ajusta la ruta según tus archivos

export default function AuthSplitLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-900 text-white">

      {/* SECCIÓN IZQUIERDA: Formulario dinámico (Ocupa 5 de 12 columnas en pantallas grandes) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 bg-slate-950/50 backdrop-blur-md">

        {/* Encabezado con la marca que ya arreglamos */}
        <div className="flex items-center justify-between">
          <BrandMark />
        </div>

        {/* Contenido dinámico (Aquí caerá el Login o la Recuperación de contraseña automáticamente) */}
        <div className="w-full max-w-md mx-auto my-auto py-12">
          {children}
        </div>

        {/* Footer pequeño del login */}
        <div className="text-center lg:text-left text-xs text-slate-500">
          &copy; {new Date().getFullYear()} PorciTech. Todos los derechos reservados.
        </div>
      </div>

      {/* SECCIÓN DERECHA: Panel de diseño/imagen (Ocupa 7 de 12 columnas. Se oculta en celulares) */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-gradient-to-tr from-emerald-900 via-slate-900 to-pink-950 items-center justify-center overflow-hidden">

        {/* Decoración geométrica de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(244,63,94,0.05),transparent_50%)]" />

        {/* Mensaje de bienvenida flotante */}
        <div className="relative z-10 max-w-xl text-center p-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <span>🐖 PorciTech v2.0</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Gestión Inteligente y Sostenible
          </h1>
          <p className="text-lg text-slate-400 font-light">
            Optimiza el control biológico, nutrición y rendimiento de tu producción porcina en una sola plataforma.
          </p>
        </div>

        {/* Sutil cuadrícula de fondo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

    </div>
  );
}