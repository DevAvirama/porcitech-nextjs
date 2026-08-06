"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error("Dashboard segment error captured:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-xl w-full bg-white border border-slate-100 p-10 text-center rounded-3xl shadow-lg space-y-6">
        <div className="mx-auto p-4 bg-orange-50 text-orange-500 rounded-2xl w-fit">
          <AlertCircle className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
            Error en la sección del Dashboard
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
            Hubo un error cargando los datos de este módulo. Por favor, intenta de nuevo o regresa al resumen del panel.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-left text-xs font-mono text-slate-600 max-h-32 overflow-y-auto break-all">
            <strong>Excepción:</strong> {error.message || error.toString()}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <Button
            onClick={() => reset()}
            tone="primary"
            className="flex items-center justify-center gap-2 px-6"
          >
            <RefreshCw size={16} /> Reintentar Carga
          </Button>
          <Button
            as="a"
            to="/dashboard"
            tone="soft"
            className="flex items-center justify-center gap-2 px-6"
          >
            <LayoutDashboard size={16} /> Panel Principal
          </Button>
        </div>
      </Card>
    </div>
  );
}
