"use client";

import Link from 'next/link';

export default function Button({
  as: Component = 'button',
  className = '',
  tone = 'primary',
  type = 'button',
  to,
  isLoading = false,
  disabled = false,
  children,
  onClick,
  ...props
}) {
  const tones = {
    primary:
      'bg-sena-green text-white hover:bg-[#2c8300] shadow-md shadow-sena-green/30 cursor-pointer',

    secondary:
      'bg-sena-blue text-white hover:bg-[#002235] shadow-md shadow-sena-blue/30 cursor-pointer',

    outline:
      'border border-white bg-transparent text-white hover:bg-white/10 cursor-pointer',

    accent:
      'bg-sena-green text-white hover:bg-[#2c8300] cursor-pointer',
      
    ghost:
      'border border-white/10 bg-white/0 text-slate-200 hover:bg-white/5 hover:text-white cursor-pointer',

    soft:
      'border border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-slate-950 cursor-pointer',
  }

  const isBtnDisabled = disabled || isLoading;

  let hrefProps = {};
  if (to && !isBtnDisabled) {
    hrefProps.href = to;
  }

  const handleLinkClick = (e) => {
    if (isBtnDisabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const isLink = !!to || Component === 'a' || Component === Link;
  const FinalComponent = to ? Link : Component;

  return (
    <FinalComponent
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold transition ${tones[tone]} ${isBtnDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      type={!isLink ? type : undefined}
      disabled={!isLink ? isBtnDisabled : undefined}
      onClick={isLink ? handleLinkClick : onClick}
      {...hrefProps}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </FinalComponent>
  )
}
