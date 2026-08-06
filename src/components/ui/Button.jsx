function Button({
  as: Component = 'button',
  className = '',
  tone = 'primary',
  type = 'button',
  ...props
}) {
  const tones = {
    primary:
      'bg-sena-green text-white hover:bg-[#2c8300] shadow-md shadow-sena-green/30',

    secondary:
      'bg-sena-blue text-white hover:bg-[#002235] shadow-md shadow-sena-blue/30',

    outline:
      'border border-white bg-transparent text-white hover:bg-white/10',

    accent:
      'bg-sena-green text-white hover:bg-[#2c8300]',

    ghost:
      'border border-white/10 bg-white/0 text-slate-200 hover:bg-white/5 hover:text-white',

    soft:
      'border border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-slate-950',
  }

  return (
    <Component
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold transition ${tones[tone]} ${className}`}
      type={Component === 'button' ? type : undefined}
      {...props}
    />
  )
}

export default Button
