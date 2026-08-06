"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Truck,
  Bug,
  Trash2,
  Droplets,
} from "lucide-react";
import Card from "@/components/ui/Card";
import ModuleHeader from "@/components/layout/ModuleHeader";
import biosecurityProtocols from "./data/biosecurityProtocols.json";

const iconMap = {
  ShieldCheck,
  UserCheck,
  Truck,
  Bug,
  Trash2,
  Droplets,
};

const BiosecurityView = () => {
  const [checkedItems, setCheckedItems] = useState({});

  const { structural, operational } = biosecurityProtocols;
  const totalItems = structural.length + operational.length;
  const checkedCount = Object.keys(checkedItems).filter(
    (key) => checkedItems[key],
  ).length;
  const progress = Math.round((checkedCount / totalItems) * 100) || 0;

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderProtocolItem = (item) => {
    const IconComponent = iconMap[item.icon];
    const isChecked = !!checkedItems[item.id];

    return (
      <div
        key={item.id}
        onClick={() => toggleCheck(item.id)}
        className={`flex items-start gap-4 p-5 border rounded-2xl cursor-pointer transition-all ${
          isChecked
            ? "bg-emerald-50/50 border-emerald-200"
            : "bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100/50"
        }`}
      >
        <div className="mt-1">
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-slate-300 text-emerald-500 accent-emerald-500 cursor-pointer"
            checked={isChecked}
            onChange={() => {}} // Handled by parent div onClick
          />
        </div>
        <div
          className={`p-2 rounded-xl transition-colors ${isChecked ? "bg-emerald-100" : "bg-slate-100"}`}
        >
          {IconComponent && (
            <IconComponent
              className={`w-6 h-6 ${isChecked ? "text-emerald-600" : "text-slate-500"}`}
            />
          )}
        </div>
        <div className="flex-1">
          <h4
            className={`font-bold transition-colors ${isChecked ? "text-emerald-900" : "text-slate-900"}`}
          >
            {item.task}
          </h4>
          <p
            className={`text-sm mt-1 transition-colors ${isChecked ? "text-emerald-700/80" : "text-slate-500"}`}
          >
            {item.desc}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="SANIDAD Y BIOSEGURIDAD"
        title="Control de Bioseguridad"
        description="Lista de verificación de protocolos estructurales y operativos de la granja."
        actions={
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150 shrink-0">
            <span className="font-bold text-slate-700 text-sm">Progreso:</span>
            <span className="text-xl font-black text-emerald-600">{progress}%</span>
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Protocolos Estructurales */}
        <Card className="rounded-[2rem]! p-6 bg-white border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <ShieldCheck className="text-emerald-500 w-5 h-5" />
            </div>
            Protocolos Estructurales
          </h3>
          <div className="space-y-4">{structural.map(renderProtocolItem)}</div>
        </Card>

        {/* Protocolos Operativos */}
        <Card className="rounded-[2rem]! p-6 bg-white border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <UserCheck className="text-emerald-500 w-5 h-5" />
            </div>
            Protocolos Operativos
          </h3>
          <div className="space-y-4">{operational.map(renderProtocolItem)}</div>
        </Card>
      </div>
    </div>
  );
};

export default BiosecurityView;
