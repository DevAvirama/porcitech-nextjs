export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-zinc-400">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sena-green/50 transition-all ${
          error ? "border-red-500 focus:border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[11px] font-semibold text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
