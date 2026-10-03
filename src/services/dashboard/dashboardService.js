import { apiFetch } from "../apiClient.js";

/**
 * Obtiene los KPIs consolidados del dashboard analítico de PorciTech.
 * Endpoint: GET /api/v1/dashboard/kpis
 *
 * @returns {Promise<{
 *   total_animales: number,
 *   total_corrales_activos: number,
 *   peso_promedio_granja_kg: number,
 *   gmd_promedio_kg: number,
 *   alertas_sanitarias: number,
 *   alertas_inventario_stock: number,
 *   tasa_ocupacion_porcentaje: number,
 *   distribucion_etapas: Record<string, number>
 * }>}
 */
export async function getDashboardKPIs() {
  return await apiFetch("/dashboard/kpis");
}

/**
 * Obtiene el registro de actividad reciente consolidado de la granja.
 * Endpoint: GET /api/v1/dashboard/recent-activity?limite=10
 *
 * @param {number} [limite=10] - Cantidad máxima de eventos a recuperar.
 * @returns {Promise<Array<{
 *   id: string,
 *   tipo: 'pesaje' | 'sanidad' | 'alimentacion' | 'inventario' | 'animal',
 *   titulo: string,
 *   descripcion: string,
 *   tiempo: string,
 *   usuario: string,
 *   metadata?: Record<string, any>
 * }>>}
 */
export async function getRecentActivity(limite = 10) {
  return await apiFetch(`/dashboard/recent-activity?limite=${limite}`);
}

/**
 * Obtiene las alertas críticas y sugerencias operativas generadas por el sistema.
 * Endpoint: GET /api/v1/dashboard/alerts
 *
 * @returns {Promise<Array<{
 *   id: string,
 *   nivel: 'warning' | 'danger' | 'info',
 *   modulo: 'sanidad' | 'inventario' | 'manejo',
 *   mensaje: string,
 *   accion_sugerida: string
 * }>>}
 */
export async function getDashboardAlerts() {
  return await apiFetch("/dashboard/alerts");
}
