import { apiFetch } from './apiClient.js';

/**
 * Servicio para la gestión clínica, tratamientos y bioseguridad en la API backend de PorciTech (FastAPI).
 */

/**
 * Obtiene la lista de protocolos maestros de bioseguridad.
 * Endpoint: GET /api/v1/sanidad/bioseguridad/protocolos
 * 
 * @param {boolean} [soloActivos=true] - Filtrar únicamente protocolos activos.
 * @returns {Promise<Array<{
 *   id: string,
 *   codigo: string,
 *   tipo_protocolo: 'estructural' | 'operacional',
 *   tarea: string,
 *   descripcion: string,
 *   icono: string,
 *   frecuencia: string,
 *   activo: boolean
 * }>>}
 */
export async function getProtocols(soloActivos = true) {
  const query = soloActivos ? '?activo=true' : '';
  return await apiFetch(`/sanidad/bioseguridad/protocolos${query}`);
}

/**
 * Obtiene las ejecuciones o cumplimientos de protocolos para una fecha específica.
 * Endpoint: GET /api/v1/sanidad/bioseguridad/ejecuciones?fecha=YYYY-MM-DD
 * 
 * @param {string} [fecha] - Fecha en formato YYYY-MM-DD (por defecto hoy).
 * @returns {Promise<Array<{
 *   id: string,
 *   protocolo_id: string,
 *   corral_id?: string,
 *   fecha: string,
 *   cumplido: boolean,
 *   observaciones?: string
 * }>>}
 */
export async function getDailyExecutions(fecha) {
  const query = fecha ? `?fecha=${fecha}` : '';
  return await apiFetch(`/sanidad/bioseguridad/ejecuciones${query}`);
}

/**
 * Registra o actualiza la ejecución (cumplimiento/no cumplimiento) de un protocolo de bioseguridad.
 * Endpoint: POST /api/v1/sanidad/bioseguridad/ejecuciones
 * 
 * @param {object} data - Datos de la ejecución.
 * @param {string} data.protocolo_id - UUID del protocolo.
 * @param {string} [data.corral_id] - UUID del corral si es específico.
 * @param {boolean} data.cumplido - Estado de verificación.
 * @param {string} [data.observaciones] - Notas o anomalías detectadas.
 * @returns {Promise<object>} Registro guardado.
 */
export async function toggleProtocolExecution(data) {
  return await apiFetch('/sanidad/bioseguridad/ejecuciones', {
    method: 'POST',
    body: data,
  });
}

/**
 * Obtiene el historial de tratamientos clínicos y vacunaciones.
 * Endpoint: GET /api/v1/sanidad/tratamientos
 * 
 * @param {object} [params={}] - Filtros opcionales.
 * @param {string} [params.animal_id] - UUID del cerdo.
 * @param {string} [params.corral_id] - UUID del corral.
 * @param {'vacuna' | 'tratamiento' | 'desparasitacion'} [params.tipo_evento] - Tipo de evento clínico.
 * @param {number} [params.limite=50] - Límite de registros.
 * @returns {Promise<Array<{
 *   id: string,
 *   animal_id: string,
 *   animal_arete: string,
 *   animal_alias?: string,
 *   corral_id?: string,
 *   corral_codigo?: string,
 *   veterinario_id?: string,
 *   veterinario_nombre?: string,
 *   medicamento_id?: string,
 *   tipo_evento: 'vacuna' | 'tratamiento' | 'desparasitacion',
 *   producto_nombre: string,
 *   diagnostico: string,
 *   dosis: number,
 *   unidad_dosis: string,
 *   via_administracion: string,
 *   tiempo_retiro_dias: number,
 *   fecha_tratamiento: string,
 *   fecha_proxima_dosis?: string,
 *   observaciones?: string
 * }>>}
 */
export async function getTreatments(params = {}) {
  const query = new URLSearchParams();

  if (params.animal_id && params.animal_id !== 'all') {
    query.append('animal_id', params.animal_id);
  }
  if (params.corral_id && params.corral_id !== 'all') {
    query.append('corral_id', params.corral_id);
  }
  if (params.tipo_evento && params.tipo_evento !== 'all') {
    query.append('tipo_evento', params.tipo_evento);
  }
  if (params.limite) {
    query.append('limite', String(params.limite));
  }

  const queryString = query.toString();
  const endpoint = queryString ? `/sanidad/tratamientos?${queryString}` : '/sanidad/tratamientos';
  return await apiFetch(endpoint);
}

/**
 * Registra un nuevo evento clínico/vacunación en PostgreSQL.
 * Endpoint: POST /api/v1/sanidad/tratamientos
 * 
 * @param {object} data - Datos del tratamiento.
 * @param {string} data.animal_id - UUID del animal atendido.
 * @param {string} [data.corral_id] - UUID del corral.
 * @param {string} [data.medicamento_id] - UUID del insumo del inventario para descontar stock.
 * @param {'vacuna' | 'tratamiento' | 'desparasitacion'} data.tipo_evento - Tipo de evento.
 * @param {string} data.producto_nombre - Nombre comercial del producto.
 * @param {string} data.diagnostico - Diagnóstico o motivo clínico.
 * @param {number} data.dosis - Cantidad dosificada.
 * @param {string} data.unidad_dosis - Unidad (ml, mg, dosis, etc.).
 * @param {string} data.via_administracion - Vía (Subcutánea, Intramuscular, Oral, Tópica).
 * @param {number} data.tiempo_retiro_dias - Días de restricción para faenado.
 * @param {string} [data.fecha_proxima_dosis] - Fecha de refuerzo (YYYY-MM-DD).
 * @param {string} [data.observaciones] - Notas del veterinario.
 * @returns {Promise<object>} Tratamiento registrado.
 */
export async function createTreatment(data) {
  return await apiFetch('/sanidad/tratamientos', {
    method: 'POST',
    body: data,
  });
}

/**
 * Obtiene los animales actualmente bajo tiempo de retiro farmacológico activo.
 * Endpoint: GET /api/v1/sanidad/alertas-retiro
 * 
 * @returns {Promise<Array<{
 *   id?: string,
 *   animal_id: string,
 *   animal_arete: string,
 *   animal_alias?: string,
 *   corral_codigo?: string,
 *   producto_nombre: string,
 *   fecha_tratamiento: string,
 *   tiempo_retiro_dias: number,
 *   fecha_fin_retiro: string,
 *   dias_restantes: number
 * }>>}
 */
export async function getWithdrawalAlerts() {
  return await apiFetch('/sanidad/alertas-retiro');
}

const healthService = {
  getProtocols,
  getDailyExecutions,
  toggleProtocolExecution,
  getTreatments,
  createTreatment,
  getWithdrawalAlerts,
};

export default healthService;
