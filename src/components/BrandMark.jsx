import Link from "next/link";

export default function BrandMark({ light = true, className = "" }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/assets/SENA.png" 
        alt="Logo SENA" 
        className="h-10 w-auto object-contain" 
      />
      <div>
        <p className={`text-xl font-black tracking-tight ${light ? 'text-white' : 'text-sena-blue'}`}>
          Porci<span className="text-sena-green font-black">Tech</span>
        </p>
      </div>
    </Link>
  );
}