"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { QrCode, Scale, Plus } from "lucide-react";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";

export default function AnimalProfileHeader({
  animal = {},
  isMacho = false,
  isSemental = false,
  tratamientos = [],
  onOpenQrModal,
  onNavigateWeight,
  onNavigateHealth,
}) {
  return (
    <Card className="p-8! border border-slate-100 bg-white rounded-4xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100">
            <span className="text-3xl font-black text-indigo-300">
              🐷
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {getAnimalDisplayName(animal)}
              </h3>
              {animal.codigo_arete && !UUID_REGEX.test(animal.codigo_arete) && (
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                  #{animal.codigo_arete}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {isMacho ? (
                <>
                  Propósito zootécnico:{" "}
                  <span className="font-bold text-slate-800">
                    {isSemental ? "Semental Reproductor" : "Línea de Ceba / Levante"}
                  </span>
                </>
              ) : (
                <>
                  Historial reproductivo:{" "}
                  <span className="font-bold text-slate-800">{animal.estadoReproductivo}</span>
                </>
              )}
            </p>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Último tratamiento:{" "}
              <span className={tratamientos.length > 0 ? "font-bold text-slate-800" : "italic text-slate-500"}>
                {animal.ultimoTratamiento}
              </span>
            </p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-col gap-3 min-w-50 w-full md:w-auto">
          <Button
            onClick={onOpenQrModal}
            className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl! shadow-md border-none cursor-pointer"
          >
            <QrCode size={16} /> Ver / Imprimir Chapeta QR
          </Button>
          <Button
            onClick={onNavigateWeight}
            className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl! shadow-md border-none cursor-pointer"
          >
            <Scale size={16} /> Registrar Pesaje
          </Button>
          <Button
            onClick={onNavigateHealth}
            className="w-full justify-start gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl! border border-slate-200 shadow-none cursor-pointer"
          >
            <Plus size={16} /> Añadir Tratamiento
          </Button>
        </div>
      </div>
    </Card>
  );
}
