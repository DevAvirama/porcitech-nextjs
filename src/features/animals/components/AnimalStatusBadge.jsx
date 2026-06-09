export default function AnimalStatusBadge({ status = "activo" }) {
  const styles = {
    activo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cuarentena: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    gestacion: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    vendido: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  const currentStyle = styles[status] || styles.activo;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${currentStyle} capitalize`}>
      {status}
    </span>
  );
}
