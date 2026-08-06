"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import Card from "@/components/ui/Card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Card Skeleton */}
      <Card
        as="header"
        className="flex flex-col gap-4 mb-8 rounded-4xl lg:flex-row lg:items-end lg:justify-between bg-white border border-slate-100"
      >
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-80 max-w-full" />
        </div>
        <div className="rounded-2xl bg-slate-900/5 px-5 py-4 w-36">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-6 w-24" />
        </div>
      </Card>

      {/* Stats Cards Skeleton (3 Columns) */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2 w-full rounded-full" />
          </Card>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Main content grid (Table + suggestion skeleton) */}
      <section className="mt-6 grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        {/* Table skeleton */}
        <Card className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-3">
            {/* Headers */}
            <div className="flex gap-4 border-b border-slate-100 pb-2">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            {/* Rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center py-2">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </Card>

        {/* Suggestion Card skeleton */}
        <Card className="bg-slate-950 text-white p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full bg-slate-800" />
              <Skeleton className="h-4 w-32 bg-slate-800" />
            </div>
            <Skeleton className="h-10 w-64 bg-slate-800" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-slate-800" />
              <Skeleton className="h-4 w-5/6 bg-slate-800" />
            </div>
          </div>
          <Skeleton className="h-12 w-32 bg-slate-800 rounded-xl mt-6" />
        </Card>
      </section>
    </div>
  );
}
