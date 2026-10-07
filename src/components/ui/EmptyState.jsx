"use client";

import React from "react";
import Button from "./Button";
import Card from "./Card";

export default function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <Card className={`flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-100 rounded-3xl ${className}`}>
      {Icon && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 border border-emerald-100/80 shadow-2xs">
          <Icon className="h-10 w-10" />
        </div>
      )}
      <h3 className="text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          tone="primary"
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
