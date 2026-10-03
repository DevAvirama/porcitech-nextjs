"use client";

import React from "react";
import Table from "../../../components/ui/Table";
import AnimalStatusBadge from "./AnimalStatusBadge";
import { QrCode, FileText } from "lucide-react";
import Link from "next/link";

const AnimalTable = ({
  animals = [],
  onDelete,
  isTrash = false,
  onRecover,
  onPermanentDelete,
  onOpenQr,
}) => {
  const columns = [
    {
      key: "arete",
      header: "ARETE / IDENTIFICACIÓN",
      render: (row) => {
        const arete = row.codigo_arete || row.id || "N/A";
        return (
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 tracking-tight">
              #{arete}
            </span>
            {row.nombre_alias && (
              <span className="text-xs text-slate-500 italic">
                &ldquo;{row.nombre_alias}&rdquo;
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "corral",
      header: "CORRAL / UBICACIÓN",
      render: (row) => {
        const ubicacion =
          row.corral_codigo ||
          row.corral?.codigo ||
          row.lote ||
          "Sin asignar";
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80">
            {ubicacion}
          </span>
        );
      },
    },
    {
      key: "raza",
      header: "RAZA",
      render: (row) => (
        <span className="text-sm font-medium text-slate-700">
          {row.raza || "No especificada"}
        </span>
      ),
    },
    {
      key: "sexo",
      header: "SEXO",
      render: (row) => {
        const isMacho = String(row.sexo).toLowerCase() === "macho";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${
              isMacho
                ? "bg-sky-50 text-sky-700 border border-sky-200"
                : "bg-pink-50 text-pink-700 border border-pink-200"
            }`}
          >
            {isMacho ? "♂ Macho" : "♀ Hembra"}
          </span>
        );
      },
    },
    {
      key: "peso",
      header: "PESO ACTUAL",
      render: (row) => {
        const peso = row.peso_actual_kg ?? row.peso;
        return (
          <span className="text-sm font-semibold text-slate-800">
            {peso !== undefined && peso !== null ? `${peso} kg` : "N/R"}
          </span>
        );
      },
    },
    {
      key: "estado",
      header: "ESTADO / FASE",
      render: (row) => <AnimalStatusBadge status={row.estado || "activo"} />,
    },
    {
      key: "acciones",
      header: isTrash ? "ACCIONES PAPELERA" : "ACCIONES",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={() => onRecover?.(row.id)}
                title="Recuperar"
                className="text-xl hover:scale-120 transition-transform cursor-pointer"
              >
                🔄
              </button>
              <button
                type="button"
                onClick={() => onPermanentDelete?.(row.id)}
                title="Eliminar para siempre"
                className="text-xl hover:scale-120 transition-transform text-red-500 cursor-pointer"
              >
                ❌
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/dashboard/animals/profile?id=${encodeURIComponent(row.id || row.codigo_arete)}`}
                title="Ver Hoja de Vida / Ficha Técnica"
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shadow-xs cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <FileText size={15} />
                <span className="hidden sm:inline">Ficha</span>
              </Link>
              {onOpenQr && (
                <button
                  type="button"
                  onClick={() => onOpenQr(row)}
                  title="Ver / Imprimir Chapeta QR"
                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <QrCode size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  title="Mover a papelera o desactivar"
                  className="text-slate-300 hover:text-red-500 text-xl transition-all cursor-pointer"
                >
                  🗑️
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return <Table columns={columns} rows={animals} />;
};

export default AnimalTable;
