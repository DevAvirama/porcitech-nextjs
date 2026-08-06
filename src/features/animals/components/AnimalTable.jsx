import Table from "../../../components/ui/Table";
import AnimalStatusBadge from "./AnimalStatusBadge";

const AnimalTable = ({ animals, onDelete, isTrash, onRecover, onPermanentDelete }) => {
    const columns = [
        {
            key: 'id',
            header: 'ID',
            render: (row) => <span className="font-bold text-slate-800">#{row.id || 'N/A'}</span>
        },
        { key: 'lote', header: 'LOTE' },
        { key: 'raza', header: 'RAZA' },
        {
            key: 'estado',
            header: 'ESTADO',
            render: (row) => <AnimalStatusBadge status={row.estado} />
        },
        {
            key: 'acciones',
            header: isTrash ? 'ACCIONES PAPELERA' : 'ACCIONES',
            render: (row) => (
                <div className="flex justify-center gap-3">
                    {isTrash ? (
                        <>
                            <button onClick={() => onRecover(row.id)} title="Recuperar" className="text-xl hover:scale-120 transition-transform cursor-pointer">🔄</button>
                            <button onClick={() => onPermanentDelete(row.id)} title="Eliminar para siempre" className="text-xl hover:scale-120 transition-transform text-red-500 cursor-pointer">❌</button>
                        </>
                    ) : (
                        <button onClick={() => onDelete(row.id)} className="text-slate-300 hover:text-red-500 text-xl transition-all cursor-pointer">🗑️</button>
                    )}
                </div>
            )
        }
    ];

    return <Table columns={columns} rows={animals} />;
};

export default AnimalTable;
