export default function Table({ headers = [], children, className = "" }) {
  return (
    <div className={`w-full overflow-x-auto border border-zinc-900 rounded-lg bg-zinc-950 ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-semibold">
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900 text-zinc-300">
          {children}
        </tbody>
      </table>
    </div>
  );
}
