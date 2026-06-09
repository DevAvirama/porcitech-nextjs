"use client";

import Image from "next/image";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import { marketingTexts } from "./data";

export default function LandingView() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col">
      <PublicHeader />

      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden py-20 px-6">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.06),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Plataforma Institucional SENA
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              {marketingTexts.heroTitle}
            </h1>
            
            <p className="text-zinc-400 text-base md:text-lg max-w-lg leading-relaxed">
              {marketingTexts.heroSubtitle}
            </p>

            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white shadow-md shadow-rose-600/10 transition-all"
              >
                Ingresar al Sistema
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-semibold text-zinc-300 transition-all"
              >
                Ver Demo
              </Link>
            </div>
          </div>

          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950/45">
            <Image
              src="/assets/hero.png"
              alt="Dashboard Preview"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 relative z-10 w-full">
          {marketingTexts.features.map((feat, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
              <h3 className="text-base font-bold text-white">{feat.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
