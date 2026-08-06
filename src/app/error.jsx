"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function RootError({ error, reset }) {
  useEffect(() => {
    console.error("Root execution boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6 font-sans">
      <Card className="max-w-md w-full bg-white border border-slate-100 p-8 text-center rounded-3xl shadow-xl space-y-6">
        <div className="mx-auto p-4 bg-rose-50 text-rose-505 text-rose-500 rounded-2xl w-fit">
          <AlertTriangle className="h-10 w-10 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
            Ocurrió un inconveniente insospechado
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            El sistema ha detectado una excepción inesperada durante la carga de este componente.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-left text-xs font-mono text-slate-600 max-h-32 overflow-y-auto break-all">
            <strong>Detalle Técnico:</strong> {error.message || error.toString()}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => reset()}
            tone="primary"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Reintentar
          </Button>
          <Button
            as="a"
            to="/"
            tone="soft"
            className="flex-1"
          >
            Ir a Inicio
          </Button>
        </div>
      </Card>
    </div>
  );
}
