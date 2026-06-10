export default function Button({ children, className = "", variant = "primary", ...props }) {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-sena-green hover:bg-[#2c8300] text-white shadow-md shadow-sena-green/30",
    secondary: "bg-sena-blue hover:bg-[#002235] text-white shadow-md shadow-sena-blue/30",
    accent: "bg-sena-yellow hover:bg-[#e6ad00] text-sena-blue shadow-md shadow-sena-yellow/20",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/10",
    ghost: "bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
