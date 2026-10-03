import { apiFetch } from './apiClient.js';

/**
 * Servicio para la gestión de alimentación y raciones en la API backend de PorciTech (FastAPI).
 */

/**
 * Obtiene el historial de raciones servidas en la granja con filtros opcionales.
 * Endpoint: GET /api/v1/alimentacion/raciones
 * 
 * @param {object} [params={}] - Filtros de consulta.
 * @param {string} [params.corral_id] - UUID del corral.
 * @param {number} [params.limite=50] - Cantidad máxima de registros a recuperar.
 * @returns {Promise<Array<{
 *   id: string,
 *   corral_id: string,
 *   corral_codigo: string,
 *   alimento_item_id: string,
 *   alimento_nombre: string,
 *   operario_id?: string,
 *   operario_nombre?: string,
 *   fase_alimentacion: 'Pre-iniciador' | 'Iniciador' | 'Levante' | 'Ceba',
 *   cantidad_kg: number,
 *   costo_total?: number,
 *   fecha_suministro: string,
 *   observaciones?: string
 * }>>}
 */
export async function getRations(params = {}) {
  const query = new URLSearchParams();

  if (params.corral_id && params.corral_id !== 'all') {
    query.append('corral_id', params.corral_id);
  }
  if (params.limite) {
    query.append('limite', String(params.limite));
  }

  const queryString = query.toString();
  const endpoint = queryString ? `/alimentacion/raciones?${queryString}` : '/alimentacion/raciones';
  return await apiFetch(endpoint);
}

/**
 * Registra el suministro de una ración de alimento en un corral, descontando stock de bodega.
 * Endpoint: POST /api/v1/alimentacion/raciones
 * 
 * @param {object} data - Datos del suministro.
 * @param {string} data.corral_id - UUID del corral destino.
 * @param {string} data.alimento_item_id - UUID del insumo de inventario (alimento).
 * @param {string} data.fase_alimentacion - Fase nutricional ('Pre-iniciador', 'Iniciador', 'Levante', 'Ceba').
 * @param {number} data.cantidad_kg - Peso total servido en kilogramos.
 * @param {string} [data.observaciones] - Notas o incidencias del operario.
 * @returns {Promise<object>} Registro de ración creado.
 */
export async function registerRation(data) {
  return await apiFetch('/alimentacion/raciones', {
    method: 'POST',
    body: data,
  });
}

const feedingService = {
  getRations,
  registerRation,
};

export default feedingService;
