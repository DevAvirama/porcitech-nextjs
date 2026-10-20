"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import { ArrowLeft, Download, Calendar, ShieldCheck } from "lucide-react";

export default function PrintableReportPreview({
  activeReport = null,
  kpiCols = [],
  onReset,
  onPrintPDF,
}) {
  if (!activeReport) return null;

  return (
    <div className="space-y-6">
      {/* Barra de Acciones del Reporte */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-md no-print">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700"
        >
          <ArrowLeft size={16} />
          Volver a Configuración
        </button>
        <Button
          onClick={onPrintPDF}
          className="bg-emerald-600 hover:bg-emerald-500 border-none text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30"
        >
          <Download size={18} />
          Exportar a PDF / Imprimir
        </Button>
      </div>

      {/* Plantilla A4 / Printable Document Container */}
      <Card className="printable-report bg-white text-slate-900 p-8 sm:p-12 print:p-8 shadow-xl border border-slate-200 rounded-[2.5rem] print:rounded-3xl max-w-225 mx-auto space-y-8 print:space-y-6 font-sans">
        {/* Header del Documento PDF */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase italic">
              Porci<span className="text-emerald-600">Tech</span>
            </h1>
            <p className="text-xs font-black uppercase text-slate-500 tracking-widest">
              Tecnología de Precisión Porcina
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Alineado con estándares de bioseguridad ICA
            </p>
          </div>
          <div className="text-right space-y-1 text-xs">
            <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md font-bold inline-block">
              CÓDIGO: {activeReport.code}
            </div>
            <p className="text-slate-500 font-medium mt-2">
              <strong>Emisión:</strong> {activeReport.dateGenerated}
            </p>
            <p className="text-slate-500 font-medium">
              <strong>Granja:</strong> PorciTech Cloud
            </p>
          </div>
        </div>

        {/* Título de Reporte */}
        <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">
            {activeReport.title}
          </h2>
          <div className="flex justify-center gap-6 mt-2 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> <strong>Rango:</strong>{" "}
              {activeReport.rangeLabel}
            </span>
            <span>•</span>
            <span>
              <strong>Foco:</strong> {activeReport.batchLabel}
            </span>
          </div>
        </div>

        {/* Texto de Resumen Ejecutivo */}
        <div className="space-y-3">
          <h3 className="text-base font-black uppercase text-slate-950 tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
            1. Resumen Ejecutivo
          </h3>
          <p className="text-sm leading-relaxed text-slate-700 font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {activeReport.summaryText}
          </p>
        </div>

        {/* KPIs del Reporte */}
        {activeReport.kpis && (
          <div className="space-y-4">
            <h3 className="text-base font-black uppercase text-slate-950 tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
              2. Indicadores Clave de Desempeño (KPIs)
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white p-1">
              <Table columns={kpiCols} rows={activeReport.kpis} />
            </div>
          </div>
        )}

        {/* Detalle de Datos en Tabla si Aplica */}
        {activeReport.tableRows && (
          <div className="space-y-4">
            <h3 className="text-base font-black uppercase text-slate-950 tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
              3. Detalle y Registros del Periodo
            </h3>
            {activeReport.tableRows.length === 0 ? (
              <div className="p-6 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                Sin registros disponibles para el criterio o periodo seleccionado en la base de datos oficial.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white p-1">
                <table className="w-full text-left border-collapse text-xs font-medium">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-black uppercase tracking-wider border-b border-slate-200 text-[10px]">
                      {activeReport.tableCols.map((col, idx) => (
                        <th
                          key={idx}
                          className="p-3.5 border-r border-slate-100 last:border-0"
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {activeReport.tableRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {activeReport.tableCols.map((col, cIdx) => (
                          <td
                            key={cIdx}
                            className="p-3.5 border-r border-slate-100 last:border-0 text-slate-700"
                          >
                            {row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sección de cumplimiento normativo ICA */}
        <div className="space-y-3 pt-4 border-t border-slate-200 break-inside-avoid">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
            Control Regulatorio y Bioseguridad
          </h3>
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="text-emerald-600 shrink-0 mt-0.5"
            />
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-800">
                Verificación Zootécnica de Granja Biosegura
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                {activeReport.complianceNotes} Todos los datos contenidos en
                este reporte son consultados directamente desde la base de datos de producción de la granja.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque de Firmas PDF */}
        <div className="grid grid-cols-2 gap-12 pt-16 print:pt-12 text-center text-xs break-inside-avoid">
          <div className="space-y-2">
            <div className="border-b border-slate-400 mx-auto w-48 h-8"></div>
            <p className="font-bold text-slate-800">
              Firma Responsable Técnico
            </p>
            <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
              Médico Veterinario Zootecnista
            </p>
          </div>
          <div className="space-y-2">
            <div className="border-b border-slate-400 mx-auto w-48 h-8"></div>
            <p className="font-bold text-slate-800">Firma Administrador</p>
            <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
              Administrador de Granja
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
