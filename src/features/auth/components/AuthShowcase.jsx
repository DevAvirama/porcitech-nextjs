import BrandMark from "../../../components/BrandMark.jsx";

/**
 * Panel lateral centrado y unificado para las pantallas de autenticación.
 */
export default function AuthShowcase({ eyebrow, title, description }) {
  return (
    <div className="flex flex-col items-center gap-14 text-center">
      <BrandMark light />
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 text-lg leading-8 text-slate-300">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
