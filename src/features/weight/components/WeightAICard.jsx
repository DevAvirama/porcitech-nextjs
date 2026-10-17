"use client";

import React, { useRef, useState } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  Video,
  Wifi,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";
import {
  estimateWeightWithAI,
  estimarPesoCamaraRTSP,
} from "@/services/weightService";

const DEFAULT_RTSP_URL = "rtsp://admin:123456@192.168.32.200:554/live/ch00_1";
const DEFAULT_PIXELS_PER_CM = "15.2";

export default function WeightAICard({
  animals,
  corrales,
  isLoadingMasterData,
  onWeightEstimated,
}) {
  const [selectedAnimalId, setSelectedAnimalId] = useState("");
  const [selectedCorralId, setSelectedCorralId] = useState("");
  const [persistAI, setPersistAI] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);

  // Fuente de captura: 'upload' (foto/móvil) | 'rtsp' (cámara cenital V380 Pro)
  const [captureMode, setCaptureMode] = useState("upload");
  const [rtspUrl, setRtspUrl] = useState(DEFAULT_RTSP_URL);
  const [pixelsPerCm, setPixelsPerCm] = useState(DEFAULT_PIXELS_PER_CM);
  const [validarBordes, setValidarBordes] = useState(false);

  const handleAnimalChange = (animalId) => {
    setSelectedAnimalId(animalId);
    const chosen = animals.find((a) => a.id === animalId);
    if (chosen && chosen.corral_id) {
      setSelectedCorralId(chosen.corral_id);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setAiResult(null);
    }
  };

  const procesarResultadoIA = (result) => {
    setAiResult(result);

    if (result?.imagen_anotada_base64) {
      setImagePreview(result.imagen_anotada_base64);
    }

    if (result?.detectado) {
      toast.success(
        `¡Estimación exitosa! Peso: ${result.peso_estimado_kg?.toFixed(2)} kg`,
      );

      const chosen = animals.find((a) => a.id === selectedAnimalId);
      const corralObj = corrales.find((c) => c.id === selectedCorralId);
      const validArete =
        chosen?.codigo_arete && !UUID_REGEX.test(chosen.codigo_arete)
          ? chosen.codigo_arete
          : null;

      const newLog = {
        id: result.id_registro_persistido || `AI-${Date.now()}`,
        id_registro: result.id_registro_persistido || null,
        animalCode: validArete,
        animalDisplayName: getAnimalDisplayName(chosen),
        animalAlias: chosen?.nombre_alias,
        corralCodigo: corralObj?.codigo || "N/A",
        peso: result.peso_estimado_kg,
        metodo: "ia_vision",
        confianza: result.confianza,
        fecha: result.tiempo_registro || new Date().toISOString(),
      };

      if (onWeightEstimated) {
        onWeightEstimated(newLog, Boolean(result.id_registro_persistido));
      }
    } else {
      toast.warning(
        result?.mensaje || "No se detectó el animal en el plano dorsal.",
      );
    }
  };

  const handleRunAiEstimation = async () => {
    if (!selectedAnimalId) {
      toast.error("Selecciona el cerdo a evaluar.");
      return;
    }
    if (!selectedCorralId) {
      toast.error("Selecciona el corral de procedencia.");
      return;
    }
    if (!imageFile) {
      toast.error("Adjunta o toma una foto dorsal del porcino.");
      return;
    }

    setIsProcessingAI(true);
    setAiResult(null);

    try {
      const result = await estimateWeightWithAI({
        imageFile,
        animalId: selectedAnimalId,
        corralId: selectedCorralId,
        persist: persistAI,
      });
      procesarResultadoIA(result);
    } catch (err) {
      console.error("Error en inferencia de visión IA:", err);
      setAiResult({ detectado: false, mensaje: err.message });
      toast.error(
        err.message || "Error al procesar la imagen en el microservicio Docker.",
      );
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleRunRtspEstimation = async () => {
    if (!selectedAnimalId) {
      toast.error("Selecciona el cerdo a evaluar.");
      return;
    }
    if (!selectedCorralId) {
      toast.error("Selecciona el corral de procedencia.");
      return;
    }

    setIsProcessingAI(true);
    setAiResult(null);

    try {
      const result = await estimarPesoCamaraRTSP({
        id_cerdo: selectedAnimalId,
        corral_id: selectedCorralId,
        rtsp_url: rtspUrl || DEFAULT_RTSP_URL,
        pixels_per_cm: Number(pixelsPerCm) || 15.2,
        validar_bordes: validarBordes,
        persistir: persistAI,
      });
      procesarResultadoIA(result);
    } catch (err) {
      console.error("Error en captura RTSP V380 Pro:", err);
      setAiResult({ detectado: false, mensaje: err.message });
      toast.error(err.message || "No se pudo capturar desde la cámara Wi-Fi.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Panel Izquierdo: Captura, Parámetros y Ejecución */}
      <Card className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Camera className="text-indigo-600" size={20} />
              Captura Dorsal y Parámetros
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toma o sube una fotografía del plano superior del porcino.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
            Docker Microservice
          </span>
        </div>

        {/* Selectores de Cerdo y Corral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Seleccionar Cerdo *
            </label>
            <select
              value={selectedAnimalId}
              onChange={(e) => handleAnimalChange(e.target.value)}
              disabled={isProcessingAI || isLoadingMasterData}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- Elige un ejemplar --</option>
              {animals.map((a) => {
                const displayName = getAnimalDisplayName(a);
                const validArete =
                  a.codigo_arete && !UUID_REGEX.test(a.codigo_arete)
                    ? `#${a.codigo_arete} · `
                    : "";
                return (
                  <option key={a.id} value={a.id}>
                    {validArete ? `${validArete}${displayName}` : displayName} ({a.raza || "Porcino"})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Corral / Ubicación *
            </label>
            <select
              value={selectedCorralId}
              onChange={(e) => setSelectedCorralId(e.target.value)}
              disabled={isProcessingAI || isLoadingMasterData}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- Elige el corral --</option>
              {corrales.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} ({c.fase})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox de Persistencia */}
        <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={persistAI}
            onChange={(e) => setPersistAI(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800">
              Persistir resultado automáticamente
            </span>
            <p className="text-slate-500 text-[11px]">
              Guarda en la hipertabla TimescaleDB y actualiza peso_actual_kg del cerdo.
            </p>
          </div>
        </label>

        {/* Selector de Fuente de Captura */}
        <div className="flex flex-col gap-2">
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Fuente de Captura
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              id="capture-mode-upload"
              onClick={() => {
                setCaptureMode("upload");
                setAiResult(null);
              }}
              disabled={isProcessingAI}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                captureMode === "upload"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📁 Subir Fotografía Local
            </button>
            <button
              type="button"
              id="capture-mode-rtsp"
              onClick={() => {
                setCaptureMode("rtsp");
                setAiResult(null);
              }}
              disabled={isProcessingAI}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                captureMode === "rtsp"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📹 Cámara Cenital Wi-Fi (V380 Pro RTSP)
            </button>
          </div>
        </div>

        {/* Área de Captura / Subida de Imagen con Cámara Responsive */}
        {captureMode === "upload" && (
          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="camera-file-input"
            />

            {imagePreview ? (
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center group min-h-64 max-h-96">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aiResult?.imagen_anotada_base64 || imagePreview}
                  alt="Previsualización dorsal"
                  onLoad={(e) => {
                    setImageDimensions({
                      width: e.currentTarget.naturalWidth || 640,
                      height: e.currentTarget.naturalHeight || 480,
                    });
                  }}
                  className="max-h-96 w-auto object-contain"
                />

                {/* Overlay SVG del Bounding Box (solo si el backend no envió imagen anotada) */}
                {aiResult?.detectado &&
                  !aiResult?.imagen_anotada_base64 &&
                  aiResult?.bbox?.x_min !== undefined &&
                  imageDimensions.width > 0 && (
                    <svg
                      viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <rect
                        x={aiResult.bbox.x_min}
                        y={aiResult.bbox.y_min}
                        width={aiResult.bbox.x_max - aiResult.bbox.x_min}
                        height={aiResult.bbox.y_max - aiResult.bbox.y_min}
                        fill="rgba(16, 185, 129, 0.15)"
                        stroke="#10b981"
                        strokeWidth={Math.max(4, Math.round(imageDimensions.width / 150))}
                        rx="8"
                      />
                      <g
                        transform={`translate(${aiResult.bbox.x_min}, ${Math.max(
                          24,
                          aiResult.bbox.y_min - 10,
                        )})`}
                      >
                        <rect
                          x="0"
                          y="-24"
                          width={Math.max(160, Math.round(imageDimensions.width / 4))}
                          height="28"
                          rx="6"
                          fill="#10b981"
                        />
                        <text
                          x="8"
                          y="-6"
                          fill="#ffffff"
                          fontSize={Math.max(14, Math.round(imageDimensions.width / 45))}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          Porcino: {(aiResult.confianza * 100).toFixed(1)}%
                        </text>
                      </g>
                    </svg>
                  )}

                {/* Botón flotante para cambiar foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingAI}
                  className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <RefreshCw size={14} />
                  Cambiar Foto
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Camera size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">
                    Toma una foto con la cámara o sube un archivo
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Coloca el dispositivo en ángulo dorsal superior (cenital a 1.2 - 1.5 metros) para maximizar la precisión morfométrica.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm">
                  <Upload size={14} /> Seleccionar Imagen
                </span>
              </div>
            )}
          </div>
        )}

        {/* Panel de Cámara Cenital Wi-Fi (V380 Pro RTSP) */}
        {captureMode === "rtsp" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="rtsp-url-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  URL RTSP de la Cámara
                </label>
                <input
                  id="rtsp-url-input"
                  type="text"
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                  placeholder={DEFAULT_RTSP_URL}
                  disabled={isProcessingAI}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="pixels-per-cm-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Factor de Calibración (px/cm base 1280p)
                </label>
                <input
                  id="pixels-per-cm-input"
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="100"
                  value={pixelsPerCm}
                  onChange={(e) => setPixelsPerCm(e.target.value)}
                  placeholder={DEFAULT_PIXELS_PER_CM}
                  disabled={isProcessingAI}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
              <input
                id="validar-bordes-checkbox"
                type="checkbox"
                checked={validarBordes}
                onChange={(e) => setValidarBordes(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">
                  Validar que el porcino no toque los bordes
                </span>
                <p className="text-slate-500 text-[11px]">
                  Rechaza capturas donde el animal sale parcialmente del encuadre cenital.
                </p>
              </div>
            </label>

            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center min-h-64 max-h-96">
              {aiResult?.imagen_anotada_base64 ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={aiResult.imagen_anotada_base64}
                  alt="Fotograma cenital anotado por YOLO"
                  className="max-h-96 w-auto object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center p-8 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-indigo-300 flex items-center justify-center">
                    {isProcessingAI ? (
                      <RefreshCw size={26} className="animate-spin" />
                    ) : (
                      <Video size={26} />
                    )}
                  </div>
                  <p className="text-sm font-black text-slate-200">
                    {isProcessingAI
                      ? "Drenando buffer RTSP y capturando fotograma en vivo..."
                      : "Sin captura de la cámara aún"}
                  </p>
                  <p className="text-xs max-w-sm">
                    El fotograma se toma vía RTSP sobre TCP desde la V380 Pro y se procesa en el servidor sin bloquear la API.
                  </p>
                </div>
              )}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-900/80 text-emerald-300 backdrop-blur-md">
                <Wifi size={12} /> V380 Pro · RTSP/TCP
              </span>
            </div>
          </div>
        )}

        {/* Botón de Ejecución de Inferencia */}
        {captureMode === "upload" ? (
          <Button
            type="button"
            tone="primary"
            id="run-ai-file-button"
            onClick={handleRunAiEstimation}
            isLoading={isProcessingAI}
            disabled={isProcessingAI || !imageFile || !selectedAnimalId || !selectedCorralId}
            className="w-full py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          >
            {isProcessingAI ? (
              "Iniciando Inferencia en Microservicio YOLO..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={18} />
                Calcular Peso con Visión Artificial
              </span>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            tone="primary"
            id="run-ai-rtsp-button"
            onClick={handleRunRtspEstimation}
            isLoading={isProcessingAI}
            disabled={isProcessingAI || !selectedAnimalId || !selectedCorralId}
            className="w-full py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          >
            {isProcessingAI ? (
              "Capturando fotograma desde la cámara Wi-Fi..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Video size={18} />
                Capturar y Calcular Peso desde Cámara Wi-Fi
              </span>
            )}
          </Button>
        )}
      </Card>

      {/* Panel Derecho: Resultados Morfométricos en Tiempo Real */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {aiResult && aiResult.detectado ? (
          <Card className="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-xl shadow-emerald-500/10 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase tracking-wider">
                <CheckCircle2 size={18} />
                Inferencia Morfométrica Exitosa
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                Confianza: {(aiResult.confianza * 100).toFixed(1)}%
              </span>
            </div>

            {/* PESO ESTIMADO GIGANTE */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-1">
                Peso Estimado por IA
              </span>
              <p className="text-5xl font-black tracking-tight text-slate-950 font-mono">
                {aiResult.peso_estimado_kg?.toFixed(2)}
                <span className="text-2xl text-emerald-700 ml-1.5 font-sans font-bold">
                  kg
                </span>
              </p>
              <p className="text-xs font-semibold text-emerald-700 mt-2">
                {persistAI
                  ? "✓ Persistido en hipertabla registro_pesos (TimescaleDB)"
                  : "Modo estimación previa (No persistido)"}
              </p>
            </div>

            {/* MÉTRICAS MORFOMÉTRICAS */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Largo Dorsal
                </span>
                <span className="text-base font-black text-slate-800 font-mono">
                  {aiResult.largo_cm ? `${aiResult.largo_cm} cm` : "N/D"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Ancho Corporal
                </span>
                <span className="text-base font-black text-slate-800 font-mono">
                  {aiResult.ancho_cm ? `${aiResult.ancho_cm} cm` : "N/D"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Área Dorsal
                </span>
                <span className="text-base font-black text-slate-800 font-mono">
                  {aiResult.area_cm2 ? `${aiResult.area_cm2} cm²` : "N/D"}
                </span>
              </div>
            </div>

            {/* DETALLE TÉCNICO DE PERSISTENCIA */}
            {aiResult.id_registro_persistido && (
              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">ID Registro:</span>
                  <span className="truncate max-w-[180px]">
                    {aiResult.id_registro_persistido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">Timestamp:</span>
                  <span>
                    {aiResult.tiempo_registro
                      ? new Date(aiResult.tiempo_registro).toLocaleTimeString()
                      : "Reciente"}
                  </span>
                </div>
              </div>
            )}
          </Card>
        ) : aiResult && !aiResult.detectado ? (
          <Card className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 text-amber-900 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 font-black text-base text-amber-800">
              <AlertTriangle size={20} className="text-amber-600" />
              Animal No Detectado
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {aiResult.mensaje ||
                "El modelo de visión no logró delimitar la silueta dorsal del porcino con la confianza mínima requerida."}
            </p>
            <div className="mt-2 p-3 bg-white/70 rounded-xl border border-amber-200 text-xs space-y-1">
              <p className="font-bold text-amber-950">Recomendaciones técnicas:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-900">
                <li>Asegura iluminación directa sin sombras pronunciadas.</li>
                <li>Enfoca desde arriba asegurando que se vean cabeza, lomo y grupa.</li>
                <li>Evita obstrucciones como barras o bebederos sobre el cuerpo.</li>
              </ul>
            </div>
          </Card>
        ) : (
          <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-slate-700">
            <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
              <Info size={18} className="text-indigo-600" />
              ¿Cómo funciona la estimación morfométrica?
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              El microservicio Docker procesa la fotografía dorsal a través de una red neuronal convolucional YOLO segmentando la geometría del porcino.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                <span className="font-mono font-bold text-indigo-600">01.</span>
                <span>Segmentación de contornos dorsales y ancho torácico.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                <span className="font-mono font-bold text-indigo-600">02.</span>
                <span>Regresión polinomial calibrada para razas industriales.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                <span className="font-mono font-bold text-indigo-600">03.</span>
                <span>Escritura hipertabla TimescaleDB para analítica de GMD.</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
