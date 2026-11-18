import Image from "next/image";

export default function BrandMark({ light = false, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Image
          src="/assets/SENA.png"
          alt="SENA"
          width={36}
          height={36}
          className="h-8 w-auto sm:h-9 shrink-0"
          priority
        />
        <span
          className={`text-xl sm:text-2xl font-black tracking-tight ${
            light ? "text-white" : "text-sena-blue"
          }`}
        >
          Porci<span className="text-sena-green">Tech</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Image
        src="/assets/SENA.png"
        alt="SENA"
        width={57}
        height={56}
        className="h-14 w-auto mb-2"
        priority
      />
      <h1 className={`text-3xl font-black ${light ? "text-white" : "text-sena-blue"}`}>
        Porci<span className="text-sena-green">Tech</span>
      </h1>
    </div>
  );
}
