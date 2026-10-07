import React from "react";

/**
 * Componente Skeleton para renderizar estados de carga estructurales en PorciTech.
 * Puede utilizarse con className para bloques individuales o sin propiedades
 * para renderizar la estructura modular completa de una pantalla.
 */
export default function Skeleton({ className = "", children, ...props }) {
  if (className) {
    return (
      <div
        className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Estructura modular por defecto (cabecera + métricas + tabla)
  return (
    <div className="w-full space-y-6 animate-pulse" {...props}>
      {/* Header skeleton */}
      <div className="h-24 w-full rounded-3xl bg-slate-200/80" />

      {/* KPIs skeleton */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 rounded-3xl bg-slate-200/80" />
        ))}
      </div>

      {/* Main body skeleton */}
      <div className="h-72 w-full rounded-3xl bg-slate-200/80" />
    </div>
  );
}

