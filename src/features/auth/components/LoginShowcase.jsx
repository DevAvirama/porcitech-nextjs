import Image from "next/image";

export default function LoginShowcase() {
  return (
    <div className="relative h-full flex flex-col justify-between p-12 text-white">
      {/* Background graphic */}
      <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-[#09090b]/85 to-transparent z-10" />
      <Image
        src="/assets/cerdito.jpg"
        alt="Porcino"
        fill
        className="object-cover opacity-50"
      />

      <div className="relative z-20">
        <span className="text-xs font-semibold uppercase tracking-wider text-sena-green">
          SISTEMA INTEGRAL PORCINO
        </span>
      </div>

      <div className="relative z-20 space-y-4 max-w-md">
        <blockquote className="text-lg font-medium leading-relaxed italic text-zinc-200">
          Optimización de la producción, trazabilidad biológica, sanidad animal
          y nutrición controlada en un solo lugar.
        </blockquote>
        <div className="flex flex-col">
          <cite className="not-italic font-bold text-zinc-300">
            SENA Centro Agropecuario
          </cite>
          <span className="text-xs text-zinc-500">
            Área de Producción Pecuaria
          </span>
        </div>
      </div>
    </div>
  );
}
