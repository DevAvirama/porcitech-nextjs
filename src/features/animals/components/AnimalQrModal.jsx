"use client";

import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Printer,
  Copy,
  ExternalLink,
  X,
  Tag,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

export default function AnimalQrModal({ animal, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tagFormat, setTagFormat] = useState("arete"); // 'arete' | 'corral'
  const printRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !animal) return null;

  const animalCode =
    animal.codigo_arete || animal.code || animal.id || "PT-2026-001";
  const qrTarget = animal.codigo_qr || animalCode;
  const originUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://porcitech.com";
  const publicTraceUrl = `${originUrl}/trace/${encodeURIComponent(qrTarget)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicTraceUrl);
      setCopied(true);
      toast.success("Enlace de trazabilidad copiado al portapapeles");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const handlePrint = () => {
    // Añadir clase temporal al body si fuera necesario y llamar print
    window.print();
  };

  const raza = animal.raza || "Landrace x Duroc";
  const lote =
    animal.corral_codigo ||
    animal.corral?.codigo ||
    animal.lote ||
    animal.galpon ||
    "Sin asignar";
  const sexo =
    animal.sexo === "macho"
      ? "Macho"
      : animal.sexo === "hembra"
        ? "Hembra"
        : animal.sexo || "No especificado";
  const estado = animal.estado || animal.estadoSalud || "Activo";
  const fechaIngreso =
    animal.fecha_nacimiento ||
    animal.fechaNacimiento ||
    animal.fechaIngreso ||
    new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-8">
        {/* Cabecera del Modal (no se imprime) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                Chapeta e Identificación Digital
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                  QR Vectorial
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Generador de rótulo para arete o corral con acceso a pasaporte público.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de opciones y selector de formato (no se imprime) */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Formato de Impresión:</span>
            <div className="flex bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTagFormat("arete")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  tagFormat === "arete"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Chapeta de Arete (10x15cm)
              </button>
              <button
                type="button"
                onClick={() => setTagFormat("corral")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  tagFormat === "corral"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Rótulo de Corral (A4 / Jaula)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <Copy size={13} className={copied ? "text-emerald-500" : "text-slate-500"} />
              {copied ? "¡Copiado!" : "Copiar URL"}
            </button>
            <a
              href={publicTraceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <ExternalLink size={13} />
              Ver Pasaporte
            </a>
          </div>
        </div>

        {/* ÁREA IMPRIMIBLE / VISTA PREVIA */}
        <div className="p-6 md:p-8 flex justify-center items-center bg-slate-100/50">
          <div
            ref={printRef}
            className={`printable-chapeta-container w-full transition-all ${
              tagFormat === "arete" ? "max-w-95" : "max-w-lg"
            }`}
          >
            {tagFormat === "arete" ? (
              /* DISEÑO CHAPETA DE ARETE (FORMA TÉRMICA DE GANADO) */
              <div className="relative bg-white border-2 border-slate-900 rounded-[2.5rem] p-6 shadow-xl overflow-hidden text-center flex flex-col items-center">
                {/* Perforación visual de la chapeta */}
                <div className="w-9 h-9 rounded-full bg-slate-100 border-3 border-slate-900 mb-3 flex items-center justify-center shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>

                {/* Sello de Granja y Marca */}
                <div className="w-full flex items-center justify-between border-b border-slate-300 pb-2 mb-4">
                  <div className="text-left">
                    <span className="text-[11px] font-black tracking-widest text-slate-950 uppercase italic">
                      Porci<span className="text-emerald-600">Tech</span>
                    </span>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                      Red de Trazabilidad
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md uppercase">
                      ICA-BPP
                    </span>
                  </div>
                </div>

                {/* CÓDIGO DE ARETE GIGANTE */}
                <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl py-2 px-3 mb-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 block">
                    ID / Arete Oficial
                  </span>
                  <p className="text-3xl font-black tracking-tight text-slate-950 font-mono">
                    #{animalCode}
                  </p>
                </div>

                {/* CÓDIGO QR VECTORIAL */}
                <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm mb-4 inline-block">
                  {mounted ? (
                    <QRCodeSVG
                      value={publicTraceUrl}
                      size={170}
                      level="H"
                      includeMargin={false}
                      className="w-40 h-40"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-slate-100 animate-pulse rounded-lg" />
                  )}
                </div>

                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Escanea para consultar Pasaporte Sanitario
                </p>

                {/* DATOS RÁPIDOS */}
                <div className="w-full grid grid-cols-2 gap-2 text-left bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px]">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Raza</span>
                    <span className="font-extrabold text-slate-800 truncate block">{raza}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Sexo</span>
                    <span className="font-extrabold text-slate-800 block">{sexo}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Ubicación</span>
                    <span className="font-extrabold text-slate-800 truncate block">{lote}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Ingreso</span>
                    <span className="font-extrabold text-slate-800 block">{fechaIngreso}</span>
                  </div>
                </div>

                {/* Código de barra estético / Pie */}
                <div className="w-full mt-3 pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>*SIP-{animalCode}*</span>
                  <span>CERT-OK</span>
                </div>
              </div>
            ) : (
              /* DISEÑO RÓTULO DE CORRAL / JAULA */
              <div className="bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-xl text-slate-900">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight italic">
                      Porci<span className="text-emerald-600">Tech</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      Rótulo de Control de Corral y Ficha Sanitaria
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-lg uppercase">
                      Plantel Activo
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-center">
                  <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shrink-0 shadow-sm">
                    {mounted ? (
                      <QRCodeSVG
                        value={publicTraceUrl}
                        size={150}
                        level="H"
                        includeMargin={false}
                        className="w-36 h-36"
                      />
                    ) : (
                      <div className="w-36 h-36 bg-slate-100 animate-pulse rounded-lg" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-left w-full">
                    <div className="bg-slate-900 text-white p-3 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                        Identificador Principal
                      </span>
                      <p className="text-2xl font-black font-mono tracking-tight">
                        #{animalCode}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Raza</span>
                        <span className="font-extrabold text-slate-800">{raza}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Corral/Lote</span>
                        <span className="font-extrabold text-slate-800">{lote}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Estado</span>
                        <span className="font-extrabold text-emerald-700">{estado}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Fecha</span>
                        <span className="font-extrabold text-slate-800">{fechaIngreso}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Granja PorciTech - Centro de Biotecnología</span>
                  <span>Vigencia Sanitaria: Conforme Normativa ICA</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie de Acciones del Modal (no se imprime) */}
        <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} className="text-indigo-500 shrink-0" />
            <span>
              Configura tu impresora en escala 100% y activa los gráficos de fondo.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              tone="soft"
              onClick={onClose}
              className="flex-1 sm:flex-none font-bold rounded-xl cursor-pointer"
            >
              Cerrar
            </Button>
            <Button
              type="button"
              tone="primary"
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Printer size={18} />
              Imprimir Chapeta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
