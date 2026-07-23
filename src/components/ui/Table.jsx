export default function Table({ columns, rows, headers, children, className = "" }) {
  if (columns && rows) {
    return (
      <div className={`overflow-hidden rounded-[1.5rem] border border-slate-200 ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-slate-700 font-medium">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto border border-zinc-900 rounded-lg bg-zinc-950 ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        {headers && (
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 font-semibold">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-zinc-900 text-zinc-300">
          {children}
        </tbody>
      </table>
    </div>
  );
}
