import Link from "next/link";
import Image from "next/image";

export default function BrandMark({ className = "" }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-sena-green/10 flex items-center justify-center border border-sena-green/20">
        <Image
          src="/assets/SENA.png"
          alt="SENA Logo"
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
      <span className="font-bold tracking-tight text-white text-base">
        Sistema Integral <span className="text-sena-green">Porcino</span>
      </span>
    </Link>
  );
}
