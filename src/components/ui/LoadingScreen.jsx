"use client";

import React from "react";

export default function LoadingScreen({ message = "Verificando sesión segura..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Anillo de carga giratorio */}
        <div className="absolute w-full h-full border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        {/* Ícono central de la plataforma */}
        <span className="text-3xl select-none">🐷</span>
      </div>

      <div className="mt-6 text-center space-y-1">
        <h3 className="text-lg font-bold tracking-wider text-emerald-400">
          PorciTech
        </h3>
        <p className="text-xs text-slate-400 font-medium tracking-wide animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
