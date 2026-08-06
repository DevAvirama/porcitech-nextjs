function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      ) : null}
      <input
        className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 ${className}`}
        {...props}
      />
    </label>
  )
}

export default Input
