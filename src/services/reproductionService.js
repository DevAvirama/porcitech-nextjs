import { apiFetch } from './apiClient.js';

/**
 * Servicio para la gestión del ciclo reproductivo en la API backend de PorciTech (FastAPI).
 */

/**
 * Obtiene la lista de servicios reproductivos e inseminaciones.
 * Endpoint: GET /api/v1/reproduccion/servicios
 * 
 * @returns {Promise<Array<{
 *   id: string,
 *   hembra_id: string,
 *   hembra_arete: string,
 *   hembra_alias?: string,
 *   macho_id?: string,
 *   macho_arete?: string,
 *   tecnico_nombre?: string,
 *   tipo_servicio: 'inseminacion_artificial' | 'monta_natural',
 *   codigo_pajilla_macho?: string,
 *   fecha_servicio: string,
 *   fecha_probable_parto: string,
 *   estado_confirmacion: 'pendiente' | 'positiva' | 'negativa' | 'repetida',
 *   fecha_diagnostico?: string
 * }>>}
 */
export async function getServices() {
  return await apiFetch('/reproduccion/servicios');
}

/**
 * Registra un nuevo servicio reproductivo (monta o inseminación).
 * Endpoint: POST /api/v1/reproduccion/servicios
 * 
 * @param {object} data - Datos del servicio.
 * @param {string} data.hembra_id - UUID de la cerda madre.
 * @param {string} [data.macho_id] - UUID del verraco/semental si aplica.
 * @param {'inseminacion_artificial' | 'monta_natural'} data.tipo_servicio - Modalidad del servicio.
 * @param {string} [data.codigo_pajilla_macho] - Identificador de la dosis de semen.
 * @param {string} data.fecha_servicio - Fecha en formato YYYY-MM-DD.
 * @param {'pendiente' | 'positiva' | 'negativa' | 'repetida'} [data.estado_confirmacion='pendiente'] - Estado inicial.
 * @returns {Promise<object>} Servicio registrado.
 */
export async function createService(data) {
  return await apiFetch('/reproduccion/servicios', {
    method: 'POST',
    body: data,
  });
}

/**
 * Obtiene el registro histórico de partos y camadas nacidas.
 * Endpoint: GET /api/v1/reproduccion/partos
 * 
 * @returns {Promise<Array<{
 *   id: string,
 *   servicio_id?: string,
 *   hembra_id: string,
 *   hembra_arete: string,
 *   corral_maternidad_codigo?: string,
 *   fecha_parto: string,
 *   nacidos_vivos: number,
 *   nacidos_muertos: number,
 *   momias: number,
 *   peso_camada_total_kg: number,
 *   observaciones?: string
 * }>>}
 */
export async function getFarrowings() {
  return await apiFetch('/reproduccion/partos');
}

/**
 * Registra un nuevo parto y la camada obtenida.
 * Endpoint: POST /api/v1/reproduccion/partos
 * 
 * @param {object} data - Datos del parto.
 * @param {string} [data.servicio_id] - UUID del servicio reproductivo previo.
 * @param {string} data.hembra_id - UUID de la madre.
 * @param {string} [data.corral_maternidad_id] - UUID del corral de paridera.
 * @param {string} data.fecha_parto - Fecha y hora del parto (ISO8601 o YYYY-MM-DD).
 * @param {number} data.nacidos_vivos - Cantidad de lechones vivos.
 * @param {number} [data.nacidos_muertos=0] - Cantidad de lechones muertos.
 * @param {number} [data.momias=0] - Cantidad de lechones momificados.
 * @param {number} data.peso_camada_total_kg - Peso total de la camada en kg.
 * @param {string} [data.observaciones] - Notas del alumbramiento.
 * @returns {Promise<object>} Registro de parto creado.
 */
export async function createFarrowing(data) {
  return await apiFetch('/reproduccion/partos', {
    method: 'POST',
    body: data,
  });
}

/**
 * Obtiene el historial de destetes de lechones.
 * Endpoint: GET /api/v1/reproduccion/destetes
 * 
 * @returns {Promise<Array<{
 *   id: string,
 *   parto_id?: string,
 *   hembra_id: string,
 *   hembra_arete?: string,
 *   corral_destino_id?: string,
 *   corral_destino_codigo?: string,
 *   fecha_destete: string,
 *   lechones_destetados: number,
 *   peso_total_kg: number,
 *   dias_lactancia: number
 * }>>}
 */
export async function getWeanings() {
  return await apiFetch('/reproduccion/destetes');
}

/**
 * Registra el destete de una camada y traslada los lechones a corral de precebo.
 * Endpoint: POST /api/v1/reproduccion/destetes
 * 
 * @param {object} data - Datos del destete.
 * @param {string} [data.parto_id] - UUID del parto asociado.
 * @param {string} data.hembra_id - UUID de la hembra.
 * @param {string} data.corral_destino_id - UUID del corral de destino (precebo).
 * @param {string} data.fecha_destete - Fecha de destete (YYYY-MM-DD).
 * @param {number} data.lechones_destetados - Cantidad de lechones destetados.
 * @param {number} data.peso_total_kg - Peso total del lote destetado en kg.
 * @param {number} data.dias_lactancia - Duración de la lactancia en días.
 * @returns {Promise<object>} Registro de destete creado.
 */
export async function createWeaning(data) {
  return await apiFetch('/reproduccion/destetes', {
    method: 'POST',
    body: data,
  });
}

const reproductionService = {
  getServices,
  createService,
  getFarrowings,
  createFarrowing,
  getWeanings,
  createWeaning,
};

export default reproductionService;
