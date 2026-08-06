// src/components/ui/Skeleton.jsx
import React from 'react';

export default function Skeleton() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1128] to-[#101f42] text-white">

      {/* CONTENEDOR DE LA ANIMACIÓN EN CÍRCULOS */}
      <div className="relative flex items-center justify-center w-40 h-40">

        {/* 1. Círculo de pista de fondo */}
        <div className="absolute w-full h-full border-4 border-dashed border-pink-500/20 rounded-full animate-[spin_8s_linear_infinite]"></div>

        {/* 2. El Cerdito corriendo en círculos */}
        <div className="absolute w-full h-full flex justify-start items-center animate-[spin_2.5s_linear_infinite]">
          <span className="text-5xl select-none transform -rotate-90">
            🐷
          </span>
        </div>

        {/* 3. Destello de luz en el centro */}
        <div className="w-12 h-12 bg-pink-500/10 rounded-full blur-md animate-pulse"></div>
      </div>

      {/* TEXTO DE CARGA INFERIOR */}
      <div className="mt-6 text-center space-y-2">
        <h3 className="text-xl font-bold tracking-wider text-pink-400 animate-pulse">
          Cargando PorciTech...
        </h3>
        <p className="text-sm text-slate-400 max-w-xs px-4">
          Estamos alistando los datos de la porqueriza, un momento por favor.
        </p>
      </div>

    </div>
  );
}