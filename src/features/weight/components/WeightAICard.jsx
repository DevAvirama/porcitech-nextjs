"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  Video,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Settings,
  Play,
  Pause,
  Flame,
  Scale,
  Eye,
  EyeOff,
  Sliders,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getAnimalDisplayName, UUID_REGEX } from "@/utils/formatters";
import {
  estimateWeightWithAI,
  getLiveStreamUrl,
  getLiveStreamStatus,
  capturarPesoEnVivo,
  updateStreamConfig,
} from "@/services/weightService";

const DEFAULT_CAMERA_IP = "192.168.1.108";
const DEFAULT_CAMERA_PORT = "554";
const DEFAULT_CAMERA_USER = "admin";
const DEFAULT_CAMERA_PASSWORD = "admin123";
const DEFAULT_PIXELS_PER_CM = "15.2";

// Reproduce un sonido de confirmación sintético mediante Web Audio API al registrar el peso
const playCaptureChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Si el navegador bloquea audio sin interacción previa, continuar en silencio
  }
};

export default function WeightAICard({
  animals = [],
  corrales = [],
  isLoadingMasterData = false,
  onWeightEstimated,
}) {
  const [selectedAnimalId, setSelectedAnimalId] = useState("");
  const [selectedCorralId, setSelectedCorralId] = useState("");
  const [persistAI, setPersistAI] = useState(true);

  // Modo de operación: 'live' (Streaming en vivo Dahua) | 'upload' (Subida de foto)
  const [captureMode, setCaptureMode] = useState("live");

  // Parámetros de la cámara Dahua TPC-BF (recuperados de localStorage si existen)
  const [cameraIp, setCameraIp] = useState(DEFAULT_CAMERA_IP);
  const [cameraPort, setCameraPort] = useState(DEFAULT_CAMERA_PORT);
  const [cameraUser, setCameraUser] = useState(DEFAULT_CAMERA_USER);
  const [cameraPassword, setCameraPassword] = useState(DEFAULT_CAMERA_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [pixelsPerCm, setPixelsPerCm] = useState(DEFAULT_PIXELS_PER_CM);
  const [validarBordes, setValidarBordes] = useState(false);

  // Selección de canal Dahua (1: Óptico, 2: Térmico) y subtipo (0: Principal 1080P, 1: Substream)
  const [channel, setChannel] = useState(1);
  const [subtype, setSubtype] = useState(0);

  // Estados del streaming en vivo
  const [isPlaying, setIsPlaying] = useState(true);
  const [streamKey, setStreamKey] = useState(0);
  const [isStreamLoading, setIsStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [streamMetrics, setStreamMetrics] = useState({
    connected: false,
    detectado: false,
    peso_estimado_kg: null,
    confianza: null,
    area_cm2: null,
    largo_cm: null,
    ancho_cm: null,
    fps: 0,
    mensaje: "Iniciando enlace con Dahua TPC-BF...",
  });

  // Estados de captura manual o por archivo
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);
  const streamImgRef = useRef(null);

  // Cargar configuración guardada de localStorage al montar
  useEffect(() => {
    try {
      const savedIp = localStorage.getItem("porcitech_dahua_ip");
      const savedPort = localStorage.getItem("porcitech_dahua_port");
      const savedUser = localStorage.getItem("porcitech_dahua_user");
      const savedPwd = localStorage.getItem("porcitech_dahua_password");
      const savedPpc = localStorage.getItem("porcitech_dahua_ppc");

      if (savedIp) setCameraIp(savedIp);
      if (savedPort) setCameraPort(savedPort);
      if (savedUser) setCameraUser(savedUser);
      if (savedPwd) setCameraPassword(savedPwd);
      if (savedPpc) setPixelsPerCm(savedPpc);
    } catch {
      // localStorage no disponible o restringido
    }
  }, []);

  // Guardar configuración localmente cuando cambie
  const handleSaveSettings = () => {
    try {
      localStorage.setItem("porcitech_dahua_ip", cameraIp);
      localStorage.setItem("porcitech_dahua_port", cameraPort);
      localStorage.setItem("porcitech_dahua_user", cameraUser);
      localStorage.setItem("porcitech_dahua_password", cameraPassword);
      localStorage.setItem("porcitech_dahua_ppc", pixelsPerCm);
      toast.success("Parámetros de la cámara Dahua guardados en este navegador.");
    } catch {
      // Ignorar errores de almacenamiento
    }

    // Notificar al backend sobre la nueva configuración
    updateStreamConfig({
      camera_ip: cameraIp,
      camera_port: Number(cameraPort) || 554,
      camera_user: cameraUser,
      camera_password: cameraPassword,
      channel,
      subtype,
      pixels_per_cm: Number(pixelsPerCm) || 15.2,
    }).catch((err) => console.warn("Error sincronizando config en backend:", err));

    setShowSettings(false);
    setStreamKey((k) => k + 1);
  };

  // Limpiar memoria de previews locales
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Sincronización continua de estado y métricas del streaming en vivo (Polling cada 400ms)
  useEffect(() => {
    if (captureMode !== "live" || !isPlaying) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const status = await getLiveStreamStatus();
        if (isMounted && status) {
          setStreamMetrics({
            connected: Boolean(status.connected),
            detectado: Boolean(status.metrics?.detectado),
            peso_estimado_kg: status.metrics?.peso_estimado_kg,
            confianza: status.metrics?.confianza,
            area_cm2: status.metrics?.area_cm2,
            largo_cm: status.metrics?.largo_cm,
            ancho_cm: status.metrics?.ancho_cm,
            fps: status.fps || 0,
            mensaje: status.metrics?.mensaje || status.last_error || "Conectado",
          });
          if (status.connected) {
            setStreamError(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.debug("Error leyendo métricas live stream:", err?.message);
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [captureMode, isPlaying]);

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

  const procesarResultadoExitoso = useCallback((result) => {
    setAiResult(result);

    if (result?.detectado) {
      playCaptureChime();
      toast.success(
        `¡Pesaje confirmado! Peso registrado: ${result.peso_estimado_kg?.toFixed(2)} kg`,
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
        result?.mensaje || "No se detectó el animal con el contorno mínimo requerido.",
      );
    }
  }, [animals, corrales, onWeightEstimated, selectedAnimalId, selectedCorralId]);

  // =========================================================================
  // BOTÓN PRINCIPAL: Capturar y Registrar Peso en Vivo
  // =========================================================================
  const handleCaptureLiveWeight = async () => {
    if (!selectedAnimalId) {
      toast.error("Por favor selecciona el cerdo que está en encuadre.");
      return;
    }
    if (!selectedCorralId) {
      toast.error("Por favor selecciona el corral de procedencia.");
      return;
    }

    setIsCapturing(true);

    try {
      const result = await capturarPesoEnVivo({
        id_cerdo: selectedAnimalId,
        corral_id: selectedCorralId,
        persistir: persistAI,
        pixels_per_cm: Number(pixelsPerCm) || 15.2,
        validar_bordes: validarBordes,
        channel,
        subtype,
      });

      procesarResultadoExitoso(result);
    } catch (err) {
      console.error("Error al capturar peso en vivo:", err);
      toast.error(err.message || "Error al capturar y persistir el peso desde Dahua.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Estimación manual mediante subida de archivo
  const handleRunAiEstimationFile = async () => {
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

    setIsCapturing(true);
    setAiResult(null);

    try {
      const result = await estimateWeightWithAI({
        imageFile,
        animalId: selectedAnimalId,
        corralId: selectedCorralId,
        persist: persistAI,
        pixelsPerCm: Number(pixelsPerCm) || 15.2,
      });
      procesarResultadoExitoso(result);
    } catch (err) {
      console.error("Error en inferencia de archivo:", err);
      setAiResult({ detectado: false, mensaje: err.message });
      toast.error(err.message || "Error al procesar la imagen enviada.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Atajo de teclado: Barra espaciadora para capturar peso instantáneo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === "Space" &&
        captureMode === "live" &&
        !isCapturing &&
        selectedAnimalId &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "SELECT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        handleCaptureLiveWeight();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const liveStreamSrc = getLiveStreamUrl({
    channel,
    subtype,
    password: cameraPassword,
    pixelsPerCm: Number(pixelsPerCm) || 15.2,
    t: streamKey,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ===================================================================== */}
      {/* PANEL IZQUIERDO: VIDEO EN VIVO DAHUA + CONTROLES DE CAPTURA          */}
      {/* ===================================================================== */}
      <Card className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5">
        {/* Cabecera del Módulo de Visión */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Camera className="text-indigo-600" size={22} />
              Estación de Pesaje Biométrico Dorsal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cámara Dahua TPC-BF en enlace directo punto a punto (192.168.1.108:554)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                streamMetrics.connected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  streamMetrics.connected
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              {streamMetrics.connected ? "Enlace RTSP Activo" : "Conectando..."}
            </span>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="Ajustes de conexión y calibración"
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                showSettings
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Formulario de Configuración Colapsable (IP, Credenciales, Calibración) */}
        {showSettings && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-indigo-600" />
                Parámetros de Enlace Dahua & Calibración
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Host: 192.168.1.50/24 | Cámara: 192.168.1.108
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Dirección IP Cámara
                </label>
                <input
                  type="text"
                  value={cameraIp}
                  onChange={(e) => setCameraIp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                  placeholder="192.168.1.108"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Usuario Dahua
                </label>
                <input
                  type="text"
                  value={cameraUser}
                  onChange={(e) => setCameraUser(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Contraseña Cámara
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={cameraPassword}
                    onChange={(e) => setCameraPassword(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                    placeholder="admin123"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Factor Base px/cm (Base 1280p a ~2.20m cenital)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="100"
                  value={pixelsPerCm}
                  onChange={(e) => setPixelsPerCm(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} /> Guardar Parámetros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selector de Ejemplar Porcino y Corral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Seleccionar Cerdo a Pesar *
            </label>
            <select
              value={selectedAnimalId}
              onChange={(e) => handleAnimalChange(e.target.value)}
              disabled={isCapturing || isLoadingMasterData}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- Elige un ejemplar --</option>
              {animals.map((a) => {
                const displayName = getAnimalDisplayName(a);
                const validArete =
                  a.codigo_arete && !UUID_REGEX.test(a.codigo_arete)
                    ? `#${a.codigo_arete} · `
                    : "";
                const pesoPrevio = a.peso_actual_kg ? ` [${a.peso_actual_kg} kg]` : "";
                return (
                  <option key={a.id} value={a.id}>
                    {validArete ? `${validArete}${displayName}` : displayName} ({a.raza || "Porcino"}){pesoPrevio}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Corral de Procedencia *
            </label>
            <select
              value={selectedCorralId}
              onChange={(e) => setSelectedCorralId(e.target.value)}
              disabled={isCapturing || isLoadingMasterData}
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

        {/* Pestañas de Modo de Captura */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setCaptureMode("live")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              captureMode === "live"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Radio size={15} className={captureMode === "live" ? "text-red-500 animate-pulse" : ""} />
            Cámara Industrial Dahua (En Vivo)
          </button>
          <button
            type="button"
            onClick={() => setCaptureMode("upload")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              captureMode === "upload"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload size={15} />
            Subir Fotografía Local
          </button>
        </div>

        {/* =================================================================== */}
        {/* REPRODUCTOR EN VIVO (DAHUA TPC-BF RTSP / TCP)                       */}
        {/* =================================================================== */}
        {captureMode === "live" ? (
          <div className="flex flex-col gap-3">
            {/* Barra de Canales Dahua: Óptico 1080P, Substream y Térmico */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-2xl text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-slate-400 mr-1 hidden sm:inline">
                  Canal Dahua:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setChannel(1);
                    setSubtype(0);
                    setStreamKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    channel === 1 && subtype === 0
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  📷 Óptico Full HD (1080P)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChannel(1);
                    setSubtype(1);
                    setStreamKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    channel === 1 && subtype === 1
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  ⚡ Substream (Fluido)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChannel(2);
                    setSubtype(0);
                    setStreamKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                    channel === 2
                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Flame size={12} /> Térmico (Canal 2)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? "Pausar transmisión" : "Reanudar transmisión"}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsStreamLoading(true);
                    setStreamKey((k) => k + 1);
                  }}
                  title="Recargar stream"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <RefreshCw size={14} className={isStreamLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Contenedor del Video en Vivo con HUD */}
            <div className="relative w-full rounded-3xl overflow-hidden border-2 border-slate-900 bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[480px] shadow-2xl">
              {isPlaying ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  ref={streamImgRef}
                  src={liveStreamSrc}
                  alt="Streaming Dahua TPC-BF con Visión Artificial"
                  onLoad={() => setIsStreamLoading(false)}
                  onError={() => {
                    setIsStreamLoading(false);
                    setStreamError(true);
                  }}
                  className="w-full h-auto max-h-[480px] object-contain select-none"
                />
              ) : (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
                  <Pause size={36} className="text-slate-500" />
                  <p className="text-sm font-bold text-slate-300">Transmisión pausada</p>
                  <Button
                    tone="soft"
                    onClick={() => setIsPlaying(true)}
                    className="text-xs font-bold"
                  >
                    Reanudar Video en Vivo
                  </Button>
                </div>
              )}

              {/* Spinner de Carga Inicial */}
              {isStreamLoading && isPlaying && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-emerald-400">
                  <RefreshCw size={32} className="animate-spin text-emerald-500" />
                  <p className="text-xs font-black tracking-wider uppercase">
                    Estableciendo stream RTSP/TCP con Dahua...
                  </p>
                </div>
              )}

              {/* Mensaje si ocurre error de conexión */}
              {streamError && !isStreamLoading && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 text-center p-6 text-slate-300">
                  <AlertTriangle size={36} className="text-amber-500" />
                  <p className="text-sm font-black text-white">
                    No se pudo recibir video desde {cameraIp}:{cameraPort}
                  </p>
                  <p className="text-xs text-slate-400 max-w-md">
                    Verifica que el cable Ethernet esté conectado al adaptador USB (192.168.1.50) y que la contraseña en ajustes sea correcta.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStreamError(false);
                        setIsStreamLoading(true);
                        setStreamKey((k) => k + 1);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Reintentar Conexión
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Editar Credenciales
                    </button>
                  </div>
                </div>
              )}

              {/* HUD Superior Flotante: Indicadores de Estado */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-900/85 text-emerald-300 backdrop-blur-md border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  EN VIVO · Dahua TPC-BF ({channel === 1 ? "Óptico" : "Térmico"})
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900/85 text-slate-300 backdrop-blur-md border border-slate-700">
                  {streamMetrics.fps ? `${streamMetrics.fps} FPS` : "TCP RTSP"}
                </span>
              </div>

              {/* HUD Inferior Flotante: Peso en Tiempo Real */}
              {streamMetrics.detectado && streamMetrics.peso_estimado_kg && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 p-2.5 rounded-2xl pointer-events-none shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                      <Scale size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                        Cálculo Morfométrico en Vivo:
                      </span>
                      <div className="text-lg font-black text-white font-mono flex items-baseline gap-1">
                        {streamMetrics.peso_estimado_kg?.toFixed(2)}
                        <span className="text-xs text-emerald-300 font-sans font-bold">kg</span>
                        <span className="text-[11px] text-slate-400 font-sans font-normal ml-2">
                          (Confianza: {((streamMetrics.confianza || 0) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-700/50 px-2.5 py-1 rounded-lg hidden sm:inline">
                    Espacio para Capturar
                  </span>
                </div>
              )}
            </div>

            {/* =============================================================== */}
            {/* BOTÓN GIGANTE: CAPTURAR Y REGISTRAR PESO                         */}
            {/* =============================================================== */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                tone="primary"
                id="btn-capturar-peso-en-vivo"
                onClick={handleCaptureLiveWeight}
                isLoading={isCapturing}
                disabled={isCapturing || !selectedAnimalId || !selectedCorralId}
                className="w-full py-4 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-3"
              >
                {isCapturing ? (
                  "Procesando Fotograma y Guardando en TimescaleDB..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Camera size={22} />
                    {streamMetrics.detectado && streamMetrics.peso_estimado_kg ? (
                      <span>
                        Capturar y Registrar Peso (
                        <strong>{streamMetrics.peso_estimado_kg.toFixed(2)} kg</strong>)
                      </span>
                    ) : (
                      <span>Capturar y Registrar Peso del Cerdo</span>
                    )}
                  </span>
                )}
              </Button>
              <p className="text-[11px] text-center text-slate-500 font-medium">
                💡 Al pulsar el botón, se congela el fotograma dorsal, se valida la geometría alométrica y se guarda el pesaje en la serie temporal.
              </p>
            </div>
          </div>
        ) : (
          /* MODO SECUNDARIO: SUBIDA DE FOTO DESDE EL NAVEGADOR */
          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center min-h-64 max-h-96">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aiResult?.imagen_anotada_base64 || imagePreview}
                  alt="Previsualización dorsal"
                  className="max-h-96 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCapturing}
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
                    Sube una fotografía dorsal cenital
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Toma la foto a 90° perpendicular sobre el lomo del animal (~2.20 m de altura).
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm">
                  <Upload size={14} /> Seleccionar Imagen
                </span>
              </div>
            )}

            <Button
              type="button"
              tone="primary"
              onClick={handleRunAiEstimationFile}
              isLoading={isCapturing}
              disabled={isCapturing || !imageFile || !selectedAnimalId || !selectedCorralId}
              className="w-full py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
            >
              {isCapturing ? "Procesando Imagen con YOLO..." : "Calcular Peso de Fotografía"}
            </Button>
          </div>
        )}

        {/* Checkbox de Persistencia en Base de Datos */}
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
              Guarda el pesaje en la hipertabla TimescaleDB y actualiza peso_actual_kg del cerdo.
            </p>
          </div>
        </label>
      </Card>

      {/* ===================================================================== */}
      {/* PANEL DERECHO: MÉTRICAS EN VIVO & ÚLTIMA CAPTURA CONFIRMADA          */}
      {/* ===================================================================== */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        {/* Widget 1: Ticker de Peso en Vivo Instantáneo */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
              <Radio size={16} className="text-red-500 animate-pulse" />
              Lectura en Tiempo Real
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {streamMetrics.fps ? `${streamMetrics.fps} FPS` : "Dahua TPC-BF"}
            </span>
          </div>

          <div className="text-center py-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              Peso Instantáneo Estimado
            </span>
            <div className="text-5xl font-black tracking-tight font-mono text-white flex items-baseline justify-center gap-1.5">
              {streamMetrics.detectado && streamMetrics.peso_estimado_kg ? (
                <>
                  <span className="text-emerald-400">
                    {streamMetrics.peso_estimado_kg.toFixed(2)}
                  </span>
                  <span className="text-2xl text-slate-400 font-sans font-bold">kg</span>
                </>
              ) : (
                <span className="text-slate-500 font-mono text-4xl">--.-- kg</span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-2">
              {streamMetrics.mensaje}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Confianza IA
              </span>
              <span className="text-sm font-black font-mono text-slate-200">
                {streamMetrics.confianza
                  ? `${(streamMetrics.confianza * 100).toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Área Dorsal
              </span>
              <span className="text-sm font-black font-mono text-slate-200">
                {streamMetrics.area_cm2 ? `${streamMetrics.area_cm2} cm²` : "N/A"}
              </span>
            </div>
          </div>
        </Card>

        {/* Widget 2: Resultado de la Última Captura Confirmada */}
        {aiResult && aiResult.detectado ? (
          <Card className="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-xl shadow-emerald-500/10 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-wider">
                <CheckCircle2 size={16} />
                Última Medición Confirmada
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                {aiResult.id_registro_persistido ? "Guardado en DB" : "Previa"}
              </span>
            </div>

            {/* Imagen de Evidencia Anotada */}
            {aiResult.imagen_anotada_base64 && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-200 bg-slate-950 max-h-48 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aiResult.imagen_anotada_base64}
                  alt="Evidencia fotográfica anotada"
                  className="w-full h-auto max-h-48 object-contain"
                />
              </div>
            )}

            {/* Peso Confirmado */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-0.5">
                Peso Registrado
              </span>
              <p className="text-4xl font-black text-slate-950 font-mono">
                {aiResult.peso_estimado_kg?.toFixed(2)}
                <span className="text-xl text-emerald-700 ml-1 font-sans font-bold">kg</span>
              </p>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                ✓ Grabado en serie temporal registro_pesos
              </p>
            </div>

            {/* Métricas Morfométricas Detalladas */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">
                  Largo
                </span>
                <span className="font-black text-slate-800 font-mono">
                  {aiResult.largo_cm ? `${aiResult.largo_cm} cm` : "N/D"}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">
                  Ancho
                </span>
                <span className="font-black text-slate-800 font-mono">
                  {aiResult.ancho_cm ? `${aiResult.ancho_cm} cm` : "N/D"}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">
                  Área
                </span>
                <span className="font-black text-slate-800 font-mono">
                  {aiResult.area_cm2 ? `${aiResult.area_cm2} cm²` : "N/D"}
                </span>
              </div>
            </div>

            {aiResult.id_registro_persistido && (
              <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-0.5">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">ID Registro:</span>
                  <span className="truncate max-w-[140px]">{aiResult.id_registro_persistido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">Hora:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </Card>
        ) : (
          /* Widget Informativo */
          <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-3 text-slate-700">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-900">
              <Info size={16} className="text-indigo-600" />
              Instrucciones de Pesaje Cenital
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              La cámara industrial Dahua TPC-BF enfoca perpendicularmente a 90° sobre el lomo del cerdo:
            </p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <span className="font-mono font-bold text-indigo-600">1.</span>
                <span>Elige el ejemplar porcino en la lista desplegable.</span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <span className="font-mono font-bold text-indigo-600">2.</span>
                <span>Observa el encuadre en el video en vivo y verifica la detección verde.</span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                <span className="font-mono font-bold text-indigo-600">3.</span>
                <span>Pulsa el botón verde o presiona <strong>Espacio</strong> para capturar.</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
