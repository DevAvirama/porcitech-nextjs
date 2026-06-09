export default function Button({ children, className = "", variant = "primary", ...props }) {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/10",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/10",
    ghost: "bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
