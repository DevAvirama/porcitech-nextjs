import Image from "next/image";

export default function BrandMark({ light }) {
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
      <h1 className="text-3xl font-black text-sena-blue">
        Porci<span className="text-sena-green">Tech</span>
      </h1>
    </div>
  );
}
