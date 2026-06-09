export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
