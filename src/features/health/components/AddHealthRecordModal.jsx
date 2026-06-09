export default function AddHealthRecordModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-white mb-4">Registrar Novedad Médica</h3>
        <p className="text-zinc-400 text-sm mb-6">Ingreso clínico de alertas sanitarias, vacunas o tratamientos.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white text-sm">Cancelar</button>
          <button className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
  );
}
