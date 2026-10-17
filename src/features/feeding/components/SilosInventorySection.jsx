"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { Database } from "lucide-react";

export default function SilosInventorySection({ feedItems = [] }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Database className="text-blue-500 w-5 h-5" />
          Disponibilidad en Almacén y Silos
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          Sincronizado con inventario PostgreSQL
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {feedItems.slice(0, 4).map((feed) => {
          const actual = Number(feed.stock_actual) || 0;
          const minimo = Number(feed.stock_minimo) || 0;
          const isLow = actual <= minimo;

          return (
            <Card
              key={feed.id}
              className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {feed.codigo_sku}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isLow
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {isLow ? "Bajo Stock" : "Disponible"}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">
                  {feed.nombre}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ubicación: {feed.ubicacion_bodega || "Bodega Central"}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900">
                    {actual.toLocaleString("es-CO")}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold ml-1">
                    {feed.unidad_medida}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Mín: {minimo}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
