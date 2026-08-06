"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Baby, Activity, TrendingDown } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import biosecurityProtocols from "../../health/data/biosecurityProtocols.json";
import reproductionStandards from "../../reproduction/data/reproductionStandards.json";
import weightStandards from "../../weight/data/weightStandards.json";
import { ShieldCheck } from "lucide-react";

function SystemSuggestion() {
  const router = useRouter();

  // Mocks de estados para probar las prioridades del sistema
  const compliance = 95; // Si es menor a 90 dispara alerta de bioseguridad
  const loteCrecimiento = { id: "L-042", gdpReal: 680, gdpIdeal: 800 }; // Desviación de crecimiento
  const hembraPartoInminente = { id: "H-045", diasGestacion: 100 }; // Cambiar a 110 para ver alerta
  const hembraAnestro = { id: "H-089", diasPostDestete: 8 }; // Cambiar a 12 para ver alerta

  // 1. Alerta de Bioseguridad (Prioridad Crítica)
  if (compliance < 90) {
    const protocol = biosecurityProtocols.structural.find(
      (p) => p.task === "Arco de Desinfección",
    );

    return (
      <Card className="bg-rose-950! text-white shadow-xl shadow-rose-900/20">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            Prioridad Crítica
          </p>
        </div>
        <h3 className="mt-4 text-3xl font-black">Revisar Protocolo ICA</h3>
        <p className="mt-4 leading-7 text-rose-200/80">
          El cumplimiento sanitario ha caído al {compliance}%. Es urgente
          revisar los protocolos de{" "}
          <strong>{protocol?.task || "Arco de Desinfección"}</strong> (
          {protocol?.desc}) para cumplir con la normativa ICA.
        </p>
        <Button
          className="mt-8 border-none bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/30 text-white"
          onClick={() => router.push("/dashboard/health")}
        >
          Ver Protocolos
        </Button>
      </Card>
    );
  }

  // 2. Alerta de Desviación de Crecimiento (Prioridad Alta)
  const desviacionGDP =
    (loteCrecimiento.gdpIdeal - loteCrecimiento.gdpReal) /
    loteCrecimiento.gdpIdeal;
  const gdpCritica =
    weightStandards.configuracion_crecimiento_colombia.alertas_rendimiento
      .gdp_critica_bajo_rendimiento;

  if (desviacionGDP > 0.1) {
    const isCritical = loteCrecimiento.gdpReal < gdpCritica;
    const bgCard = isCritical ? "!bg-rose-950" : "!bg-orange-950";
    const shadowCard = isCritical
      ? "shadow-rose-900/20"
      : "shadow-orange-900/20";
    const textAlert = isCritical ? "text-rose-400" : "text-orange-400";
    const textDesc = isCritical ? "text-rose-200/80" : "text-orange-200/80";
    const btnClass = isCritical
      ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30"
      : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30";

    return (
      <Card className={`${bgCard} text-white shadow-xl ${shadowCard}`}>
        <div className={`flex items-center gap-2 ${textAlert}`}>
          <TrendingDown className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            Prioridad Alta
          </p>
        </div>
        <h3 className="mt-4 text-3xl font-black">Alerta de Rendimiento</h3>
        <p className={`mt-4 leading-7 ${textDesc}`}>
          📉 El Lote <strong>{loteCrecimiento.id}</strong> presenta un
          crecimiento por debajo del estándar de Porkcolombia (
          {loteCrecimiento.gdpReal} g/día vs esperado de{" "}
          {loteCrecimiento.gdpIdeal} g/día). Revisar conversión alimenticia.
        </p>
        <Button
          className={`mt-8 border-none text-white shadow-md ${btnClass}`}
          onClick={() => router.push("/dashboard/weight")}
        >
          Ver Análisis
        </Button>
      </Card>
    );
  }

  // Parámetros dinámicos de Reproducción
  const duracionPromedio =
    reproductionStandards.reproduccion_porcina_colombia.parametros_gestacion
      .duracion_promedio_dias;
  const preparacionDias =
    reproductionStandards.reproduccion_porcina_colombia.parametros_gestacion
      .inicio_preparacion_paridera;
  const umbralAnestro =
    reproductionStandards.reproduccion_porcina_colombia
      .intervalo_destete_celo_idc.umbral_hembra_problema_anestro;

  // 3. Alerta de Parto Inminente (Prioridad Media)
  if (
    duracionPromedio - hembraPartoInminente.diasGestacion <=
    preparacionDias
  ) {
    return (
      <Card className="bg-fuchsia-950! text-white shadow-xl shadow-fuchsia-900/20">
        <div className="flex items-center gap-2 text-fuchsia-400">
          <Baby className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            Prioridad Media
          </p>
        </div>
        <h3 className="mt-4 text-3xl font-black">Parto Inminente</h3>
        <p className="mt-4 leading-7 text-fuchsia-200/80">
          Trasladar Hembra <strong>{hembraPartoInminente.id}</strong> a paridera
          para aclimatación. Ha entrado en la ventana de los {preparacionDias}{" "}
          días previos al parto estimado.
        </p>
        <Button
          className="mt-8 border-none bg-fuchsia-500 hover:bg-fuchsia-600 shadow-md shadow-fuchsia-500/30 text-white"
          onClick={() => router.push("/dashboard/reproduction")}
        >
          Ver detalles
        </Button>
      </Card>
    );
  }

  // 4. Alerta de Anestro (Prioridad Media)
  if (hembraAnestro.diasPostDestete > umbralAnestro) {
    return (
      <Card className="bg-violet-950! text-white shadow-xl shadow-violet-900/20">
        <div className="flex items-center gap-2 text-violet-400">
          <Activity className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            Prioridad Media
          </p>
        </div>
        <h3 className="mt-4 text-3xl font-black">Alerta de Anestro</h3>
        <p className="mt-4 leading-7 text-violet-200/80">
          La Hembra <strong>{hembraAnestro.id}</strong> supera los{" "}
          {umbralAnestro} días post-destete sin reportar celo. Verificar
          alimentación y estimulación con macho recajo.
        </p>
        <Button
          className="mt-8 border-none bg-violet-500 hover:bg-violet-600 shadow-md shadow-violet-500/30 text-white"
          onClick={() => router.push("/dashboard/reproduction")}
        >
          Ver Ficha
        </Button>
      </Card>
    );
  }

  // 5. Estado Óptimo (Sin alertas)
  return (
    <Card className="bg-emerald-950! text-white shadow-xl shadow-emerald-900/20">
      <div className="flex items-center gap-2 text-emerald-400">
        <ShieldCheck className="h-5 w-5" />
        <p className="text-sm font-semibold uppercase tracking-[0.22em]">
          Estado del Sistema
        </p>
      </div>
      <h3 className="mt-4 text-3xl font-black">Operación Estable</h3>
      <p className="mt-4 leading-7 text-emerald-200/80">
        No se registran anomalías críticas ni retrasos de crecimiento. Los
        parámetros biológicos se encuentran dentro de las metas de Porkcolombia.
      </p>
    </Card>
  );
}

export default SystemSuggestion;
