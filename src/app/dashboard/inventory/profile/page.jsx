import React, { Suspense } from "react";
import InventoryProfileView from "@/features/inventory/InventoryProfileView";

export default function InventoryProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-6 animate-pulse p-6">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      }
    >
      <InventoryProfileView />
    </Suspense>
  );
}
