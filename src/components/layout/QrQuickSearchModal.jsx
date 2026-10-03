"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Camera,
  QrCode,
  X,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { getAnimales, getAnimalByQr, getAnimalById } from "@/services/animalService";

export default function QrQuickSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState("manual"); // 'manual' | 'camera'
  const [searchCode, setSearchCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedAnimal, setMatchedAnimal] = useState(null);
  const [knownAnimals, setKnownAnimals] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Cargar lista de animales reales desde la API de FastAPI
      getAnimales()
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            setKnownAnimals(list);
          }
        })
        .catch((err) => {
          console.warn("Aviso al consultar animales para búsqueda rápida:", err.message);
        });

      setSearchCode("");
      setMatchedAnimal(null);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Manejar búsqueda y matching dinámico
  const handleCodeChange = (val) => {
    setSearchCode(val);
    const cleaned = val.trim().toLowerCase();
    if (!cleaned) {
      setMatchedAnimal(null);
      return;
    }
    const found = knownAnimals.find(
      (a) =>
        (a.codigo_arete && a.codigo_arete.toLowerCase() === cleaned) ||
        (a.codigo_qr && a.codigo_qr.toLowerCase() === cleaned) ||
        (a.id && a.id.toLowerCase() === cleaned) ||
        (a.nombre_alias && a.nombre_alias.toLowerCase().includes(cleaned))
    );
    setMatchedAnimal(found || null);
  };

  const handleExecuteSearch = async (targetCode) => {
    const codeToSearch = (targetCode || searchCode).trim();
    if (!codeToSearch) {
      toast.error("Por favor ingresa un código de arete o chapeta");
      return;
    }

    setIsSearching(true);

    // 1. Verificar si ya está en knownAnimals
    let found = knownAnimals.find(
      (a) =>
        (a.codigo_arete && a.codigo_arete.toLowerCase() === codeToSearch.toLowerCase()) ||
        (a.codigo_qr && a.codigo_qr.toLowerCase() === codeToSearch.toLowerCase()) ||
        (a.id && a.id.toLowerCase() === codeToSearch.toLowerCase())
    );

    // 2. Si no está en cache local, buscar directamente en el backend
    if (!found) {
      try {
        try {
          found = await getAnimalByQr(codeToSearch);
        } catch {
          found = await getAnimalById(codeToSearch);
        }
      } catch {
        try {
          const searchResults = await getAnimales({ search: codeToSearch });
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            found = searchResults[0];
          }
        } catch {
          found = null;
        }
      }
    }

    setIsSearching(false);

    if (found) {
      const targetId = found.id || found.codigo_arete || codeToSearch;
      toast.success(`Animal #${found.codigo_arete || found.id} localizado`);
      onClose();
      router.push(`/dashboard/animals/profile?id=${encodeURIComponent(targetId)}`);
    } else {
      toast.error(
        `El arete "${codeToSearch}" no figura en el inventario activo`,
        {
          action: {
            label: "Ver Pasaporte",
            onClick: () => {
              onClose();
              router.push(`/trace/${encodeURIComponent(codeToSearch)}`);
            },
          },
        },
      );
    }
  };

  // Simular escaneo de cámara
  const handleSimulateScan = (presetCode) => {
    setIsScanning(true);
    const target = presetCode || knownAnimals[0]?.id || "PT-2026-001";

    setTimeout(() => {
      setIsScanning(false);
      setSearchCode(target);
      const found = knownAnimals.find(
        (a) =>
          (a.id && a.id.toLowerCase() === target.toLowerCase()) ||
          (a.code && a.code.toLowerCase() === target.toLowerCase()),
      );
      setMatchedAnimal(
        found || {
          id: target,
          raza: "Porcino Detectado",
          estadoSalud: "Óptimo",
        },
      );
      toast.success(`¡Código QR detectado: #${target}!`);

      setTimeout(() => {
        onClose();
        router.push(
          `/dashboard/animals/profile?code=${encodeURIComponent(target)}`,
        );
      }, 1000);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <QrCode size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                Escáner de QR
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Localiza rápidamente cualquier animal por arete o escaneo de
                código QR.
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

        {/* Selector de Modos */}
        <div className="px-6 pt-4 pb-2 flex gap-2 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setActiveMode("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMode === "manual"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Search size={15} />
            Búsqueda por Arete / Código
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("camera")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMode === "camera"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Camera size={15} />
            Simulador de Escaneo por Cámara
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">
          {activeMode === "manual" ? (
            <div className="space-y-6">
              {/* Formulario de búsqueda */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteSearch();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">
                    Número de Arete o Código Oficial
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Ej: PT-2026-001, L-042, 2024-001..."
                      value={searchCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition-all text-sm placeholder:text-slate-400 font-mono"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search size={18} />
                    </div>
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              </form>

              {/* Tarjeta de previsualización si coincide */}
              {matchedAnimal ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                      🐷
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-base">
                          #{matchedAnimal.codigo_arete || matchedAnimal.id}
                        </span>
                        {matchedAnimal.nombre_alias && (
                          <span className="text-xs font-semibold text-slate-500 italic">
                            ({matchedAnimal.nombre_alias})
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 uppercase">
                          Registrado
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        {matchedAnimal.raza || "Raza Mixta"} •{" "}
                        {matchedAnimal.corral_codigo ? `Corral ${matchedAnimal.corral_codigo}` : matchedAnimal.lote || "Corral Central"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(
                          `/dashboard/animals/profile?id=${encodeURIComponent(matchedAnimal.id || matchedAnimal.codigo_arete)}`,
                        );
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm cursor-pointer"
                    >
                      Ver Ficha <ArrowRight size={14} />
                    </button>
                    <a
                      href={`/trace/${encodeURIComponent(matchedAnimal.codigo_qr || matchedAnimal.codigo_arete || matchedAnimal.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Abrir Pasaporte Público"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ) : searchCode.trim().length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      size={16}
                      className="text-amber-600 shrink-0"
                    />
                    <span>
                      No figura con ese código exacto en el inventario activo.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(
                        `/trace/${encodeURIComponent(searchCode.trim())}`,
                      );
                    }}
                    className="font-bold underline text-amber-900 hover:text-amber-950 cursor-pointer"
                  >
                    Consultar Pasaporte Público
                  </button>
                </div>
              ) : null}

              {/* Accesos rápidos a chapetas registradas */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  QR sugeridos en el plantel:
                </p>
                <div className="flex flex-wrap gap-2">
                  {knownAnimals.slice(0, 6).map((animal, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchCode(animal.id);
                        handleExecuteSearch(animal.id);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-mono font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      #{animal.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SIMULADOR DE CÁMARA / ESCÁNER ÓPTICO */
            <div className="space-y-5 text-center">
              <div className="relative w-full h-64 bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
                {/* Cuadrícula de fondo */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#39A900_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Retícula de puntería con esquinas marcadas */}
                <div className="relative w-44 h-44 border-2 border-dashed border-emerald-400/50 rounded-2xl flex items-center justify-center">
                  {/* Esquinas estéticas */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400"></div>

                  {/* Haz láser animado de escaneo */}
                  <div
                    className={`absolute left-0 right-0 h-1 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#39A900] ${
                      isScanning
                        ? "animate-bounce duration-500"
                        : "animate-pulse"
                    }`}
                  ></div>

                  <div className="text-center text-slate-400 text-xs p-3">
                    <QrCode
                      size={36}
                      className="mx-auto mb-2 text-emerald-400/70"
                    />
                    <span className="font-semibold text-[11px] block">
                      {isScanning
                        ? "Procesando código QR..."
                        : "Apunta la cámara al arete del cerdo"}
                    </span>
                  </div>
                </div>

                {/* Indicador de sensor activo */}
                <div className="absolute top-3 left-4 flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 text-[10px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  SENSOR ÓPTICO ACTIVO
                </div>

                <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-500">
                  60 FPS • 1080p
                </div>
              </div>

              {/* Botón de acción para simular lectura */}
              <div className="space-y-3">
                <Button
                  type="button"
                  tone="primary"
                  onClick={() => handleSimulateScan()}
                  disabled={isScanning}
                  className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Zap size={18} />
                  {isScanning
                    ? "Escaneando código..."
                    : "Escanear Arete Detectado"}
                </Button>

                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <span className="text-xs text-slate-500 font-bold self-center mr-1">
                    Simular con:
                  </span>
                  {["PT-2026-001", "L-042", "2024-001"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleSimulateScan(code)}
                      disabled={isScanning}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-bold text-slate-700 cursor-pointer transition-colors"
                    >
                      #{code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Integrado con la red de trazabilidad PorciTech</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
