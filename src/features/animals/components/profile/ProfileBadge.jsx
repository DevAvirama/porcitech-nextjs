"use client";

import React from "react";
import animalConstants from "../../data/animalConstants.json";

export default function ProfileBadge({ estado, type = "salud" }) {
  if (!estado) return null;

  const themeMap = {
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    yellow: "bg-yellow-100 text-yellow-700",
    emerald: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
    rose: "bg-rose-100 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  let colorTheme = "slate";

  if (type === "salud") {
    switch (estado) {
      case "Óptimo":
      case "SALUDABLE":
        colorTheme = "emerald";
        break;
      case "En Tratamiento":
        colorTheme = "orange";
        break;
      case "Observación":
      case "OBSERVACIÓN":
        colorTheme = "yellow";
        break;
      case "Crítico":
        colorTheme = "rose";
        break;
      default:
        colorTheme = "slate";
    }
  } else if (type === "etapa") {
    const found = animalConstants.etapas.find(
      (e) =>
        e.label.toLowerCase() === estado.toLowerCase() ||
        e.id === estado.toLowerCase(),
    );
    if (found) {
      colorTheme = found.color;
    } else if (
      estado.toLowerCase() === "gestación" ||
      estado.toLowerCase() === "reproducción" ||
      estado.toLowerCase() === "reproduccion"
    ) {
      colorTheme = "purple";
    }
  }

  const colors = themeMap[colorTheme] || themeMap.slate;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors}`}
    >
      {estado}
    </span>
  );
}
