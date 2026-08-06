"use client";

import React, { useEffect } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Critical execution breakdown captured by root global-error:", error);
  }, [error]);

  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 text-center rounded-3xl shadow-2xl space-y-6">
          <div className="mx-auto p-4 bg-red-500/10 text-red-400 rounded-2xl w-fit border border-red-500/20">
            <ShieldAlert className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
              Error Crítico de Sistema
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              La plataforma ha sufrido un fallo crítico en su estructura base. Por favor, reintenta iniciar la aplicación.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-black/40 border border-slate-800 rounded-2xl text-left text-xs font-mono text-slate-450 max-h-32 overflow-y-auto break-all">
              <strong>Error:</strong> {error.message || error.toString()}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-5 py-3 font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer border-none"
            >
              <RefreshCw size={16} /> Reiniciar Aplicación
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
