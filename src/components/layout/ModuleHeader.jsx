"use client";

import React from "react";
import Card from "@/components/ui/Card";

export default function ModuleHeader({
  category,
  title,
  description,
  actions,
  className = "",
}) {
  return (
    <Card
      as="header"
      className={`w-full rounded-[2rem] p-6 lg:p-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-2 bg-white border border-slate-100 shadow-sm ${className}`}
    >
      <div className="space-y-1 flex-1">
        {category && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {category}
          </p>
        )}
        <h1 className="text-3xl lg:text-4xl font-black text-slate-955 text-slate-950 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-slate-505 text-slate-500 font-medium text-sm lg:text-base mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 mt-2 lg:mt-0">
          {actions}
        </div>
      )}
    </Card>
  );
}
