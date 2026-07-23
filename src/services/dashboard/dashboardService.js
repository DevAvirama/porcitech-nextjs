export function getDashboardData() {
  return {
    sidebarItems: [
      { name: "Inicio", path: "/dashboard" },
      { name: "Inventario", path: "/dashboard/inventory" },
      { name: "Registro de animales", path: "/dashboard/animals" },
      { name: "Alimentación", path: "/dashboard/feeding" },
      { name: "Registro de peso", path: "/dashboard/weight" },
      { name: "Reproducción", path: "/dashboard/reproduction" },
      { name: "Vacunación", path: "/dashboard/health" },
      { name: "Alertas y reportes", path: "/dashboard/reports" },
      { name: "Configuración de usuarios", path: "/dashboard/settings" },
    ],
    stats: [
      {
        title: "Total de cerdos",
        value: 1500,
        detail: "+2.5%",
        width: "w-[88%]",
        tone: "bg-emerald-500",
      },
      {
        title: "Cerdos en crecimiento",
        value: 1200,
        detail: "80% del total",
        width: "w-[80%]",
        tone: "bg-sky-500",
      },
      {
        title: "Listos para venta",
        value: 300,
        detail: "20% del total",
        width: "w-[35%]",
        tone: "bg-amber-400",
      },
    ],
    quickActions: [
      { label: "Registrar nuevo cerdo", path: "/dashboard/animals" },
      { label: "Ver inventario", path: "/dashboard/inventory" },
      { label: "Registrar alimentación", path: "/dashboard/feeding" },
      { label: "Ver reportes de salud", path: "/dashboard/health" },
    ],
    recentActivity: [
      { id: 1, title: "Nuevo lote registrado", meta: "Hace 2 horas", area: "Sector B-04" },
      { id: 2, title: "Vacunación completada", meta: "Hace 5 horas", area: "Sector A-12" },
      { id: 3, title: "Alerta de peso bajo", meta: "Ayer", area: "Corral 09" },
    ],
  };
}

const dashboardService = {
  getDashboardData,
  getKPIs: async () => {
    return {
      activePopulation: 320,
      feedConsumptionTon: 4.2,
      conversionRateFCR: 2.4,
      activeAlerts: 0,
    };
  },
};

export default dashboardService;
