"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6 font-sans">
      <Card className="max-w-md w-full bg-white border border-slate-100 p-10 text-center rounded-3xl shadow-xl space-y-8">
        
        {/* Stylized pig-shaped vector icon representation */}
        <div className="mx-auto w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 relative">
          <svg
            className="w-16 h-16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Pig Face snout & ears simplified */}
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
            <path d="M10 12h.01" />
            <path d="M14 12h.01" />
            <path d="M8 8c-.5-1.5-2-2-3.5-1.5" />
            <path d="M16 8c.5-1.5 2-2 3.5-1.5" />
            <path d="M9 17c1.5 1 4.5 1 6 0" />
          </svg>
          <span className="absolute bottom-2 right-2 bg-emerald-500 text-white rounded-full p-1 text-xs font-black shadow-md">
            404
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Página no encontrada
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            El enlace al que intentas acceder no existe, ha sido trasladado de ubicación o no posees los privilegios necesarios.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            to="/dashboard"
            tone="primary"
            className="w-full text-center font-bold"
          >
            Volver al Dashboard
          </Button>
          <Button
            to="/"
            tone="soft"
            className="w-full text-center"
          >
            Regresar a la Landing
          </Button>
        </div>
      </Card>
    </div>
  );
}
