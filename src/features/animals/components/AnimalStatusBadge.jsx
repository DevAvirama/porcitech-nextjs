import React from "react";

const AnimalStatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  // Mapeo dinámico de colores y estilos según el estado o fase zootécnica
  const styleMap = {
    activo: "bg-emerald-100 text-emerald-700 border-emerald-200",
    saludable: "bg-emerald-100 text-emerald-700 border-emerald-200",
    óptimo: "bg-emerald-100 text-emerald-700 border-emerald-200",
    optimo: "bg-emerald-100 text-emerald-700 border-emerald-200",

    precebo: "bg-orange-100 text-orange-700 border-orange-200",
    levante: "bg-amber-100 text-amber-700 border-amber-200",
    ceba: "bg-blue-100 text-blue-700 border-blue-200",
    engorde: "bg-blue-100 text-blue-700 border-blue-200",

    maternidad: "bg-pink-100 text-pink-700 border-pink-200",
    gestacion: "bg-purple-100 text-purple-700 border-purple-200",
    gestación: "bg-purple-100 text-purple-700 border-purple-200",
    reproduccion: "bg-purple-100 text-purple-700 border-purple-200",
    reproducción: "bg-purple-100 text-purple-700 border-purple-200",

    observacion: "bg-yellow-100 text-yellow-800 border-yellow-200",
    observación: "bg-yellow-100 text-yellow-800 border-yellow-200",
    "en tratamiento": "bg-yellow-100 text-yellow-800 border-yellow-200",
    cuarentena: "bg-rose-100 text-rose-700 border-rose-200",
    crítico: "bg-rose-100 text-rose-700 border-rose-200",
    critico: "bg-rose-100 text-rose-700 border-rose-200",
    inactivo: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const badgeStyle = styleMap[normalized] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${badgeStyle}`}
    >
      {status}
    </span>
  );
};

export default AnimalStatusBadge;
