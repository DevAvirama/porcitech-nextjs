const AnimalStatusBadge = ({ status }) => {
    const styles = {
        SALUDABLE: "bg-emerald-100 text-emerald-600 border-emerald-200",
        OBSERVACIÓN: "bg-orange-100 text-orange-600 border-orange-200",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${styles[status] || "bg-slate-100 text-slate-400"}`}>
            {status}
        </span>
    );
};

export default AnimalStatusBadge;
