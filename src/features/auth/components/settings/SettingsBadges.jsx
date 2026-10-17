"use client";

import React from "react";
import { UserCheck, UserX } from "lucide-react";

export function RoleBadge({ rol }) {
  const roleKey = (rol || "").toLowerCase();
  if (roleKey === "administrador" || roleKey === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
        Administrador
      </span>
    );
  }
  if (roleKey === "veterinario") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        Veterinario
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 shadow-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
      Operario
    </span>
  );
}

export function StatusBadge({ activo }) {
  if (activo) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <UserCheck size={13} className="text-emerald-600" />
        Activo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
      <UserX size={13} className="text-rose-600" />
      Inactivo
    </span>
  );
}
